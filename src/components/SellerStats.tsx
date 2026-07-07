/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, Legend, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Leaf, Trash2, ArrowUpRight, Scale } from 'lucide-react';

export const SellerStats: React.FC = () => {
  const { products, orders } = useApp();

  const completedOrders = orders.filter(o => o.storeId === 'store-1' && o.status === 'completed');

  // Simulated Weekly stats data
  const salesHistoryData = [
    { name: '월', rescuedRevenue: 45000, discardLoss: 12000 },
    { name: '화', rescuedRevenue: 52000, discardLoss: 8000 },
    { name: '수', rescuedRevenue: 68000, discardLoss: 15000 },
    { name: '목', rescuedRevenue: 59000, discardLoss: 5000 },
    { name: '금', rescuedRevenue: 85000, discardLoss: 9000 },
    { name: '토', rescuedRevenue: 110000, discardLoss: 4000 },
    { name: '일', rescuedRevenue: 95000, discardLoss: 11000 }
  ];

  const carbonReductionHistory = [
    { name: '6/30', carbonSaved: 12.4 },
    { name: '7/01', carbonSaved: 15.8 },
    { name: '7/02', carbonSaved: 19.5 },
    { name: '7/03', carbonSaved: 24.2 },
    { name: '7/04', carbonSaved: 30.1 },
    { name: '7/05', carbonSaved: 36.5 },
    { name: '7/06', carbonSaved: 42.8 }
  ];

  const categoryShare = [
    { name: '단팥소보로빵', value: 45, color: '#0f766e' },
    { name: '수제식빵', value: 25, color: '#0d9488' },
    { name: '조각 케이크', value: 20, color: '#f97316' },
    { name: '샌드위치', value: 10, color: '#fddf47' }
  ];

  const totalRescued = salesHistoryData.reduce((sum, item) => sum + item.rescuedRevenue, 0);
  const totalLoss = salesHistoryData.reduce((sum, item) => sum + item.discardLoss, 0);
  const salvageRate = Math.round((totalRescued / (totalRescued + totalLoss)) * 100);

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <BarChart3 className="w-4.5 h-4.5 text-mint-600 mr-1.5" />
          ESG 탄소 감축 및 경영 실적 통계
        </h3>
        <p className="text-[10px] text-slate-400 -mt-0.5">매장의 구출 매출, 폐기 손실 상쇄율, 이산화탄소 상쇄 정화 기여 지표를 추적합니다.</p>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">주간 누적 구출 매출</span>
            <span className="text-sm font-black text-slate-800 font-mono">{totalRescued.toLocaleString()}원</span>
          </div>
          <span className="text-[9px] bg-mint-50 text-mint-700 font-extrabold px-1.5 py-1 rounded">
            +18.4% 상승
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">평균 음식물 폐기 절감률</span>
            <span className="text-sm font-black text-mint-600 font-mono">{salvageRate}% 완판 소진</span>
          </div>
          <span className="text-[9px] bg-orange-50 text-orange-700 font-extrabold px-1.5 py-1 rounded">
            목표치 초과
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">주간 이산화탄소 상쇄량</span>
            <span className="text-sm font-black text-slate-800 font-mono">42.8 kg CO₂</span>
          </div>
          <span className="text-[9px] bg-green-50 text-green-700 font-extrabold px-1.5 py-1 rounded">
            소나무 6.5 그루
          </span>
        </div>
      </div>

      {/* Recharts visualizations row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Loss comparison */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center">
              <TrendingUp className="w-4.5 h-4.5 text-orange-500 mr-1" />
              요일별 구출 금액 vs 폐기 손실액
            </h4>
            <p className="text-[9px] text-slate-400">구출 금액이 높을수록 폐기 쓰레기 수수료가 자동으로 차감됩니다.</p>
          </div>

          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                <Legend />
                <Bar dataKey="rescuedRevenue" name="구출 매출" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="discardLoss" name="폐기 손실" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESG Carbon reduction cumulative graph */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center">
              <Leaf className="w-4.5 h-4.5 text-mint-600 mr-1" />
              누적 이산화탄소(CO₂) 발생 상쇄 추이
            </h4>
            <p className="text-[9px] text-slate-400">음식물 매립지 생성을 억제하여 구출해 낸 환경 기여도 (kg)</p>
          </div>

          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={carbonReductionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} kg`} />
                <Area type="monotone" dataKey="carbonSaved" name="상쇄 저감량" stroke="#0f766e" fill="#e6f4f1" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Share / Breakdown row */}
      <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800">품목별 구출 점유율</h4>
            <p className="text-[9px] text-slate-400">우리 매장에서 가치 소비 속도가 가장 빠른 인기 완판 카테고리입니다.</p>
          </div>

          <div className="space-y-2">
            {categoryShare.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[10px] font-semibold text-slate-600">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-8 h-48 w-full flex justify-center text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryShare}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryShare.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
