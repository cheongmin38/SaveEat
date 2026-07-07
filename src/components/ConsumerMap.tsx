/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Navigation, Star, Heart, Clock, ChevronRight, ShieldAlert, Sparkles, Footprints, Locate, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, Product } from '../types';
import L from 'leaflet';

// Haversine formula for exact distance calculations in meters
const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Earth radius in metres
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

export const ConsumerMap: React.FC = () => {
  const { stores, products, toggleSubscribeStore, createReservation } = useApp();
  const [selectedStore, setSelectedStore] = useState<Store | null>(stores[0]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveSuccess, setReserveSuccess] = useState(false);

  // Real-time GPS Geolocation states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'active' | 'error'>('idle');
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Get products for the selected store
  const getStoreProducts = (storeId: string) => {
    return products.filter(p => p.storeId === storeId && p.quantity > 0);
  };

  // Calculate high/max discount rate for a store
  const getStoreStats = (storeId: string) => {
    const storeProds = getStoreProducts(storeId);
    if (storeProds.length === 0) return { maxDiscount: 0, totalQty: 0 };
    const maxDiscount = Math.max(...storeProds.map(p => p.discountRate));
    const totalQty = storeProds.reduce((sum, p) => sum + p.quantity, 0);
    return { maxDiscount, totalQty };
  };

  const handleOpenReserve = (prod: Product) => {
    setSelectedProduct(prod);
    setReserveQty(1);
    setReserveSuccess(false);
  };

  const handleConfirmReserve = async () => {
    if (!selectedProduct) return;
    try {
      await createReservation(selectedProduct.id, reserveQty);
      setReserveSuccess(true);
    } catch (err: any) {
      alert(err.message || '예약 중 오류가 발생했습니다.');
    }
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet Map Instance (default center around Mapo-gu Sinchon)
    const map = L.map(mapContainerRef.current, {
      center: [37.5512, 126.9324],
      zoom: 15,
      zoomControl: false,
      attributionControl: true
    });

    // Add CartoDB Voyager Tile Layer (clean, modern, highly legible details in Korean)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers on map when stores, selection, or user position updates
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Set up or clear marker group layer
    if (markerGroupRef.current) {
      markerGroupRef.current.clearLayers();
    } else {
      markerGroupRef.current = L.layerGroup().addTo(map);
    }

    const markerGroup = markerGroupRef.current;

    // Helper for beautiful custom marker SVGs (Lucide style) with interactive outer glow rings
    const createCustomStoreIcon = (isSelected: boolean, category: string) => {
      let color = '#00d1b2'; // mint
      if (category === 'convenience') color = '#3b82f6'; // blue
      if (category === 'cafe') color = '#f59e0b'; // amber
      if (category === 'side') color = '#ec4899'; // pink
      if (category === 'mart') color = '#10b981'; // emerald

      const size = isSelected ? 42 : 32;
      const offset = size / 2;
      const borderColor = isSelected ? '#ff6b35' : '#ffffff';

      return L.divIcon({
        className: 'custom-store-pin',
        html: `
          <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
            ${isSelected ? `
              <div style="position: absolute; width: ${size + 14}px; height: ${size + 14}px; background: rgba(255, 107, 53, 0.2); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; width: ${size + 6}px; height: ${size + 6}px; border: 2.5px dashed #ff6b35; border-radius: 50%; animation: spin 12s linear infinite;"></div>
            ` : ''}
            <div style="background: ${color}; border: 2.5px solid ${borderColor}; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.18); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transform: scale(${isSelected ? 1.15 : 1}); transition: transform 0.2s ease;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [offset, offset],
      });
    };

    // Add store markers to the map
    stores.forEach((store) => {
      const isSelected = selectedStore?.id === store.id;
      const marker = L.marker([store.lat, store.lng], {
        icon: createCustomStoreIcon(isSelected, store.category)
      });

      marker.on('click', () => {
        setSelectedStore(store);
        setSelectedProduct(null);
      });

      marker.addTo(markerGroup);

      // Pan to selected store smoothly
      if (isSelected) {
        map.panTo([store.lat, store.lng]);
      }
    });

    // Add Pulsing Real-time User GPS Location Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-beacon',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background: #3b82f6; border: 3.5px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); width: 16px; height: 16px;"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon
      }).addTo(markerGroup);
    }
  }, [stores, selectedStore, userLocation]);

  // Geolocation Handler
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationErrorMessage('이 브라우저에서는 GPS 실시간 위치 조회를 지원하지 않습니다.');
      return;
    }

    setIsLocating(true);
    setLocationErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setUserLocation(newLocation);
        setLocationStatus('active');
        setIsLocating(false);

        // Pan & zoom smoothly to user's real location
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 16, {
            duration: 1.5
          });
        }
      },
      (error) => {
        console.error('GPS error:', error);
        setIsLocating(false);
        setLocationStatus('error');
        setLocationErrorMessage('위치 권한이 거부되었거나 신호가 약합니다. 서울 마포구 창전동 기준으로 매칭합니다.');
        
        // Return focus to map center default area
        if (mapRef.current) {
          mapRef.current.flyTo([37.5512, 126.9324], 15);
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Zoom Helpers
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  // Sort stores dynamically: if userLocation is active, sort by actual calculated geodesic meters, otherwise use default distance ranking
  const sortedStores = [...stores].sort((a, b) => {
    if (userLocation) {
      const distA = getDistanceInMeters(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = getDistanceInMeters(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    }
    return a.distance - b.distance;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 items-stretch min-h-[calc(100vh-10rem)]">
      {/* Left panel: Store Listing */}
      <div className="lg:col-span-5 space-y-4 flex flex-col justify-between max-h-[620px] overflow-y-auto pr-1">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Navigation className="w-4 h-4 text-mint-500 mr-1.5" />
              내 주변 할인 매장 목록
            </h3>
            <span className="text-[10px] text-slate-400 font-extrabold bg-slate-100 px-2 py-0.5 rounded-full">
              {userLocation ? 'GPS 거리 순 정렬' : '추천 거리 순 정렬'}
            </span>
          </div>

          <div className="space-y-3">
            {sortedStores.map((store) => {
              const { maxDiscount, totalQty } = getStoreStats(store.id);
              const isSelected = selectedStore?.id === store.id;
              
              // Calculate actual distance if user's location is active, fallback to database static estimate
              const displayDistance = userLocation 
                ? getDistanceInMeters(userLocation.lat, userLocation.lng, store.lat, store.lng) 
                : store.distance;

              return (
                <div
                  key={store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    setSelectedProduct(null);
                  }}
                  className={`bg-white rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer flex space-x-3.5 ${
                    isSelected
                      ? 'border-mint-500 ring-2 ring-mint-100 shadow-md transform translate-x-1'
                      : 'border-slate-200/60 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-16 h-16 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                          {store.category === 'bakery' ? '베이커리' : store.category === 'cafe' ? '카페' : store.category === 'convenience' ? '편의점' : store.category === 'side' ? '반찬' : '마트'}
                        </span>
                        
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                          userLocation 
                            ? 'text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100' 
                            : 'text-slate-500'
                        }`}>
                          <Footprints className="w-3.5 h-3.5 shrink-0" />
                          {userLocation ? `GPS ${displayDistance}m` : `${displayDistance}m`}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate mt-1">{store.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{store.address}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-50 mt-1.5">
                      <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-semibold">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{store.rating} ({store.reviewsCount})</span>
                      </div>
                      <div className="flex space-x-1.5">
                        {totalQty > 0 ? (
                          <>
                            <span className="text-[9px] bg-red-50 text-red-600 font-extrabold px-1.5 py-0.5 rounded">
                              최대 {maxDiscount}% 세일
                            </span>
                            <span className="text-[9px] bg-mint-50 text-mint-700 font-extrabold px-1.5 py-0.5 rounded">
                              재고 {totalQty}개
                            </span>
                          </>
                        ) : (
                          <span className="text-[9px] bg-slate-100 text-slate-400 font-semibold px-1.5 py-0.5 rounded">
                            마감 완판 👏
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel: Real Map Canvas */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
        {/* The map container */}
        <div className="relative flex-1 bg-slate-100 border border-slate-200 rounded-3xl overflow-hidden min-h-[360px] shadow-sm">
          
          {/* Leaflet Mount Target */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating HUD status indicator */}
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-lg max-w-xs flex flex-col gap-0.5 pointer-events-auto">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">지도 모니터링</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                locationStatus === 'active' ? 'bg-blue-500 animate-pulse' : isLocating ? 'bg-amber-400 animate-ping' : 'bg-mint-500'
              }`} />
              <span className="text-xs text-slate-800 font-bold">
                {isLocating ? 'GPS 위치 수신 중...' : locationStatus === 'active' ? 'GPS 실시간 현위치 연동됨' : '마포구 창전동 일대 매칭'}
              </span>
            </div>
            {locationErrorMessage && (
              <span className="text-[9px] text-red-500 font-semibold mt-0.5 leading-tight">{locationErrorMessage}</span>
            )}
          </div>

          {/* Custom Floating UI controls on map */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
            {/* Find GPS location button */}
            <button
              onClick={handleFindMyLocation}
              disabled={isLocating}
              className={`p-3 rounded-full border transition-all shadow-md flex items-center justify-center ${
                locationStatus === 'active'
                  ? 'bg-blue-500 text-white border-blue-400 hover:bg-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              } ${isLocating ? 'animate-pulse' : ''}`}
              title="실시간 내 위치 찾기"
            >
              <Locate className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
            </button>

            {/* Custom Zoom Buttons */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
              <button
                onClick={handleZoomIn}
                className="p-2.5 text-slate-600 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-center transition-colors"
                title="확대"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2.5 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
                title="축소"
              >
                <Minus className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Store Tray */}
        <AnimatePresence mode="wait">
          {selectedStore && (
            <motion.div
              key={selectedStore.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200/60 p-4.5 space-y-4 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">{selectedStore.name}</h4>
                  <p className="text-[10px] text-slate-500 flex items-center mt-1">
                    <Clock className="w-3 h-3 text-slate-400 mr-1" />
                    수령 보관소 운영시간: 08:00 ~ 22:30 (수령 마감 {selectedStore.id === 'store-1' ? '21:00' : '22:00'})
                  </p>
                </div>
                <button
                  onClick={() => toggleSubscribeStore(selectedStore.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedStore.isSubscribed
                      ? 'bg-mint-50 text-mint-700 border-mint-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {selectedStore.isSubscribed ? '★ 단골 구독중' : '☆ 단골 매장 등록'}
                </button>
              </div>

              {/* Show items of selected store */}
              <div className="space-y-2.5">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">이 매장의 마감할인 식품</h5>
                {getStoreProducts(selectedStore.id).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 font-medium">
                    🙌 현재 이 매장의 할인 식품이 완판되었습니다! 다음 타임 세일을 기다려주세요.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getStoreProducts(selectedStore.id).map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleOpenReserve(prod)}
                        className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <img src={prod.imageUrl} alt={prod.name} className="w-11 h-11 object-cover rounded-lg shrink-0 bg-white border border-slate-100" />
                          <div className="min-w-0">
                            <h6 className="text-[11px] font-bold text-slate-800 truncate">{prod.name}</h6>
                            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{prod.discountPrice.toLocaleString()}원</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-orange-600 font-extrabold block leading-none">{prod.discountRate}% OFF</span>
                          <span className="text-[9px] text-slate-500 font-semibold block mt-1">남은재고 {prod.quantity}개</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Embedded Reserve Dialog */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>

              {reserveSuccess ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-12 h-12 bg-mint-50 rounded-full flex items-center justify-center text-mint-500 mx-auto border border-mint-100 font-bold text-xl">
                    ✓
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">예약이 완료되었습니다!</h3>
                  <p className="text-xs text-slate-500">
                    픽업 보관 시간인 <strong className="text-orange-500">{selectedProduct.pickupTime}</strong> 이내에 방문하여 수령하시길 바랍니다.
                  </p>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-full py-2.5 bg-mint-600 hover:bg-mint-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    확인
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-red-50 text-red-600 font-extrabold px-1.5 py-0.5 rounded">
                      긴급 멸종 구출 소환 대상
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-800 mt-1">{selectedProduct.name}</h3>
                    <p className="text-[10px] text-slate-400">{selectedProduct.storeName}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">정상 가격</span>
                      <span className="text-slate-500 line-through">{selectedProduct.originalPrice.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">가치 할인가</span>
                      <span className="text-orange-600 font-extrabold">{selectedProduct.discountPrice.toLocaleString()}원 ({selectedProduct.discountRate}%)</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/50 pt-2 mt-1">
                      <span className="text-slate-400">수령 만료 시한</span>
                      <span className="text-slate-700 font-bold">{selectedProduct.pickupTime.split('~')[1]} 까지</span>
                    </div>
                  </div>

                  {/* Qty Counter */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>수량 선택 (재고 {selectedProduct.quantity}개)</span>
                    <div className="flex items-center space-x-3 bg-slate-100 px-2 py-1 rounded-xl">
                      <button onClick={() => setReserveQty(q => Math.max(1, q - 1))} className="text-slate-500 hover:text-slate-800">-</button>
                      <span className="font-mono">{reserveQty}</span>
                      <button onClick={() => setReserveQty(q => Math.min(selectedProduct.quantity, q + 1))} className="text-slate-500 hover:text-slate-800">+</button>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmReserve}
                    className="w-full py-2.5 bg-mint-600 hover:bg-mint-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                  >
                    {(selectedProduct.discountPrice * reserveQty).toLocaleString()}원 현장 픽업 결제 예약
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
