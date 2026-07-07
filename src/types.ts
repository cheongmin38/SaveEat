/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  quantity: number;
  expiryDate: string; // e.g., "오늘 20:00", "내일 14:00"
  pickupTime: string;  // e.g., "18:00 ~ 21:00"
  category: 'bakery' | 'convenience' | 'cafe' | 'side' | 'mart';
  imageUrl: string;
  aiProbability?: number; // AI 재고 소진 확률 (%)
  aiRisk?: 'HIGH' | 'MEDIUM' | 'LOW'; // 폐기 위험도
  aiHook?: string; // AI 추천 후킹 문구
}

export interface Store {
  id: string;
  name: string;
  category: 'bakery' | 'convenience' | 'cafe' | 'side' | 'mart';
  address: string;
  lat: number; // For map view simulation (offset coords around a center)
  lng: number;
  rating: number;
  reviewsCount: number;
  distance: number; // in meters (e.g., 340)
  isSubscribed: boolean;
  imageUrl: string;
  isOpen: boolean;
  description?: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  storeId: string;
  storeName: string;
  pickupTime: string;
  reservedAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  qrCode: string;
  carbonSaved: number; // in kg CO2
  moneySaved: number;  // in KRW
}

export interface UserStats {
  foodRescuedCount: number; // 구조한 음식 수
  carbonSavedKg: number;    // 탄소 절감량 (kg)
  moneySavedWon: number;    // 절약한 금액 (원)
  treesPlanted: number;     // 소나무 심은 효과 (그루)
}

export interface AIAnalysisResponse {
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedRate: number;
  probability: number;
  hook: string;
}

export interface AICarbonReportResponse {
  summary: string;
  detailedAnalysis: string;
  recommendations: string[];
}
