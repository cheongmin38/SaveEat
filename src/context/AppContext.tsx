/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Store, Order, UserStats, AIAnalysisResponse, AICarbonReportResponse } from '../types';

interface AppContextType {
  // Session / Navigation
  currentRole: 'consumer' | 'seller';
  setCurrentRole: (role: 'consumer' | 'seller') => void;
  consumerTab: 'home' | 'map' | 'favorites' | 'orders' | 'mypage';
  setConsumerTab: (tab: 'home' | 'map' | 'favorites' | 'orders' | 'mypage') => void;
  sellerTab: 'dashboard' | 'register' | 'orders' | 'stats' | 'settings';
  setSellerTab: (tab: 'dashboard' | 'register' | 'orders' | 'stats' | 'settings') => void;
  
  // Geolocation
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  userAddress: string;
  setUserAddress: (addr: string) => void;
  
  // Data State
  stores: Store[];
  products: Product[];
  orders: Order[];
  stats: UserStats;
  
  // Interactions
  toggleSubscribeStore: (storeId: string) => void;
  createReservation: (productId: string, quantity: number) => Promise<Order>;
  cancelReservation: (orderId: string) => void;
  completePickup: (orderId: string) => void;
  registerProduct: (product: Omit<Product, 'id' | 'storeId' | 'storeName'>) => Promise<Product>;
  
  // AI Integrations
  isAIAnalyzing: boolean;
  getAIProductAnalysis: (productData: {
    name: string;
    originalPrice: number;
    quantity: number;
    category: 'bakery' | 'convenience' | 'cafe' | 'side' | 'mart';
    expiryDate: string;
  }) => Promise<AIAnalysisResponse>;
  
  isAIReportLoading: boolean;
  getAICarbonReport: () => Promise<AICarbonReportResponse>;
  
  aiRecommendations: Record<string, string>; // Maps productId -> AI recommended reason
  fetchAIRecommendations: (category: string) => Promise<void>;
  isLoadingRecommendations: boolean;
  
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: '그린브레드 베이커리 신촌본점',
    category: 'bakery',
    address: '서울시 마포구 창전동 45-12 1층 (서강대역 2번 출구 부근)',
    lat: 37.5512,
    lng: 126.9324,
    rating: 4.8,
    reviewsCount: 142,
    distance: 180,
    isSubscribed: true,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=60',
    description: '매일 아침 유기농 밀가루와 천연 효모를 사용해 빵을 굽는 건강한 동네 베이커리입니다. 당일 생산, 당일 판매 원칙을 고수합니다.'
  },
  {
    id: 'store-2',
    name: '에코라이프 마포중앙 편의점',
    category: 'convenience',
    address: '서울시 마포구 신촌로 18 1층 (신촌역 7번 출구에서 150m)',
    lat: 37.5542,
    lng: 126.9361,
    rating: 4.4,
    reviewsCount: 89,
    distance: 350,
    isSubscribed: false,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60',
    description: '친환경 및 ESG 경영에 동참하는 편의점으로, 당일 유통기한 마감 삼각김밥, 도시락, 샌드위치를 초특가에 신속 지원합니다.'
  },
  {
    id: 'store-3',
    name: '소나무 로스터리 카페',
    category: 'cafe',
    address: '서울시 마포구 독막로 89 2층 (상수역 3번 출구 도보 3분)',
    lat: 37.5484,
    lng: 126.9281,
    rating: 4.7,
    reviewsCount: 215,
    distance: 540,
    isSubscribed: true,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=60',
    description: '스페셜티 원두 로스팅 카페입니다. 당일 제조하여 한정 판매하는 고품격 수제 디저트와 샌드위치류를 알뜰하고 향긋하게 구출하세요.'
  },
  {
    id: 'store-4',
    name: '행복 가득 정갈한 찬방',
    category: 'side',
    address: '서울시 마포구 서강로 122 대흥빌딩 지하 1층',
    lat: 37.5521,
    lng: 126.9344,
    rating: 4.6,
    reviewsCount: 74,
    distance: 290,
    isSubscribed: false,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60',
    description: '천연 조미료로 맛을 내어 매일 깔끔한 밑반찬과 요리를 선사하는 동네 정통 반찬 전문점입니다. 가계 부담을 반으로 줄여 드립니다!'
  },
  {
    id: 'store-5',
    name: '초록생명농산 유기농 마트',
    category: 'mart',
    address: '서울시 마포구 서강대길 23 (서강대학교 정문 앞 교차로)',
    lat: 37.5501,
    lng: 126.9402,
    rating: 4.5,
    reviewsCount: 120,
    distance: 720,
    isSubscribed: false,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60',
    description: '전국 친환경 농가에서 직송한 고품질 유기농 청과류 및 마트 신선 식품을 취급합니다. 당일 소진 예정 신선 과일 특가 제공!'
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    storeId: 'store-1',
    storeName: '그린브레드 베이커리 신촌본점',
    name: '우유식빵 & 소보로 단팥빵 패키지',
    originalPrice: 9500,
    discountPrice: 4800,
    discountRate: 49,
    quantity: 4,
    expiryDate: '오늘 20:00 마감 (임박)',
    pickupTime: '18:00 ~ 20:00',
    category: 'bakery',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=60',
    aiProbability: 88,
    aiRisk: 'HIGH',
    aiHook: '🍞 아침에 갓 구워 쫄깃쫄깃한 우유식빵 패키지! 오늘 밤 폐기물 대신 내 밥상으로 안심 구출해보세요!'
  },
  {
    id: 'prod-2',
    storeId: 'store-1',
    storeName: '그린브레드 베이커리 신촌본점',
    name: '유기농 무화과 무가당 깜빠뉴',
    originalPrice: 7000,
    discountPrice: 3800,
    discountRate: 45,
    quantity: 2,
    expiryDate: '오늘 20:30 마감',
    pickupTime: '18:00 ~ 20:30',
    category: 'bakery',
    imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&auto=format&fit=crop&q=60',
    aiProbability: 92,
    aiRisk: 'LOW',
    aiHook: '🍷 건무화과가 입안 한가득 씹히는 고소 담백 깜빠뉴! 건강도 챙기고 탄소 배출도 줄여요.'
  },
  {
    id: 'prod-3',
    storeId: 'store-2',
    storeName: '에코라이프 마포중앙 편의점',
    name: '제육불고기 & 스팸듬뿍 한끼 도시락',
    originalPrice: 5800,
    discountPrice: 2300,
    discountRate: 60,
    quantity: 5,
    expiryDate: '오늘 22:00 마감 (유통기한 임박)',
    pickupTime: '20:00 ~ 22:00',
    category: 'convenience',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60',
    aiProbability: 95,
    aiRisk: 'HIGH',
    aiHook: '🍱 든든한 저녁 한 끼 초고속 해결! 남녀노소 사랑하는 매콤제육이 가성비 끝판왕 가격에 마감 세일 중!'
  },
  {
    id: 'prod-4',
    storeId: 'store-3',
    storeName: '소나무 로스터리 카페',
    name: '설향 딸기 생크림 수제 조각케이크',
    originalPrice: 7500,
    discountPrice: 3500,
    discountRate: 53,
    quantity: 3,
    expiryDate: '오늘 19:30 마감',
    pickupTime: '17:30 ~ 19:30',
    category: 'cafe',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=60',
    aiProbability: 82,
    aiRisk: 'MEDIUM',
    aiHook: '🍰 100% 동물성 우유 생크림과 달콤 상큼 딸기의 향연! 쌉싸름한 가치 아메리카노와 환상 조합!'
  },
  {
    id: 'prod-5',
    storeId: 'store-4',
    storeName: '행복 가득 정갈한 찬방',
    name: '엄마손 손수 빚은 모듬전 세트 (3인분)',
    originalPrice: 15000,
    discountPrice: 8000,
    discountRate: 46,
    quantity: 3,
    expiryDate: '오늘 20:30 마감',
    pickupTime: '18:30 ~ 20:30',
    category: 'side',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60',
    aiProbability: 79,
    aiRisk: 'MEDIUM',
    aiHook: '🍳 동태전, 깻잎전, 애호박전으로 꽉 채운 든든 반찬! 데우기만 하면 막걸리 한 잔 생각나는 우리집 구원 밥상!'
  },
  {
    id: 'prod-6',
    storeId: 'store-5',
    storeName: '초록생명농산 유기농 마트',
    name: '국산 무농약 유기농 딸기 (특, 500g)',
    originalPrice: 16000,
    discountPrice: 8500,
    discountRate: 46,
    quantity: 6,
    expiryDate: '오늘 21:00 마감 (당일폐기)',
    pickupTime: '18:30 ~ 21:00',
    category: 'mart',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=60',
    aiProbability: 85,
    aiRisk: 'HIGH',
    aiHook: '🍓 비타민C 가득, 친환경 농가 살리기! 무농약이라 안심하고 씻어 바로 먹는 달콤 향긋 꿀딸기를 반값에 구출해보세요.'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation / Roles
  const [currentRole, setCurrentRole] = useState<'consumer' | 'seller'>(() => {
    const saved = localStorage.getItem('lastpick_role');
    return saved === 'seller' ? 'seller' : 'consumer';
  });
  const [consumerTab, setConsumerTab] = useState<'home' | 'map' | 'favorites' | 'orders' | 'mypage'>('home');
  const [sellerTab, setSellerTab] = useState<'dashboard' | 'register' | 'orders' | 'stats' | 'settings'>('dashboard');

  // Geolocation States and Effects
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>('서울시 마포구 창전동 주변 📍');

  // Reverse Geocoding with OSM Nominatim API
  useEffect(() => {
    if (!userLocation) return;
    
    const reverseGeocode = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${userLocation.lat}&lon=${userLocation.lng}&format=json&accept-language=ko`
        );
        if (response.ok) {
          const data = await response.json();
          const addressObj = data.address;
          if (addressObj) {
            const city = addressObj.province || addressObj.city || addressObj.metro_division || '';
            const borough = addressObj.borough || addressObj.suburb || addressObj.city_district || addressObj.district || '';
            const road = addressObj.road || addressObj.neighbourhood || addressObj.village || '';
            const niceAddress = `${city} ${borough} ${road}`.trim().replace(/\s+/g, ' ');
            if (niceAddress) {
              setUserAddress(niceAddress + ' 📍');
              return;
            }
          }
          if (data.display_name) {
            const shortened = data.display_name.split(',').slice(0, 3).reverse().join(' ').trim();
            setUserAddress(shortened + ' 📍');
          }
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
      }
    };

    reverseGeocode();
  }, [userLocation]);

  // Auto Geolocate on app load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.warn('Initial geolocation permission or signal failed:', error);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Core Data
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('lastpick_stores');
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lastpick_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('lastpick_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ord-100',
        productId: 'prod-2',
        productName: '유기농 무화과 무가당 깜빠뉴',
        originalPrice: 7000,
        discountPrice: 3800,
        quantity: 1,
        storeId: 'store-1',
        storeName: '그린브레드 베이커리 신촌본점',
        pickupTime: '18:00 ~ 20:30',
        reservedAt: '2026-07-06 15:30',
        status: 'completed',
        qrCode: 'lastpick_qr_ord-100',
        carbonSaved: 0.45,
        moneySaved: 3200
      },
      {
        id: 'ord-101',
        productId: 'prod-4',
        productName: '설향 딸기 생크림 수제 조각케이크',
        originalPrice: 7500,
        discountPrice: 3500,
        quantity: 1,
        storeId: 'store-3',
        storeName: '소나무 로스터리 카페',
        pickupTime: '17:30 ~ 19:30',
        reservedAt: '2026-07-06 16:45',
        status: 'completed',
        qrCode: 'lastpick_qr_ord-101',
        carbonSaved: 0.45,
        moneySaved: 4000
      }
    ];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lastpick_stats');
    if (saved) return JSON.parse(saved);
    
    // Default initial user stats
    return {
      foodRescuedCount: 2,
      carbonSavedKg: 0.9,
      moneySavedWon: 7200,
      treesPlanted: 0.1
    };
  });

  // AI Loading States & Cache
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [isAIReportLoading, setIsAIReportLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, string>>({});
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('lastpick_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('lastpick_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('lastpick_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('lastpick_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('lastpick_stats', JSON.stringify(stats));
  }, [stats]);

  // Actions
  const toggleSubscribeStore = (storeId: string) => {
    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        return { ...s, isSubscribed: !s.isSubscribed };
      }
      return s;
    }));
  };

  const createReservation = async (productId: string, quantity: number): Promise<Order> => {
    const prod = products.find(p => p.id === productId);
    if (!prod) throw new Error('해당 상품을 찾을 수 없습니다.');
    if (prod.quantity < quantity) throw new Error('재고가 부족합니다.');

    // Reduce product quantity
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, quantity: p.quantity - quantity };
      }
      return p;
    }));

    const carbonFactor = 0.45; // 0.45kg CO2 saved per rescued food item
    const savedMoney = (prod.originalPrice - prod.discountPrice) * quantity;
    const co2Saved = Number((carbonFactor * quantity).toFixed(2));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      productId,
      productName: prod.name,
      originalPrice: prod.originalPrice,
      discountPrice: prod.discountPrice,
      quantity,
      storeId: prod.storeId,
      storeName: prod.storeName,
      pickupTime: prod.pickupTime,
      reservedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
      qrCode: `lastpick_qr_${Date.now()}`,
      carbonSaved: co2Saved,
      moneySaved: savedMoney
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const cancelReservation = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Refund product quantity
    setProducts(prev => prev.map(p => {
      if (p.id === order.productId) {
        return { ...p, quantity: p.quantity + order.quantity };
      }
      return p;
    }));

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'cancelled' };
      }
      return o;
    }));
  };

  const completePickup = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'pending') return;

    // Set order completed
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'completed' };
      }
      return o;
    }));

    // Increment user stats!
    setStats(prev => {
      const newCount = prev.foodRescuedCount + order.quantity;
      const newCarbon = Number((prev.carbonSavedKg + order.carbonSaved).toFixed(2));
      const newMoney = prev.moneySavedWon + order.moneySaved;
      // 30-year pine tree absorbs ~6.6kg of CO2 per year
      const newTrees = Number((newCarbon / 6.6).toFixed(2));
      
      return {
        foodRescuedCount: newCount,
        carbonSavedKg: newCarbon,
        moneySavedWon: newMoney,
        treesPlanted: newTrees
      };
    });
  };

  const registerProduct = async (productData: Omit<Product, 'id' | 'storeId' | 'storeName'>): Promise<Product> => {
    // Registered by the main merchant (Store 1: 그린브레드 베이커리 신촌본점 for simulation)
    const storeId = 'store-1';
    const storeName = '그린브레드 베이커리 신촌본점';
    const newId = `prod-${Date.now()}`;

    const newProd: Product = {
      id: newId,
      storeId,
      storeName,
      ...productData,
    };

    setProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  // 1. AI Product Analysis for Seller
  const getAIProductAnalysis = async (productData: {
    name: string;
    originalPrice: number;
    quantity: number;
    category: 'bakery' | 'convenience' | 'cafe' | 'side' | 'mart';
    expiryDate: string;
  }): Promise<AIAnalysisResponse> => {
    setIsAIAnalyzing(true);
    try {
      const response = await fetch('/api/gemini/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error('Server network error');
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      console.error('AI analysis error, using client-side generator', err);
      // Fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const originalNum = Number(productData.originalPrice) || 5000;
          const baseRate = productData.category === 'bakery' ? 45 : productData.category === 'cafe' ? 50 : 40;
          const recommendedRate = Math.min(80, Math.max(20, baseRate + (productData.quantity > 8 ? 10 : 0)));
          const probability = Math.floor(Math.random() * 15) + 80; // 80-95%
          const risk = productData.quantity > 8 ? 'HIGH' : 'MEDIUM';
          const hook = `🌿 [지구 환경 살리는 AI 추천 마케팅] 오늘이 지나면 버려질 신선한 ${productData.name}! 지금 예약하고 환경수호대 동참 할인 혜택 받기 📢`;
          resolve({
            risk,
            recommendedRate,
            probability,
            hook
          });
        }, 1500);
      });
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  // 2. AI Personalized ESG Carbon Report for Consumer
  const getAICarbonReport = async (): Promise<AICarbonReportResponse> => {
    setIsAIReportLoading(true);
    try {
      const response = await fetch('/api/gemini/generate-carbon-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodRescuedCount: stats.foodRescuedCount,
          carbonSavedKg: stats.carbonSavedKg,
          moneySavedWon: stats.moneySavedWon
        })
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('AI Carbon report error, returning simulated report', err);
      return new Promise((resolve) => {
        setTimeout(() => {
          const treeEquivalent = Number((stats.carbonSavedKg / 6.6).toFixed(1));
          resolve({
            summary: `회원님은 이번 달에만 총 ${stats.foodRescuedCount}개의 임박 음식을 멋지게 구조했습니다!`,
            detailedAnalysis: `회원님이 구조하여 소비한 식품들은 버려졌을 경우 토양에서 부패되며 대기 중으로 메탄가스를 다량 배출했을 것입니다. 이를 방지함으로써 약 ${stats.carbonSavedKg}kg의 탄소 배출량을 줄였으며, 이는 30년생 소나무 ${treeEquivalent}그루가 매년 흡수하는 산림 면적 정화 효과와 동일한 엄청난 ESG 성과입니다. 더불어 가계 부담금도 ${stats.moneySavedWon.toLocaleString()}원 절감하셨습니다!`,
            recommendations: [
              "남은 빵은 건조해지지 않도록 지퍼백에 소분 밀봉 후 지체 없이 냉동실로 보관해보세요.",
              "단골 매장을 3개 이상 구독해두면 당일 폐기 예정인 즉석 세일 상품의 푸쉬 알림을 실시간으로 수신해 음식 멸종을 더욱 빠르게 막을 수 있습니다.",
              "가벼운 다회용 락앤락 용기를 들고 픽업 매장에 방문하시면, 매장의 플라스틱/종이백 포장 폐기물까지 2차로 차단해 온전한 제로웨이스트를 이룰 수 있습니다!"
            ]
          });
        }, 2000);
      });
    } finally {
      setIsAIReportLoading(false);
    }
  };

  // 3. AI Smart Recommended Products matching
  const fetchAIRecommendations = async (category: string) => {
    setIsLoadingRecommendations(true);
    try {
      const response = await fetch('/api/gemini/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products.slice(0, 6),
          preferredCategory: category
        })
      });

      if (response.ok) {
        const result = await response.json();
        const mapping: Record<string, string> = {};
        result.recommendations.forEach((item: any) => {
          mapping[item.productId] = item.reason;
        });
        setAiRecommendations(mapping);
      } else {
        throw new Error('Response error');
      }
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
      // Fallback
      const mapping: Record<string, string> = {};
      products.forEach(p => {
        mapping[p.id] = `오늘 마감 시간이 얼마 남지 않은 ${p.storeName}의 시그니처 품목입니다. AI가 실시간 탄소 가치 매칭을 통하여 완판 위험 군으로 도출했으며, 현재 최고 할인율 ${p.discountRate}% 골든타임 득템 기회입니다.`;
      });
      setAiRecommendations(mapping);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Initial recommendation fetch
  useEffect(() => {
    fetchAIRecommendations(selectedCategory);
  }, [products.length, selectedCategory]);

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        consumerTab,
        setConsumerTab,
        sellerTab,
        setSellerTab,
        
        userLocation,
        setUserLocation,
        userAddress,
        setUserAddress,
        
        stores,
        products,
        orders,
        stats,
        
        toggleSubscribeStore,
        createReservation,
        cancelReservation,
        completePickup,
        registerProduct,
        
        isAIAnalyzing,
        getAIProductAnalysis,
        isAIReportLoading,
        getAICarbonReport,
        
        aiRecommendations,
        fetchAIRecommendations,
        isLoadingRecommendations,
        
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
