
import { db } from "./db";
import { SocialImpactData } from "../types";

export interface DetectedItem {
  name: string;
  category: 'Daging Merah' | 'Unggas & Telur' | 'Ikan & Seafood' | 'Karbohidrat' | 'Sayur & Buah' | 'Lainnya';
}

export interface ImpactBreakdownItem {
  name: string;
  weightKg: number;
  factor: number;
  result: number;
  category: string;
}

export interface DetailedSocialImpact extends SocialImpactData {
  co2Breakdown: ImpactBreakdownItem[];
  socialBreakdown: ImpactBreakdownItem[];
  portionCount: number;
  co2PerPortion: number;
  pointsPerPortion: number;
}

export interface QualityAnalysisResult {
  isSafe: boolean;
  isHalal: boolean;
  halalScore: number;
  halalReasoning: string;
  reasoning: string;
  shelfLifePrediction: string;
  hygieneScore: number;
  qualityPercentage: number;
  detectedItems: DetectedItem[];
  detectedCategory: string;
  storageTips: string[];
  physicalCheckTips?: string[];
  reheatingTips?: string[];
  packagingTips?: string[];
  repurposeIdeas?: string[];
  crossContaminationWarning?: string;
  socialImpact: DetailedSocialImpact;
}

/**
 * Service for Food Quality and Safety Verification
 */
export const foodVerification = {
  analyze: async (
    imageBase64?: string,
    context?: any
  ): Promise<QualityAnalysisResult> => {
    console.log('[AI SERVICE] Delegating food analysis to backend...');
    
    try {
      const payload = {
        foodName: context?.foodName,
        ingredients: context?.ingredients,
        madeTime: context?.madeTime,
        distributionStart: context?.distributionStart,
        storageLocation: context?.storageLocation,
        weightGram: context?.weightGram,
        image: imageBase64
      };

      const aiResult = await db.verifyFood(payload, context?.userId || 'system');

      const appSettings = await db.getSettings();

      // Local impact calculation logic
      const socialImpact = calculateDetailedImpact(
        aiResult.detectedItems || [],
        context?.weightGram || 500,
        context?.packagingType || 'plastic',
        context?.quantityCount || 1,
        appSettings
      );


      return {
        ...aiResult,
        detectedCategory: aiResult.detectedItems?.[0]?.category || 'Lainnya',
        socialImpact
      };

    } catch (error) {
      console.error('[AI SERVICE] Backend analysis failed, using fallback:', error);
      
      const fallbackItems: DetectedItem[] = [{ name: context?.foodName || "Makanan", category: "Lainnya" }];
      const appSettings = await db.getSettings();
      const fallbackImpact = calculateDetailedImpact(
        fallbackItems,
        context?.weightGram || 500,
        'plastic',
        context?.quantityCount || 1,
        appSettings
      );


      return {
        isSafe: true, isHalal: true, halalScore: 80, halalReasoning: "Fallback analysis", reasoning: "Gagal menghubungi AI Server. Menggunakan estimasi standar.",
        shelfLifePrediction: "4 Jam", hygieneScore: 80, qualityPercentage: 80,
        detectedItems: fallbackItems, detectedCategory: 'Lainnya', storageTips: ["Simpan di tempat kering"],
        socialImpact: fallbackImpact
      };
    }
  }
};

// ==========================================
// EMISSION & SOCIAL IMPACT FACTORS (Shared)
// ==========================================

const EMISSION_FACTORS: Record<string, number> = {
  'Sayur & Buah': 0.4,
  'Karbohidrat': 0.8,
  'Unggas & Telur': 3.5,
  'Ikan & Seafood': 4.5,
  'Daging Merah': 18.0,
  'Lainnya': 1.2
};

const SOCIAL_IMPACT_FACTORS: Record<string, number> = {
  'Sayur & Buah': 1.2,
  'Karbohidrat': 1.5,
  'Unggas & Telur': 2.2,
  'Ikan & Seafood': 2.5,
  'Daging Merah': 3.0,
  'Lainnya': 1.0
};

const calculateDetailedImpact = (
  items: DetectedItem[], 
  weightGram: number, 
  packaging: string,
  quantityCount: number = 1,
  appSettings: any = {}
): DetailedSocialImpact => {
  const count = items.length || 1;
  const weightPerItem = (weightGram / count) / 1000; // to kg

  // Helper to format numbers to 2 decimal places max
  const formatNum = (num: number) => Number(num.toFixed(2));

  // Dynamically adjust CO2 calculations using config multiplier (if available, scale against average factor 2.5)
  const co2Scale = appSettings.co2Multiplier ? parseFloat(appSettings.co2Multiplier) / 2.5 : 1.0;

  const co2Breakdown: ImpactBreakdownItem[] = items.map(item => ({
    name: item.name,
    weightKg: formatNum(weightPerItem),
    factor: formatNum((EMISSION_FACTORS[item.category] || 1.2) * co2Scale),
    result: formatNum(weightPerItem * ((EMISSION_FACTORS[item.category] || 1.2) * co2Scale)),
    category: item.category
  }));

  const socialBreakdown: ImpactBreakdownItem[] = items.map(item => ({
    name: item.name,
    weightKg: formatNum(weightPerItem),
    factor: formatNum(SOCIAL_IMPACT_FACTORS[item.category] || 1.0),
    result: formatNum(weightPerItem * (SOCIAL_IMPACT_FACTORS[item.category] || 1.0)),
    category: item.category
  }));

  const pointsMultiplier = appSettings.pointsPerKg !== undefined ? parseFloat(appSettings.pointsPerKg) : 100;

  const totalCo2 = co2Breakdown.reduce((sum, item) => sum + item.result, 0) * quantityCount;
  const totalPoints = Math.round(socialBreakdown.reduce((sum, item) => sum + item.result, 0) * pointsMultiplier * quantityCount);

  return {
    co2Saved: formatNum(totalCo2),
    totalPoints: totalPoints, // Already rounded to integer via Math.round
    waterSaved: 0,
    landSaved: 0,
    wasteReduction: formatNum(weightGram * quantityCount / 1000), // waste reduction in kg
    co2Breakdown,
    socialBreakdown,
    portionCount: quantityCount,
    co2PerPortion: formatNum(totalCo2 / quantityCount),
    pointsPerPortion: formatNum(totalPoints / quantityCount)
  };
};
