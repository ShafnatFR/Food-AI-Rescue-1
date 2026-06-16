const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function testDeepSeek() {
    console.log(`Testing DeepSeek API with key: ${apiKey.substring(0, 8)}...`);
    
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'user', content: 'Say only: OK' }
                ],
                max_tokens: 10
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Status: OK');
            console.log('Response:', data.choices[0].message.content.trim());
        } else {
            console.error('❌ Error testing API:');
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testDeepSeek();
