
const { GoogleGenerativeAI } = require("@google/generative-ai");
const aiDB = require("./aiDB");

/** 
 * Backend AI Utility for Gemini Key Rotation
 * Supports Hierarchical Priority:
 * 1. Subscriber Master Key
 * 2. User Personal Keys
 * 3. Global Pool Rotation (Fallback)
 * 
 * IMPORTANT: Keys are loaded lazily on first call to ensure
 * dotenv has been configured before we read process.env.
 */

let GLOBAL_KEYS = null; // Lazy loaded
const MASTER_KEY_ENV = 'VITE_GEMINI_API_KEY_CORPORATE_MASTER';
const failedKeys = new Map(); // key -> expiry timestamp
let globalIndex = 0;

function loadGlobalKeys() {
    if (GLOBAL_KEYS !== null) return GLOBAL_KEYS;
    
    const keys = [];
    if (process.env.VITE_GEMINI_API_KEY) keys.push(process.env.VITE_GEMINI_API_KEY);
    for (let i = 2; i <= 100; i++) {
        const key = process.env[`VITE_GEMINI_API_KEY_${i}`];
        if (key) keys.push(key);
    }
    GLOBAL_KEYS = [...new Set(keys)];
    console.log(`[AI Utils] ✅ Global Key Pool loaded: ${GLOBAL_KEYS.length} keys available`);
    return GLOBAL_KEYS;
}

function isKeyFailed(key) {
    if (!failedKeys.has(key)) return false;
    const expiry = failedKeys.get(key);
    if (Date.now() > expiry) {
        failedKeys.delete(key); // Cooldown expired, key is available again
        return false;
    }
    return true;
}

function markKeyFailed(key, cooldownMs = 5 * 60 * 1000) {
    failedKeys.set(key, Date.now() + cooldownMs);
}

/**
 * Core function to execute AI calls with robust rotation
 */
async function callGeminiWithRotation(userId, prompt, options = {}) {
    const globalPool = loadGlobalKeys();
    
    // 1. Build key priority list
    const keysToTry = [];
    
    // Tier 1: Subscriber Master Key
    try {
        const userSub = await aiDB.getUserAISubscription(userId);
        const masterKey = process.env[MASTER_KEY_ENV];
        if (userSub && userSub.ai_subscription_status === 'SUBSCRIBER' && masterKey) {
            keysToTry.push({ key: masterKey, source: 'master' });
        }
    } catch (e) {
        console.warn('[AI Utils] Could not check subscription:', e.message);
    }

    // Tier 2: User Personal Keys
    try {
        const userKeys = await aiDB.getUserAIKeys(userId);
        userKeys.forEach(k => keysToTry.push({ key: k.api_key, source: 'personal' }));
    } catch (e) {
        console.warn('[AI Utils] Could not fetch user keys:', e.message);
    }

    // Tier 3: Global Pool - rotated starting from globalIndex
    for (let i = 0; i < globalPool.length; i++) {
        const idx = (globalIndex + i) % globalPool.length;
        keysToTry.push({ key: globalPool[idx], source: 'global' });
    }

    // Deduplicate by key value, keeping first occurrence (highest priority)
    const seen = new Set();
    const finalKeyList = keysToTry.filter(entry => {
        if (seen.has(entry.key)) return false;
        seen.add(entry.key);
        return true;
    });

    if (finalKeyList.length === 0) {
        throw new Error("Tidak ada API Key yang tersedia. Silakan masukkan API Key di profil Anda.");
    }

    console.log(`[AI Utils] Starting rotation with ${finalKeyList.length} keys (globalIndex: ${globalIndex})`);

    let lastError = null;
    let attemptCount = 0;

    // Helper: sleep untuk exponential backoff
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper: klasifikasi jenis error
    const classifyError = (error) => {
        const msg = error.message?.toLowerCase() || "";
        const status = error.status || error.statusCode || 0;
        return {
            isOverload:    msg.includes("503") || msg.includes("service unavailable") || msg.includes("overloaded") || msg.includes("high demand") || status === 503,
            isQuota:       msg.includes("quota") || msg.includes("exhausted") || msg.includes("429") || msg.includes("too many") || status === 429,
            isInvalidKey:  msg.includes("api_key_invalid") || msg.includes("forbidden") || msg.includes("401") || status === 401,
            isTimeout:     msg.includes("timeout") || msg.includes("deadline") || msg.includes("etimedout"),
            isNotFound:    msg.includes("not found") || msg.includes("404") || status === 404,
        };
    };

    // Helper: parse JSON aman
    const parseJsonSafe = (text) => {
        let cleanText = text.trim();
        if (cleanText.startsWith("\`\`\`json")) cleanText = cleanText.substring(7);
        else if (cleanText.startsWith("\`\`\`")) cleanText = cleanText.substring(3);
        if (cleanText.endsWith("\`\`\`")) cleanText = cleanText.substring(0, cleanText.length - 3);
        cleanText = cleanText.trim();
        if (!cleanText.endsWith("}") && !cleanText.endsWith("]")) {
            const lastBrace   = cleanText.lastIndexOf("}");
            const lastBracket = cleanText.lastIndexOf("]");
            const lastIdx     = Math.max(lastBrace, lastBracket);
            if (lastIdx !== -1) cleanText = cleanText.substring(0, lastIdx + 1);
        }
        return JSON.parse(cleanText);
    };

    // Helper: coba satu request dengan backoff pada overload, dan rotasi model
    const tryWithBackoff = async (entry, contents) => {
        const MAX_OVERLOAD_RETRIES = 3;
        const BASE_DELAY_MS = 4000; // 4 detik, naik 2× tiap retry

        const fallbackModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
        const modelsToTry = options.model ? [options.model] : fallbackModels;

        let lastModelError = null;

        for (const modelName of modelsToTry) {
            for (let retry = 0; retry <= MAX_OVERLOAD_RETRIES; retry++) {
                try {
                    const genAI = new GoogleGenerativeAI(entry.key);
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            responseMimeType: options.isJson ? "application/json" : "text/plain"
                        }
                    });

                    const result   = await model.generateContent({ contents });
                    const response = await result.response;
                    const text     = response.text();

                    return options.isJson ? parseJsonSafe(text) : text;

                } catch (error) {
                    const { isOverload, isQuota, isInvalidKey, isTimeout, isNotFound } = classifyError(error);

                    if ((isOverload || isTimeout) && retry < MAX_OVERLOAD_RETRIES) {
                        const delayMs = BASE_DELAY_MS * Math.pow(2, retry);
                        console.warn(`[AI Utils] ⏳ Overload/timeout on ${modelName} with ${entry.source}:...${entry.key.slice(-6)}, retry ${retry + 1}/${MAX_OVERLOAD_RETRIES} in ${delayMs / 1000}s`);
                        await sleep(delayMs);
                        continue;
                    }

                    if (isNotFound || isQuota) {
                        console.warn(`[AI Utils] 🔄 Model ${modelName} unavailable (NotFound/Quota), falling back to next model...`);
                        lastModelError = Object.assign(error, { _classified: { isOverload, isQuota, isInvalidKey, isTimeout, isNotFound } });
                        break; // Break the retry loop, move to the next modelName
                    }

                    // Jika error invalid key atau lainnya, lempar agar key ini ditandai failed
                    throw Object.assign(error, { _classified: { isOverload, isQuota, isInvalidKey, isTimeout, isNotFound } });
                }
            }
        }
        
        // Jika semua model gagal untuk key ini
        if (lastModelError) throw lastModelError;
    };

    // Bangun contents sekali (dipakai ulang di semua key)
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    if (options.image) {
        const base64Data = options.image.split(',')[1] || options.image;
        contents[0].parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }

    for (const entry of finalKeyList) {
        if (isKeyFailed(entry.key)) {
            console.log(`[AI Utils] ⏭ Skipping ${entry.source} key ...${entry.key.slice(-6)} (in cooldown)`);
            continue;
        }

        attemptCount++;
        const keyLabel = `${entry.source}:...${entry.key.slice(-6)}`;
        console.log(`[AI Utils] 🔑 Trying key ${keyLabel} (attempt ${attemptCount})`);

        try {
            const parsedResult = await tryWithBackoff(entry, contents);

            // Sukses → advance global index
            if (entry.source === 'global') {
                const keyIdx = globalPool.indexOf(entry.key);
                if (keyIdx !== -1) globalIndex = (keyIdx + 1) % globalPool.length;
            }
            console.log(`[AI Utils] ✅ Success with key ${keyLabel}`);
            return parsedResult;

        } catch (error) {
            lastError = error;
            const { isOverload, isQuota, isInvalidKey } = error._classified || classifyError(error);

            console.warn(`[AI Utils] ❌ Key ${keyLabel} exhausted: ${isOverload ? 'OVERLOAD' : isQuota ? 'QUOTA' : isInvalidKey ? 'INVALID' : 'OTHER'} - ${error.message?.substring(0, 120)}`);

            if (isQuota || isOverload) {
                markKeyFailed(entry.key, 5 * 60 * 1000);
                if (entry.source === 'global') {
                    const keyIdx = globalPool.indexOf(entry.key);
                    if (keyIdx !== -1) globalIndex = (keyIdx + 1) % globalPool.length;
                }
                continue;
            } else if (isInvalidKey) {
                markKeyFailed(entry.key, 60 * 60 * 1000);
                continue;
            } else {
                continue;
            }
        }
    }

    console.error(`[AI Utils] 🚨 ALL ${attemptCount} keys exhausted. Pool: ${finalKeyList.length}, Cooldown: ${failedKeys.size}`);

    // Sertakan kode error agar frontend bisa tampilkan pesan spesifik
    const finalMsg = lastError?.message?.toLowerCase() || "";
    const isOverloadFinal = finalMsg.includes("503") || finalMsg.includes("service unavailable") || finalMsg.includes("overloaded") || finalMsg.includes("high demand");
    const errorToThrow = lastError || new Error("Semua API Key gagal memproses permintaan.");
    errorToThrow.aiErrorCode = isOverloadFinal ? "AI_OVERLOAD" : "AI_ALL_KEYS_FAILED";
    throw errorToThrow;
}

module.exports = {
    callGeminiWithRotation
};
