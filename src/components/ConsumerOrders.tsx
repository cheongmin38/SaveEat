/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, ClipboardList, CheckCircle2, ChevronRight, XCircle, Footprints, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';

export const ConsumerOrders: React.FC = () => {
  const { orders, cancelReservation, completePickup } = useApp();
  const [selectedQR, setSelectedQR] = useState<Order | null>(null);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const handleSimulateScan = (orderId: string) => {
    completePickup(orderId);
    setSelectedQR(null);
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {/* Tab Header */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <ClipboardList className="w-4.5 h-4.5 text-mint-600 mr-1.5" />
          마감식품 예약 및 수령 내역
        </h3>
        <p className="text-[10px] text-slate-400 -mt-0.5">매장 방문 후 선예약 QR 코드를 보여주시면 점주 인증 후 현장 결제 및 수령 처리가 이루어집니다.</p>
      </div>

      {/* Pending Reservations */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">픽업 대기 중인 예약 ({pendingOrders.length}개)</h4>
        
        {pendingOrders.length === 0 ? (
          <div className="bg-white rounded-2xl py-8 text-center border border-slate-100 space-y-1">
            <p className="text-xs font-semibold text-slate-400">현재 대기 중인 픽업 예약이 없습니다.</p>
            <p className="text-[10px] text-slate-400">오늘의 특가 피드에서 먹고 싶은 마감 푸드를 선점 예약해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col justify-between"
              >
                <div className="flex items-start justify-between border-b border-slate-50 pb-3">
                  <div>
                    <span className="text-[9px] bg-orange-50 text-orange-600 font-extrabold px-1.5 py-0.5 rounded">
                      수령 대기중
                    </span>
                    <h5 className="text-xs font-extrabold text-slate-800 mt-1">{order.productName}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">수령지: {order.storeName}</p>
                  </div>
                  <button
                    onClick={() => setSelectedQR(order)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-mint-600 hover:bg-mint-700 text-white rounded-xl text-[10px] font-bold shadow-md shadow-mint-500/10 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>인증 QR코드</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 font-medium">
                  <div>
                    <p className="text-[10px] text-slate-400">픽업 만료 시한</p>
                    <p className="font-extrabold text-orange-600">{order.pickupTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">결제할 금액 ({order.quantity}개)</p>
                    <p className="font-extrabold text-slate-800">{(order.discountPrice * order.quantity).toLocaleString()}원</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 border-t border-slate-50 pt-3 mt-3">
                  <button
                    onClick={() => cancelReservation(order.id)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 text-[10px] font-bold rounded-lg border border-slate-100 hover:border-red-100 transition-colors"
                  >
                    예약 취소
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed / Cancelled History */}
      <div className="space-y-3 pt-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">과거 이용 내역 ({completedOrders.length}개)</h4>
        
        {completedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl py-6 text-center border border-slate-100">
            <p className="text-xs font-semibold text-slate-400">이전 수령 내역이 존재하지 않습니다.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {completedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 opacity-80 shadow-2xs flex justify-between items-center"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      order.status === 'completed' 
                        ? 'bg-mint-50 text-mint-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {order.status === 'completed' ? '수령 인증완료' : '예약 자동취소'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{order.reservedAt}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 truncate">{order.productName}</h5>
                  <p className="text-[10px] text-slate-400 truncate">{order.storeName}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-slate-800">{(order.discountPrice * order.quantity).toLocaleString()}원</p>
                  {order.status === 'completed' && (
                    <span className="text-[9px] text-mint-600 font-bold block mt-1">
                      🌿 CO₂ {order.carbonSaved}kg 구출!
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Popup with Scanner Simulator */}
      <AnimatePresence>
        {selectedQR && (
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
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative text-center space-y-5"
            >
              <button
                onClick={() => setSelectedQR(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>

              <div className="space-y-1">
                <span className="text-[9px] bg-mint-50 text-mint-700 font-extrabold px-2 py-0.5 rounded">
                  현장 픽업 수령용
                </span>
                <h3 className="text-xs font-extrabold text-slate-800 mt-1">{selectedQR.productName}</h3>
                <p className="text-[10px] text-slate-400">수령처: {selectedQR.storeName}</p>
              </div>

              {/* QR Vector Rendering */}
              <div className="p-4 bg-slate-50 rounded-2xl inline-block border border-slate-100 mx-auto">
                <div className="w-40 h-40 bg-white p-3 border-2 border-slate-800 rounded-xl relative flex flex-col justify-between items-stretch">
                  {/* Outer QR Corner markers */}
                  <div className="flex justify-between">
                    <div className="w-10 h-10 border-4 border-slate-800" />
                    <div className="w-10 h-10 border-4 border-slate-800" />
                  </div>
                  {/* Inner simulated QR code data blocks */}
                  <div className="flex-1 py-1.5 flex flex-col justify-around">
                    <div className="h-2 bg-slate-800/80 rounded" />
                    <div className="h-2 bg-slate-800/80 rounded w-4/5 self-center" />
                    <div className="h-2 bg-slate-800/80 rounded" />
                    <div className="h-2 bg-slate-800/80 rounded w-3/4 self-end" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-10 h-10 border-4 border-slate-800" />
                    {/* Simulated scanning scan line animation */}
                    <div className="w-12 h-1 bg-red-500 animate-pulse rounded absolute top-1/2 left-0 right-0" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-500 font-bold leading-tight">
                  점주 시뮬레이터 수령 연동 📲
                </p>
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  매장 사장님께서 이 포스터 QR 코드를 전용 포스기/앱으로 스캔하여<br />
                  수령 승인을 누르시면 탄소 상쇄 카운터가 충전됩니다.
                </p>
              </div>

              {/* Simulator Action */}
              <div className="bg-orange-50 border border-orange-100 p-3.5 rounded-2xl text-left space-y-2">
                <p className="text-[10px] font-extrabold text-orange-700 flex items-center leading-none">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 점주 픽업 스캔 시뮬레이터
                </p>
                <p className="text-[9px] text-slate-500 leading-normal">
                  프로토타입 환경으로, 아래 완료 승인을 누르면 점주가 QR 스캐너로 수령 처리를 마친 것과 완전히 연동되어 실적이 완료됩니다.
                </p>
                <button
                  onClick={() => handleSimulateScan(selectedQR.id)}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[10px] rounded-lg transition-colors"
                >
                  수령 완료 확인 승인하기 (점주 역할 대행)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
