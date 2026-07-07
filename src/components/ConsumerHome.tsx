/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Flame, Clock, Sparkles, Heart, Check, ChevronRight, ShoppingBag, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

export const ConsumerHome: React.FC = () => {
  const {
    products,
    stores,
    toggleSubscribeStore,
    createReservation,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    aiRecommendations,
    isLoadingRecommendations
  } = useApp();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [isReservedSuccess, setIsReservedSuccess] = useState(false);
  const [reservedOrderInfo, setReservedOrderInfo] = useState<any>(null);

  const categories = [
    { id: 'all', name: '전체보기', icon: '🍽️' },
    { id: 'bakery', name: '베이커리', icon: '🍞' },
    { id: 'convenience', name: '편의점', icon: '🍱' },
    { id: 'cafe', name: '카페', icon: '☕' },
    { id: 'side', name: '반찬가게', icon: '🍳' },
    { id: 'mart', name: '유기농마트', icon: '🍎' }
  ];

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && p.quantity > 0;
  });

  // Get store details for a product
  const getProductStore = (storeId: string) => {
    return stores.find(s => s.id === storeId);
  };

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setReserveQty(1);
    setIsReservedSuccess(false);
  };

  const handleReserve = async () => {
    if (!selectedProduct) return;
    try {
      const order = await createReservation(selectedProduct.id, reserveQty);
      setReservedOrderInfo(order);
      setIsReservedSuccess(true);
    } catch (err: any) {
      alert(err.message || '예약 중 요류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Search Input Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mint-500 to-mint-600 p-6 text-white shadow-lg shadow-mint-500/10">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-mint-400/20 rounded-full blur-xl" />
        
        <div className="relative space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">오늘 마감, 지금 안 사면 폐기!</h2>
            <p className="text-xs text-mint-100 font-medium">우리 동네 유통기한 마감 임박 맛있는 음식 구출 작전 🌿</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="매장명 또는 먹고 싶은 상품을 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-slate-800 rounded-2xl border-none text-xs focus:ring-2 focus:ring-orange-400 shadow-sm outline-hidden font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-800">카테고리별 탐색</h3>
        <div className="flex space-x-2 overflow-x-auto pb-1 select-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-mint-600 text-white shadow-sm shadow-mint-500/20'
                  : 'bg-white text-slate-600 border border-slate-100 hover:border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 오늘의 초특가 타임딜 */}
      {selectedCategory === 'all' && !searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Flame className="w-4 h-4 text-orange-500 mr-1 animate-pulse" />
              오늘의 초특가 타임딜 (할인율 50%+)
            </h3>
            <span className="text-[10px] text-slate-400 font-bold flex items-center">
              실시간 업데이트 <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-2 select-none">
            {products
              .filter(p => p.discountRate >= 48 && p.quantity > 0)
              .map(prod => (
                <motion.div
                  key={prod.id}
                  whileHover={{ y: -3 }}
                  onClick={() => handleOpenDetail(prod)}
                  className="w-48 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs shrink-0 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-28 bg-slate-100">
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-orange-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                      {prod.discountRate}% OFF
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5">
                    <p className="text-[10px] text-slate-400 font-medium truncate">{prod.storeName}</p>
                    <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{prod.name}</h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-slate-400 line-through">{prod.originalPrice.toLocaleString()}원</span>
                      <span className="text-xs font-extrabold text-orange-600">{prod.discountPrice.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-mint-600 font-semibold bg-mint-50 px-2 py-1 rounded-md">
                      <span>재고 {prod.quantity}개</span>
                      <span>{prod.expiryDate.split(' ')[0]}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* AI 추천 상품 피드 */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-7 h-7 rounded-lg bg-mint-100 flex items-center justify-center text-mint-600">
              <Sparkles className="w-4 h-4 text-mint-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-800">AI 추천 탄소 수호 식품</h3>
              <p className="text-[10px] text-slate-400 -mt-0.5">나의 가치 소비 성향과 폐기 위험 골든타임 자동 분석 매칭</p>
            </div>
          </div>
          {isLoadingRecommendations && <span className="text-[9px] text-mint-600 font-bold animate-pulse">AI 분석 중...</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {products.slice(0, 2).map((prod) => (
            <div
              key={`ai-${prod.id}`}
              onClick={() => handleOpenDetail(prod)}
              className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs hover:border-mint-200 hover:shadow-xs transition-all cursor-pointer flex items-center space-x-3"
            >
              <img src={prod.imageUrl} alt={prod.name} className="w-16 h-16 object-cover rounded-lg shrink-0 bg-slate-100" />
              <div className="min-w-0 space-y-1">
                <span className="text-[9px] bg-gradient-to-r from-mint-500 to-mint-600 text-white px-1.5 py-0.5 rounded font-extrabold tracking-wider">AI PICK</span>
                <h4 className="text-xs font-bold text-slate-800 truncate">{prod.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium truncate">{prod.storeName}</p>
                {aiRecommendations[prod.id] && (
                  <div className="text-[9px] text-mint-700 bg-mint-50/70 p-1.5 rounded-md leading-relaxed border border-mint-100/40">
                    💡 {aiRecommendations[prod.id]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 마감 임박 상품 피드 리스트 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <Clock className="w-4 h-4 text-mint-600 mr-1" />
            실시간 주변 할인 식품 전체 ({filteredProducts.length}개)
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">도보 반경 500m 이내</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl py-12 text-center border border-slate-100 space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">검색 카테고리에 일치하는 마감 식품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => (
              <motion.div
                key={prod.id}
                layout
                whileHover={{ scale: 1.01 }}
                onClick={() => handleOpenDetail(prod)}
                className="bg-white rounded-2xl border border-slate-100 p-3.5 flex space-x-4 cursor-pointer hover:shadow-md hover:border-slate-200 transition-all"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 right-1 bg-black/75 text-white font-mono text-[8px] px-1 py-0.5 rounded">
                    {prod.quantity}개 남음
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-medium truncate max-w-[120px]">
                        {prod.storeName}
                      </span>
                      <span className="text-[9px] bg-red-50 text-red-600 font-bold px-1 py-0.5 rounded">
                        마감 {prod.expiryDate.split(' ')[1]}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate">{prod.name}</h4>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-extrabold text-orange-500">{prod.discountRate}%</span>
                      <div>
                        <p className="text-[9px] text-slate-400 line-through leading-none">{prod.originalPrice.toLocaleString()}원</p>
                        <p className="text-xs font-extrabold text-slate-800 leading-tight">{prod.discountPrice.toLocaleString()}원</p>
                      </div>
                    </div>
                    
                    <button className="bg-mint-50 hover:bg-mint-100 text-mint-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                      담기
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal Sheet */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center sm:items-center"
          >
            <motion.div
              initial={{ y: 200, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 200, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Image banner with close button */}
              <div className="relative h-48 bg-slate-100">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4 bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                  초특가 {selectedProduct.discountRate}% 마감할인
                </div>
              </div>

              {/* Success Screen */}
              {isReservedSuccess ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-14 h-14 bg-mint-50 rounded-full flex items-center justify-center text-mint-500 mx-auto border border-mint-100">
                    <Check className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-md font-extrabold text-slate-800">예약 성공! 지구를 살렸습니다 🌿</h3>
                    <p className="text-xs text-slate-500">
                      매장에 방문하여 주문내역 QR코드를 보여주시면 수령이 완료됩니다.
                    </p>
                  </div>

                  {reservedOrderInfo && (
                    <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100 space-y-2 text-xs font-medium">
                      <div className="flex justify-between">
                        <span className="text-slate-400">수령 매장</span>
                        <span className="text-slate-700 font-bold">{reservedOrderInfo.storeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">수령 시간</span>
                        <span className="text-slate-700 font-bold text-orange-500">{reservedOrderInfo.pickupTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">결제 예정 금액</span>
                        <span className="text-slate-700 font-bold text-mint-700">{(reservedOrderInfo.discountPrice * reservedOrderInfo.quantity).toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/50 pt-2 mt-2 text-[11px]">
                        <span className="text-slate-400">나의 탄소 절약 기여</span>
                        <span className="text-mint-600 font-bold">이산화탄소 {reservedOrderInfo.carbonSaved}kg 감축 성공! 🌲</span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="w-full py-3 bg-mint-600 hover:bg-mint-700 text-white font-bold rounded-2xl text-xs transition-colors"
                    >
                      홈으로 가기
                    </button>
                  </div>
                </div>
              ) : (
                /* Detail Info Body */
                <div className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-mint-600 font-extrabold tracking-tight flex items-center">
                      📍 {selectedProduct.storeName}
                    </p>
                    <h3 className="text-md font-extrabold text-slate-800 leading-tight">{selectedProduct.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 line-through text-xs">{selectedProduct.originalPrice.toLocaleString()}원</span>
                      <span className="text-md font-extrabold text-orange-600">{selectedProduct.discountPrice.toLocaleString()}원</span>
                    </div>
                  </div>

                  {/* Expiry and distance info */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">⏰ 유통기한/마감시각</p>
                      <p className="font-extrabold text-slate-700">{selectedProduct.expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">🚶 수령가능 장소/시간</p>
                      <p className="font-extrabold text-slate-700">{selectedProduct.pickupTime}</p>
                    </div>
                  </div>

                  {/* AI match explanation */}
                  {aiRecommendations[selectedProduct.id] && (
                    <div className="p-3 bg-mint-50/60 border border-mint-100/50 rounded-2xl flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-mint-600 shrink-0 mt-0.5" />
                      <div className="text-[10px] leading-relaxed text-slate-600">
                        <strong className="text-mint-700 font-bold">AI의 추천 한마디: </strong>
                        {aiRecommendations[selectedProduct.id]}
                      </div>
                    </div>
                  )}

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-700">예약 수량 선택 (남은 재고 {selectedProduct.quantity}개)</span>
                    <div className="flex items-center space-x-3 bg-slate-100 px-2.5 py-1.5 rounded-xl">
                      <button
                        onClick={() => setReserveQty(q => Math.max(1, q - 1))}
                        disabled={reserveQty <= 1}
                        className="text-slate-500 font-bold disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">{reserveQty}</span>
                      <button
                        onClick={() => setReserveQty(q => Math.min(selectedProduct.quantity, q + 1))}
                        disabled={reserveQty >= selectedProduct.quantity}
                        className="text-slate-500 font-bold disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Reserve Button */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleReserve}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-mint-600 hover:bg-mint-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-mint-500/10 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{reserveQty}개 선예약하기 (현장 수령 및 결제)</span>
                    </button>
                    <p className="text-[9px] text-slate-400 text-center">
                      *선예약 후 기재된 수령 마감 시간까지 방문하지 않으실 경우, 예약이 자동 취소되며 패널티가 부과될 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
