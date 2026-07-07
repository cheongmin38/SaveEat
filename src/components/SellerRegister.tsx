/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ShoppingBag, PlusCircle, Trash, RefreshCw, Star, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIAnalysisResponse } from '../types';

export const SellerRegister: React.FC = () => {
  const { registerProduct, getAIProductAnalysis, isAIAnalyzing } = useApp();

  const [name, setName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [quantity, setQuantity] = useState('5');
  const [expiryDate, setExpiryDate] = useState('오늘 21:00');
  const [pickupTime, setPickupTime] = useState('18:00 ~ 21:00');
  const [category, setCategory] = useState<'bakery' | 'convenience' | 'cafe' | 'side' | 'mart'>('bakery');
  const [imageUrl, setImageUrl] = useState('');

  // AI states
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [showAiReport, setShowAiReport] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Predefined gorgeous images for products based on category for seamless visual simulation
  const categoryImages: Record<string, string[]> = {
    bakery: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&auto=format&fit=crop&q=60'
    ],
    cafe: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=60'
    ],
    convenience: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60'
    ],
    side: [
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60'
    ],
    mart: [
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60'
    ]
  };

  const handleAIAnalyze = async () => {
    if (!name || !originalPrice) {
      alert('상품명과 정상가격을 먼저 입력하셔야 정확한 AI 분석이 가능합니다.');
      return;
    }

    try {
      const result = await getAIProductAnalysis({
        name,
        originalPrice: Number(originalPrice),
        quantity: Number(quantity),
        category,
        expiryDate
      });
      setAiAnalysis(result);
      setShowAiReport(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyAIValues = () => {
    if (!aiAnalysis) return;
    const rate = aiAnalysis.recommendedRate;
    const computedPrice = Math.round((Number(originalPrice) * (1 - rate / 100)) / 100) * 100; // Round to nearest 100 Won
    setDiscountPrice(computedPrice.toString());
    setShowAiReport(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !originalPrice || !discountPrice) {
      alert('필수 양식을 기재해주세요.');
      return;
    }

    // Pick a high-quality photo based on selected category
    const list = categoryImages[category] || categoryImages.bakery;
    const chosenImage = imageUrl || list[Math.floor(Math.random() * list.length)];

    const orig = Number(originalPrice);
    const disc = Number(discountPrice);
    const rate = Math.round(((orig - disc) / orig) * 100);

    const productData = {
      name,
      originalPrice: orig,
      discountPrice: disc,
      discountRate: rate,
      quantity: Number(quantity),
      expiryDate,
      pickupTime,
      category,
      imageUrl: chosenImage,
      aiProbability: aiAnalysis?.probability || Math.floor(Math.random() * 20) + 75,
      aiRisk: aiAnalysis?.risk || (Number(quantity) > 6 ? 'HIGH' : 'MEDIUM') as any,
      aiHook: aiAnalysis?.hook || `🌟 오늘 마감 한정 수량 수제 ${name} 초특가 파격 세일!`
    };

    try {
      await registerProduct(productData);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        // Reset form
        setName('');
        setOriginalPrice('');
        setDiscountPrice('');
        setAiAnalysis(null);
      }, 2000);
    } catch (err) {
      alert('등록 중 에러가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <PlusCircle className="w-4.5 h-4.5 text-orange-500 mr-1.5" />
          마감할인 식품 간편 등록
        </h3>
        <p className="text-[10px] text-slate-400 -mt-0.5">매장의 당일 폐기 예정 상품 정보와 AI 분석을 바탕으로 가치 할인율을 적용해 업로드합니다.</p>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-4 shadow-sm"
          >
            <div className="w-14 h-14 bg-mint-50 border border-mint-100 text-mint-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">할인식품 등록이 완료되었습니다!</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">동네 소비자들의 단골 PUSH 알림이 즉시 전송되며 실시간 매장에 반영되었습니다.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleRegister}
            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs space-y-5"
          >
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">식품 대분류 카테고리</label>
              <div className="grid grid-cols-5 gap-2">
                {(['bakery', 'convenience', 'cafe', 'side', 'mart'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                      category === cat
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {cat === 'bakery' ? '베이커리' : cat === 'cafe' ? '카페' : cat === 'convenience' ? '편의점' : cat === 'side' ? '반찬' : '마트'}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">상품명 (Food Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 단팥소보로빵 3종 세트"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border-none text-xs focus:ring-2 focus:ring-orange-400 outline-hidden font-medium placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">정상 금액 (원) *</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 9500"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border-none text-xs focus:ring-2 focus:ring-orange-400 outline-hidden font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* AI Prediction Section */}
              <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100/60 space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-orange-500/5 rounded-full blur-lg" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-orange-800">AI 마감 최적가 추천 비서</h4>
                      <p className="text-[9px] text-orange-600/80 -mt-0.5">수량과 정상가 분석 후 최단 시간 완판 할인율 자동 제안</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAIAnalyze}
                    disabled={isAIAnalyzing}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-[10px] font-black rounded-lg transition-colors flex items-center space-x-1"
                  >
                    {isAIAnalyzing ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>AI 분석받기</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI report popup drawer in-form */}
                <AnimatePresence>
                  {showAiReport && aiAnalysis && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white p-3.5 rounded-xl border border-orange-100 shadow-2xs space-y-3 overflow-hidden text-xs"
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-b border-slate-50 pb-2">
                        <span>RECOMMENDED METRICS BY GEMINI AI</span>
                        <button type="button" onClick={() => setShowAiReport(false)} className="text-slate-400">✕</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-orange-50/50 p-2 rounded-lg border border-orange-100/20">
                          <p className="text-[9px] text-slate-400 font-bold leading-none mb-1">추천 할인율</p>
                          <p className="text-sm font-extrabold text-orange-600">{aiAnalysis.recommendedRate}%</p>
                        </div>
                        <div className="bg-mint-50/50 p-2 rounded-lg border border-mint-100/20">
                          <p className="text-[9px] text-slate-400 font-bold leading-none mb-1">예상 완판 소진율</p>
                          <p className="text-sm font-extrabold text-mint-600">{aiAnalysis.probability}%</p>
                        </div>
                        <div className="bg-red-50/50 p-2 rounded-lg border border-red-100/20">
                          <p className="text-[9px] text-slate-400 font-bold leading-none mb-1">폐기 위험 수준</p>
                          <p className="text-sm font-extrabold text-red-500">{aiAnalysis.risk}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[10px] leading-relaxed text-slate-600">
                        🌟 <strong>AI 제안 문구:</strong> {aiAnalysis.hook}
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyAIValues}
                        className="w-full py-1.5 bg-mint-600 hover:bg-mint-700 text-white font-bold text-[10px] rounded-lg transition-colors"
                      >
                        AI 제안 할인율 자동 가격 적용하기
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">최종 할인 판매가 (원) *</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 4800 (AI 분석으로 채우기 권장)"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border-none text-xs focus:ring-2 focus:ring-orange-400 outline-hidden font-medium placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">등록 수량 (개) *</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border-none text-xs focus:ring-2 focus:ring-orange-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">마감 일시 (예: 오늘 20시) *</label>
                  <input
                    type="text"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border-none text-xs focus:ring-2 focus:ring-orange-400 outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">희망 픽업 가능 시각 *</label>
                  <input
                    type="text"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border-none text-xs focus:ring-2 focus:ring-orange-400 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Photo upload mock */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">수령 보관 식품 실물 이미지</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-orange-300 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
                <p className="text-[10px] text-slate-400 font-bold">카메라 촬영 사진 추가 또는 드래그 앤 드롭</p>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">*미업로드 시 AI 카테고리별 신선 이미지가 자동 배정됩니다.</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-orange-500/10 transition-colors"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>동네 마감할인 타임딜 피드 업로드 완료하기</span>
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
