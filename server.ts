/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("API_KEY")) {
      console.warn("GEMINI_API_KEY is not set or is a placeholder. Using robust fallback simulated AI responses.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.error("Error creating GoogleGenAI client:", e);
      return null;
    }
  }
  return aiClient;
}

// 1. AI Product Prediction & Recommended Discount Rate
app.post("/api/gemini/analyze-product", async (req, res) => {
  const { name, originalPrice, quantity, category, expiryDate } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Return high quality mock prediction values
    const originalNum = Number(originalPrice) || 5000;
    const baseRate = category === 'bakery' ? 45 : category === 'cafe' ? 50 : category === 'convenience' ? 60 : category === 'side' ? 35 : 40;
    const recommendedRate = Math.min(80, Math.max(20, baseRate + (quantity > 10 ? 15 : quantity > 5 ? 5 : 0)));
    const probability = Math.floor(Math.random() * 20) + 75; // 75% - 95%
    const risk = quantity > 12 ? 'HIGH' : (quantity > 5 ? 'MEDIUM' : 'LOW');
    
    const marketingHooks: Record<string, string[]> = {
      bakery: [
        `🍞 천연 발효종으로 구워 쫄깃 고소한 ${name}! 오늘 마감 전에 데려가시면 가성비 끝판왕 갓빵 등극!`,
        `🥐 당일 구워내 바삭함이 가득 차 있는 ${name}! 마감 컷! 버려지기엔 너무 아까운 맛이에요.`
      ],
      cafe: [
        `☕ 달콤 시원한 휴식 타임! 기분 좋은 풍미의 ${name}, 딱 지금만 누릴 수 있는 특별 할인가!`,
        `🧁 지친 오후를 깨우는 달콤 힐링! ${name} 마감 한정 수량, 어서 선점하세요!`
      ],
      convenience: [
        `🍱 오늘 한 끼 든든하게 해결할 구원자! ${name}, 초특가 득템 찬스로 든든하고 환경도 살려요!`,
        `🍙 한 번 맛보면 헤어나올 수 없는 풍성한 구성의 ${name}! 폐기 위기 탈출 작전 시작!`
      ],
      side: [
        `🍳 집밥 느낌 그대로, 엄마의 정성이 가득한 맛있는 ${name}! 오늘 저녁 반찬 걱정 끝!`,
        `🥗 한정 수량 특급 세일! 저녁 밥상을 푸짐하게 만들어줄 신선 ${name} 데려가세요.`
      ],
      mart: [
        `🍎 알뜰살뜰 장보기 끝판왕! 산지 직송 부럽지 않은 신선 ${name}, 폐기 Zero 기동대 특별가!`,
        `🥩 가계 부담은 반으로, 맛은 두 배로! ${name} 한정 세일, 초특가로 득템하세요!`
      ]
    };

    const list = marketingHooks[category] || [
      `🌟 ESG 녹색 수호대 추천! 맛과 퀄리티 보장된 ${name}, 오늘 단 하루 지구 살리기 할인가로 공급합니다.`
    ];
    const hook = list[Math.floor(Math.random() * list.length)];

    return res.json({
      risk,
      recommendedRate,
      probability,
      hook
    });
  }

  try {
    const prompt = `유통기한 임박 및 마감 폐기 예정 식품의 AI 판매 분석을 수행해주세요.
식품 정보:
- 상품명: ${name}
- 카테고리: ${category}
- 원래 가격(정가): ${originalPrice}원
- 현재 남은 수량: ${quantity}개
- 유통기한/폐기 예정 시각: ${expiryDate}

다음 JSON 구조로 응답해주세요:
{
  "risk": "HIGH" | "MEDIUM" | "LOW" (폐기될 위험도 분석),
  "recommendedRate": 원래 가격 대비 추천 할인율 (숫자만, 예: 45),
  "probability": 이 할인율 적용 시 당일 완판/재고 소진 확률 (숫자만, 예: 85),
  "hook": "소비자들의 관심을 끌어당길 신선하고 센스 있는 한글 마케팅 홍보 문구 (예: 마감 세일 문구)"
}
한국어 구어체로 부드럽고 매력적인 톤으로 마케팅 문구를 생성해주세요. 친환경, 가치소비, 당일생산 등의 매력 키워드를 녹여주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            risk: { type: Type.STRING, description: "HIGH, MEDIUM, or LOW" },
            recommendedRate: { type: Type.INTEGER, description: "Recommended discount rate percentage (e.g. 50)" },
            probability: { type: Type.INTEGER, description: "Stock clearance probability percentage (e.g. 85)" },
            hook: { type: Type.STRING, description: "Slogan tagline in Korean" }
          },
          required: ["risk", "recommendedRate", "probability", "hook"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 2. AI Personalized Carbon & ESG Report
app.post("/api/gemini/generate-carbon-report", async (req, res) => {
  const { foodRescuedCount, carbonSavedKg, moneySavedWon } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // High-quality local mock generator
    const treeEquivalent = Number((carbonSavedKg / 6.6).toFixed(1));
    return res.json({
      summary: `이번 달에 총 ${foodRescuedCount}개의 음식을 구조하여 탄소 배출량 ${carbonSavedKg}kg을 줄이고, ${moneySavedWon.toLocaleString()}원을 아끼는 엄청난 성과를 기록했습니다!`,
      detailedAnalysis: `회원님이 구조하신 음식들은 유통기한이 임박했던 가치 높은 식품들입니다. 이들을 매립지 폐기 대신 구매함으로써 폐기 과정의 유기 가스 방출을 막고 신선하게 소비했습니다. 이로 인해 저감된 이산화탄소 ${carbonSavedKg}kg은 30년생 소나무 약 ${treeEquivalent}그루가 1년간 공기 중에서 흡수해야 하는 이산화탄소 흡수량과 완전히 같은 환경적 가치를 지닙니다. 소상공인의 폐기물 처리 부담금도 덜어주셨습니다!`,
      recommendations: [
        "수령한 빵이나 떡류는 당장 먹지 않는다면 즉시 지퍼백에 밀봉하여 냉동 보관하면 수분 손실 없이 오래 드실 수 있어요.",
        "신선 반찬류는 수령 후 가급적 냉장고 신선칸 안쪽(약 2~4℃)에 바로 보관하시고 2일 이내 드시는 것을 권장합니다.",
        "자주 방문하는 동네 빵집과 마트의 단골 설정을 유지하면 '마감임박' Push 알림을 가장 먼저 받아 가장 저렴할 때 알뜰 구조가 가능합니다!"
      ]
    });
  }

  try {
    const prompt = `소비자의 임박 음식 구조 실적을 바탕으로 맞춤형 'AI 환경 및 탄소 절감 효과 리포트'를 한글로 정교하게 생성해주세요.
실적 데이터:
- 구조한 음식 수: ${foodRescuedCount}개
- 절감한 이산화탄소(CO2): ${carbonSavedKg}kg
- 절약한 금액: ${moneySavedWon}원

다음 JSON 구조로 반환해주세요:
{
  "summary": "핵심 성과 요약 한줄평 (친근하고 따뜻한 격려 톤)",
  "detailedAnalysis": "환경적 의미와 탄소 배출 감소가 실제로 지구에 주는 구체적인 기여 분석 (예: 소나무 효과 환산 등)",
  "recommendations": ["환경 보호 및 구조한 식품 보관/소비 팁 3가지 리스트"]
}
어조는 매우 친근하고 격려하며 가치를 부여하는 한글 문체로 작성해주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            detailedAnalysis: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "detailedAnalysis", "recommendations"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 3. AI Smart Recommended Products matching
app.post("/api/gemini/recommendations", async (req, res) => {
  const { products, preferredCategory } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    const recommendedList = products.map((p: any) => {
      let reason = `현재 마감 시간 한 시간 전인 골든 타임 상품입니다.`;
      if (p.category === 'bakery') {
        reason = `오늘 아침 매장에서 신선하게 구운 식빵류로, 방부제가 들어있지 않아 맛과 탄소 저감 가치가 가장 높은 최적의 매칭입니다.`;
      } else if (p.category === 'convenience') {
        reason = `간편하게 든든한 한끼 식사가 가능하며, 삼각김밥/도시락류는 폐기 마감 전 구매율이 가장 높아 멸종 위기 음식을 살리는 긴급 픽업 대상입니다.`;
      } else if (p.category === 'cafe') {
        reason = `쌉싸름한 아메리카노와 어울리는 촉촉한 디저트입니다. 기분 전환을 하면서 탄소 배출도 줄일 수 있는 일석이조 가치 소비 아이템입니다.`;
      } else if (p.category === 'side') {
        reason = `조미료를 최소화하여 만든 정갈한 가치 소비 밑반찬입니다. 바쁜 저녁 한 끼 밥상을 환경 사랑과 저렴함으로 가득 채워줍니다.`;
      } else if (p.category === 'mart') {
        reason = `신선 냉장 보관 중인 마트 고품질 제품으로 정가 대비 할인율 폭이 가장 크며, 쓰레기 매립 매연 저감에 으뜸 기여를 합니다.`;
      }
      return {
        productId: p.id,
        reason
      };
    });
    return res.json({ recommendations: recommendedList });
  }

  try {
    const productSummary = products.map((p: any) => `ID: ${p.id}, 이름: ${p.name}, 정가: ${p.originalPrice}, 할인가: ${p.discountPrice}, 유통기한: ${p.expiryDate}, 카테고리: ${p.category}`).join("\n");
    const prompt = `사용자의 선호 카테고리(${preferredCategory || "전체"})와 환경 보호 트렌드를 고려하여, 현재 판매 중인 임박 식품 리스트 중 AI 맞춤형 추천 상품과 매칭 이유를 정교하게 작성해주세요.
    
판매 중인 식품 리스트:
${productSummary}

다음 JSON 구조로 반환해주세요:
{
  "recommendations": [
    {
      "productId": "식품 ID",
      "reason": "소비자에게 해당 식품을 추천하는 개별 맞춤형 한글 이유 설명 (예: 저녁 반찬 고민 해결, 신선도가 매우 우수함, 마감 임박으로 탄소 절감 기여도 극대화 등)"
    }
  ]
}
친절하고 맛깔나는 마케팅 톤으로 작성해주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["productId", "reason"]
              }
            }
          },
          required: ["recommendations"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 4. Real-time Food Image Search Crawler
app.post("/api/crawl-food-image", async (req, res) => {
  const { query, category } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });

    if (response.ok) {
      const html = await response.text();
      // Match image IDs from Unsplash search page
      const regex = /https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9-]+)/g;
      const matches = Array.from(html.matchAll(regex));
      
      if (matches && matches.length > 0) {
        const uniqueIds = Array.from(new Set(matches.map(m => m[1])));
        // Index 1 or 2 is usually the first main high-resolution image
        const selectedId = uniqueIds[1] || uniqueIds[0];
        const imageUrl = `https://images.unsplash.com/photo-${selectedId}?w=600&auto=format&fit=crop&q=80`;
        return res.json({ imageUrl, crawled: true });
      }
    }
  } catch (e) {
    console.warn("Crawl failed, fallback to curated images:", e);
  }

  // Predefined gorgeous fallbacks based on keyword matching
  const fallbacks: { keywords: string[]; url: string }[] = [
    { keywords: ["딸기", "과일", "strawberry", "apple", "fruit"], url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80" },
    { keywords: ["제육", "고기", "pork", "meat", "beef"], url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80" },
    { keywords: ["나물", "반찬", "vegetable", "salad"], url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80" },
    { keywords: ["식빵", "빵", "bakery", "bread", "소보루", "단팥빵"], url: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80" },
    { keywords: ["치즈", "케이크", "cake", "dessert", "마카롱"], url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80" },
    { keywords: ["샌드위치", "sandwich"], url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80" },
    { keywords: ["커피", "카페", "coffee", "cafe", "음료"], url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80" },
    { keywords: ["도시락", "밥", "bento", "rice"], url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80" }
  ];

  for (const f of fallbacks) {
    if (f.keywords.some(k => query.toLowerCase().includes(k))) {
      return res.json({ imageUrl: f.url, crawled: false });
    }
  }

  // Fallback category images
  const categoryImages: Record<string, string> = {
    bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    convenience: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    side: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
    mart: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'
  };

  const defaultImg = categoryImages[category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  return res.json({ imageUrl: defaultImg, crawled: false });
});

// 5. AI Food Photo Carbon footprint Analyzer
app.post("/api/gemini/analyze-carbon-photo", async (req, res) => {
  const { imageBase64, mimeType } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "Image data is required" });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Return a high fidelity mock carbon analysis with detailed ingredients breakdown
    const items = [
      {
        foodName: "소고기 수제 햄버거 패티 세트",
        estimatedWeight: "약 450g (1인분)",
        carbonFootprintKg: 6.8,
        carbonLevel: "HIGH",
        equivalentTrees: 1.03,
        carbonAnalysis: "이 소고기 수제 햄버거 세트의 총 탄소 발자국은 약 6.8kg CO2e로 고탄소 식단에 해당합니다. 소고기는 메탄가스 배출 및 사료 가공 에너지 소모로 인해 다른 육류보다 약 3~5배 이상 많은 온실가스를 발생시킵니다. 수제 패티(약 150g)만으로 약 4.05kg의 CO2가 발생하며, 치즈와 소스 등 유제품 가공과 밀가루 빵(번) 제조, 감자 튀김의 튀김 기름 열 에너지 등이 추가적인 탄소 유발 요인입니다.",
        earthSavingTips: [
          "패티를 대체 단백질(두부, 버섯, 콩고기)로 구성된 식단으로 전환해보세요. 탄소량이 85% 이상 감소합니다.",
          "유통기한 임박 식재료를 '라스트픽' 플랫폼에서 구출하여 남김없이 소비하는 것만으로도 폐기 시 생기는 온실가스를 100% 방지할 수 있습니다.",
          "지역에서 생산되는 친환경 로컬 푸드 농산물 토핑(양상추, 토마토)을 사용하면 유통 마일리지를 크게 줄여 배출을 최소화합니다."
        ],
        recommendedAlternative: "베이커리(샌드위치) 혹은 편의점(샐러드) 카테고리의 채식 임박 상품을 이용해보세요! 한 끼에 5.8kg의 탄소를 직접 감축하고 70% 할인 득템도 가능합니다.",
        ingredients: [
          { name: "소고기 패티", weightG: 150, co2G: 4050, ratio: 60 },
          { name: "밀가루 빵 (번)", weightG: 80, co2G: 104, ratio: 15 },
          { name: "가공 치즈 (유제품)", weightG: 30, co2G: 357, ratio: 12 },
          { name: "감자 및 튀김용 식물성유", weightG: 120, co2G: 144, ratio: 9 },
          { name: "양상추 & 소스", weightG: 70, co2G: 145, ratio: 4 }
        ]
      },
      {
        foodName: "모듬 수제 마카롱과 생크림 디저트",
        estimatedWeight: "약 150g (3개 분량)",
        carbonFootprintKg: 1.2,
        carbonLevel: "MEDIUM",
        equivalentTrees: 0.18,
        carbonAnalysis: "이 디저트 세트의 총 탄소 발자국은 약 1.2kg CO2e로 중탄소 식단에 해당합니다. 버터, 우유, 생크림 같은 유제품 가공품과 달걀 흰자가 주원료이기 때문입니다. 젖소 사육 중 배출되는 가스 및 냉장 유통망 가동 에너지가 주된 이산화탄소 배출원이며, 제과 오븐의 고온 가열 열에너지 소비도 한 몫을 차지합니다.",
        earthSavingTips: [
          "비건 제과점의 쌀가루와 식물성 크림 기반 디저트를 골라 가치소비해보세요.",
          "라스트픽의 베이커리 마감할인을 통해 유기 수치가 높은 달콤함을 반값에 구원하고, 매립지의 탄소 배출도 저지하세요.",
          "텀블러를 챙겨 매장에 픽업 가면 일회용 포장 용기 제조에서 나오는 숨은 탄소 0.15kg까지 완전히 절감할 수 있습니다."
        ],
        recommendedAlternative: "카페 및 베이커리 카테고리의 무설탕/비건 임박 디저트 상품을 추천합니다. 친환경 인증 빵류 구출 시 탄소 40% 추가 절감 효과가 있습니다.",
        ingredients: [
          { name: "생크림 및 우유 (유제품)", weightG: 60, co2G: 714, ratio: 60 },
          { name: "달걀 (아몬드가루 포함)", weightG: 40, co2G: 192, ratio: 16 },
          { name: "설탕 및 가공 감미료", weightG: 35, co2G: 94, ratio: 14 },
          { name: "포장 및 매장 가공 에너지", weightG: 15, co2G: 200, ratio: 10 }
        ]
      },
      {
        foodName: "아보카도 훈제연어 샐러드 팩",
        estimatedWeight: "약 300g (1인분)",
        carbonFootprintKg: 0.85,
        carbonLevel: "LOW",
        equivalentTrees: 0.13,
        carbonAnalysis: "이 아보카도 훈제연어 샐러드는 약 0.85kg CO2e의 저탄소 친환경 건강 식단입니다. 신선 채소류의 경우 온실가스 배출 계수가 매우 낮아 환경 수호에 탁월합니다. 다만, 멕시코산 아보카도 및 원거리 수입산 연어의 장거리 수송 물류(푸드 마일리지)로 인해 로컬 식단보다는 탄소가 소폭 발생하였습니다.",
        earthSavingTips: [
          "국내산 제철 과일과 채소 토핑을 고르면 유통 거리가 짧아져 탄소가 즉시 절반 이하로 감소합니다.",
          "먹을 만큼만 덜어서 끝까지 신선하게 소비하여 완판 문화를 정착시켜 주세요.",
          "유통기한 마감 전 '라스트픽' 마트 카테고리의 샐러드 팩을 즉시 구조하면, 폐기 매립으로 발생할 이산화탄소를 완벽 방어합니다."
        ],
        recommendedAlternative: "유기농마트 및 반찬가게 카테고리에서 친환경 제철 나물이나 로컬 신선 야채 임박 상품을 골라보세요!",
        ingredients: [
          { name: "수입산 아보카도 및 채소류", weightG: 210, co2G: 168, ratio: 45 },
          { name: "훈제 연어 (수산물)", weightG: 50, co2G: 270, ratio: 32 },
          { name: "올리브유 드레싱", weightG: 25, co2G: 112, ratio: 13 },
          { name: "수송 및 항공 푸드마일리지", weightG: 15, co2G: 300, ratio: 10 }
        ]
      }
    ];

    // Pick based on base64 string length or return randomly to simulate analysis
    const selectedMock = items[imageBase64.length % items.length];
    return res.json(selectedMock);
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: base64Data
          }
        },
        {
          text: `당신은 전 세계의 ESG 연구 및 친환경 식품 산업을 주도하는 최고 권위의 '식품 탄소 발자국 정밀 분석 인공지능 전문가'입니다.
업로드된 음식 또는 식료품 사진을 극도로 정밀하게 스캔하여, 음식 내에 포함된 개별 식자재 성분들을 정확하게 분해하고, 공신력 있는 IPCC 및 FAO 탄소 배출량 표준 통계를 기반으로 한 엄격한 수학적 연산을 통해 최고의 신뢰도를 갖춘 탄소 발자국 리포트를 한글로 작성해 주세요.

[정밀 분석 가이드라인 - 탄소 계산 표준 법칙]
1. 사진 속에 찍힌 주재료와 부재료를 육안 판별하고, 1인분(또는 사진에 나타난 전량) 기준의 예상 중량을g(그램) 단위로 추정합니다.
2. 각 식자재 성분별로 다음의 고착화된 표준 탄소 배출 계수(1kg당 CO2 상당량)를 적용하여 정교하게 곱한 후 합산하십시오.
   - 소고기(Beef): 27.0 kg CO2e / kg (가장 높은 배출원)
   - 돼지고기(Pork): 12.1 kg CO2e / kg
   - 닭고기/가금류(Poultry): 6.9 kg CO2e / kg
   - 생선/수산물(Fish/Seafood): 5.4 kg CO2e / kg
   - 유제품(치즈, 버터, 크림, 우유): 11.9 kg CO2e / kg
   - 달걀/알류(Eggs): 4.8 kg CO2e / kg
   - 밀가루/빵/곡류/밥(Rice/Wheat): 1.3 kg CO2e / kg
   - 가공 소스 및 유지류(Oil/Sauces): 4.5 kg CO2e / kg
   - 채소/야채/과일/기타 식물성 원재료(Vegetables/Fruits): 0.4 kg CO2e / kg
3. 전체 성분의 합산 탄소배출량을 'carbonFootprintKg'로 설정하십시오.
4. 소나무 그루수('equivalentTrees')는 국립산림과학원 통계(30년생 소나무 한 그루의 연간 이산화탄소 흡수량 = 약 6.6kg)에 기반하여 다음의 수식으로 정확히 산출하십시오:
   - 공식: equivalentTrees = (carbonFootprintKg / 6.6) 의 반올림 소수점 둘째자리 값.
5. 탄소배출 등급('carbonLevel') 기준:
   - LOW: 총 배출량 1.0kg 이하 (환경 친화적 식단)
   - MEDIUM: 총 배출량 1.0kg 초과 ~ 3.0kg 이하 (중등 수준)
   - HIGH: 총 배출량 3.0kg 초과 (주의가 필요한 고탄소 육식 위주 식단)

필요한 반환 JSON 구조:
{
  "foodName": "식별된 구체적 음식명",
  "estimatedWeight": "추정 총 중량 및 분량 설명 (예: 약 380g, 1.2인분)",
  "carbonFootprintKg": 4.12, // 총 합산 이산화탄소 배출량 (숫자만, kg 단위)
  "carbonLevel": "HIGH" | "MEDIUM" | "LOW",
  "equivalentTrees": 0.62, // 상쇄에 필요한 연간 소나무 그루수 (수식 결과 적용)
  "carbonAnalysis": "음식을 구성하는 주요 원재료에 따른 탄소 배출량 발생 요인 설명 및 푸드 마일리지, 공정 에너지를 깊이 있게 해설한 정밀 진단 텍스트 (전문적이고 신뢰도 높은 한글 해설)",
  "earthSavingTips": [
    "탄소 발자국을 더 줄이기 위한 실질적인 행동 조언, 식자재 보관법, 마감할인 '라스트픽' 구출 활용 팁 3가지"
  ],
  "recommendedAlternative": "소비자가 이 메뉴를 선호한다면, 탄소를 대폭 줄이면서 만족감을 채울 수 있는 최적의 대체 저탄소 식단 또는 라스트픽 내의 추천 카테고리 제품 추천",
  "ingredients": [
    {
      "name": "식재료 성분명 (예: 소고기 패티, 생크림, 양상추 등)",
      "weightG": 150, // 추정 무게 (그램)
      "co2G": 4050, // 이 성분에서 발생하는 이산화탄소량 (g 단위, weightG * 배출계수)
      "ratio": 65 // 총 발생 탄소량 중 본 재료가 차지하는 백분율 비율 (0~100)
    }
  ]
}

주의: 반환되는 모든 한글 텍스트는 신뢰할 수 있고 정확하며 전문적인 어조를 지키되, 일반 소비자도 쉽게 체감할 수 있는 따뜻한 뉘앙스를 유지해 주십시오.`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            estimatedWeight: { type: Type.STRING },
            carbonFootprintKg: { type: Type.NUMBER },
            carbonLevel: { type: Type.STRING },
            equivalentTrees: { type: Type.NUMBER },
            carbonAnalysis: { type: Type.STRING },
            earthSavingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedAlternative: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  weightG: { type: Type.NUMBER },
                  co2G: { type: Type.NUMBER },
                  ratio: { type: Type.NUMBER }
                },
                required: ["name", "weightG", "co2G", "ratio"]
              }
            }
          },
          required: ["foodName", "estimatedWeight", "carbonFootprintKg", "carbonLevel", "equivalentTrees", "carbonAnalysis", "earthSavingTips", "recommendedAlternative", "ingredients"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API photo analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze food photo carbon footprint" });
  }
});

// Setup Vite Dev server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
