/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, BellOff, Heart, Store, ChevronRight, Sparkles } from 'lucide-react';
import { Store as StoreType } from '../types';

export const ConsumerFavorites: React.FC = () => {
  const { stores, products, toggleSubscribeStore } = useApp();

  const subscribedStores = stores.filter(s => s.isSubscribed);

  const getStoreProductCount = (storeId: string) => {
    return products.filter(p => p.storeId === storeId && p.quantity > 0).length;
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <Heart className="w-4 h-4 text-orange-500 fill-orange-500 mr-1.5" />
          단골 매장 구독 소식
        </h3>
        <p className="text-[10px] text-slate-400 -mt-0.5">단골 등록된 매장에 타임 세일 상품이 등록되면 1순위로 마감 알림이 전송됩니다.</p>
      </div>

      {subscribedStores.length === 0 ? (
        <div className="bg-white rounded-2xl py-12 text-center border border-slate-100 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
            <Heart className="w-6 h-6 text-slate-300" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700">등록된 단골 매장이 없습니다.</p>
            <p className="text-[10px] text-slate-400">지도 탭이나 상품 상세에서 단골 등록 버튼을 누르고 실시간 알림을 받아보세요.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {subscribedStores.map((store) => {
            const count = getStoreProductCount(store.id);

            return (
              <div
                key={store.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-14 h-14 object-cover rounded-xl bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center truncate">
                      <Store className="w-3.5 h-3.5 text-mint-600 mr-1 shrink-0" />
                      {store.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{store.address}</p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      {count > 0 ? (
                        <span className="text-[9px] bg-orange-50 text-orange-700 font-extrabold px-1.5 py-0.5 rounded flex items-center animate-pulse">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                          마감 세일 {count}개 진행 중!
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded">
                          현재 완판 대기 중
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => toggleSubscribeStore(store.id)}
                    className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100 text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-orange-500" />
                  </button>
                  <button className="p-2 bg-mint-50 rounded-xl border border-mint-100 text-mint-600 hover:bg-mint-100 transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
