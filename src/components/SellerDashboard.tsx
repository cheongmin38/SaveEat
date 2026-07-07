/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Store, TrendingUp, Sparkles, ShoppingBag, ClipboardList, AlertCircle, RefreshCw, BarChart3, Check } from 'lucide-react';
import { motion } from 'motion/react';

export const SellerDashboard: React.FC = () => {
  const { products, orders, completePickup } = useApp();

  // Filter products belonging to Store 1 (그린브레드 베이커리 신촌본점) for our mock simulation
  const merchantProducts = products.filter(p => p.storeId === 'store-1');
  const merchantOrders = orders.filter(o => o.storeId === 'store-1');

  const pendingOrders = merchantOrders.filter(o => o.status === 'pending');
  const completedOrders = merchantOrders.filter(o => o.status === 'completed');

  // Compute stats
  const totalSalesToday = completedOrders.reduce((sum, o) => sum + (o.discountPrice * o.quantity), 0);
  const totalRescuedCount = completedOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalProducts = merchantProducts.length;
  const inStockCount = merchantProducts.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Merchant Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-3xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl" />
        <div className="absolute left-1/4 bottom-0 w-36 h-36 bg-mint-500/10 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[9px] bg-orange-500 text-white font-extrabold px-2 py-0.5 rounded tracking-wide">
              ADMIN CONTROL PORTAL
            </span>
            <h3 className="text-md font-extrabold text-white mt-1">그린브레드 베이커리 신촌본점 점주님</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">오늘도 라스트픽과 함께 소중한 빵 폐기를 예방하고, 골목 탄소를 줄여주셔서 감사합니다.</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 text-center">
            <p className="text-[9px] text-slate-400 leading-none">오늘 누적 폐기물 절감</p>
            <p className="text-sm font-black text-mint-400 font-mono mt-1">{(totalRescuedCount * 0.45).toFixed(2)} kg CO₂ 🌿</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-2">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400 font-bold leading-none">오늘 구출된 매출</p>
            <h4 className="text-md font-black text-slate-800 font-mono">{totalSalesToday.toLocaleString()} 원</h4>
          </div>
          <p className="text-[9px] text-slate-400 pt-2 border-t border-slate-50 mt-3 font-semibold">
            🎉 폐기물 매립비 약 12,500원 절감 효과
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-mint-50 flex items-center justify-center text-mint-600 mb-2">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400 font-bold leading-none">실시간 등록 상품</p>
            <h4 className="text-md font-black text-slate-800 font-mono">{totalProducts} 품목 ({inStockCount}개 재고)</h4>
          </div>
          <p className="text-[9px] text-slate-400 pt-2 border-t border-slate-50 mt-3 font-semibold">
            📦 오늘 완판률 지수: <span className="text-mint-600 font-bold">84%</span>
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
            <ClipboardList className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400 font-bold leading-none">수령 승인 대기</p>
            <h4 className="text-md font-black text-slate-800 font-mono">{pendingOrders.length} 건</h4>
          </div>
          <p className="text-[9px] text-slate-400 pt-2 border-t border-slate-50 mt-3 font-semibold text-orange-500">
            ⏰ 마감 시간 2시간 전 픽업 독려 알림 작동 중
          </p>
        </div>
      </div>

      {/* AI Predictive Stock Analyzer */}
      <div className="bg-gradient-to-br from-orange-50/30 to-mint-50/30 border border-slate-200/50 rounded-2xl p-4.5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200/50 pb-2">
          <Sparkles className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
          <div>
            <h4 className="text-xs font-black text-slate-800">AI 재고 완판 소진 분석기 (Predictive AI)</h4>
            <p className="text-[9px] text-slate-400 -mt-0.5">등록 상품의 마감 시간 대비 소진 완판 확률 실시간 자동 분석</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {merchantProducts.slice(0, 2).map((p) => {
            const riskColor = p.aiRisk === 'HIGH' ? 'text-red-600 bg-red-50 border-red-100' : 'text-yellow-600 bg-yellow-50 border-yellow-100';
            return (
              <div key={`pred-${p.id}`} className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 truncate max-w-[160px]">{p.name}</h5>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${riskColor}`}>
                    폐기위험: {p.aiRisk}
                  </span>
                </div>
                
                {/* ProgressBar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>AI 완판 소진 예측 확률</span>
                    <span className="text-mint-600">{p.aiProbability}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-mint-500 to-mint-600 h-full rounded-full"
                      style={{ width: `${p.aiProbability}%` }}
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                  📢 <strong className="text-orange-600 font-bold">마케팅 제안:</strong> {p.aiHook || '할인율을 10% 더 올리면 완판 가능성이 15% 상승합니다.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Order Stream Panel */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">실시간 예약 접수 스트림 ({pendingOrders.length}건 대기)</h4>
        
        {pendingOrders.length === 0 ? (
          <div className="bg-white rounded-2xl py-12 text-center border border-slate-100 text-xs text-slate-400">
            현재 새로 접수된 예약이 없습니다. 실시간 알림 서비스가 작동 중입니다. 🔍
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-orange-50 text-orange-700 font-extrabold px-1.5 py-0.5 rounded">
                      수령 대기
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">주문번호: {order.id}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">{order.productName} ({order.quantity}개)</h5>
                  <p className="text-[10px] text-slate-400 font-medium">예약시각: {order.reservedAt} | 수령시한: {order.pickupTime}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 border-t sm:border-t-0 border-slate-50 pt-2.5 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[9px] text-slate-400 leading-none">결제 예정 금액</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-1">{(order.discountPrice * order.quantity).toLocaleString()}원</p>
                  </div>
                  <button
                    onClick={() => completePickup(order.id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-mint-600 hover:bg-mint-700 text-white rounded-xl text-xs font-bold shadow-md shadow-mint-500/10 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>픽업완료 승인</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
