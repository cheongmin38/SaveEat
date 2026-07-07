/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Leaf, TrendingDown, Flame, Sparkles, Heart, Footprints, ClipboardCheck, Info, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AICarbonReportResponse } from '../types';

export const ConsumerMyPage: React.FC = () => {
  const { stats, getAICarbonReport, isAIReportLoading } = useApp();
  const [report, setReport] = useState<AICarbonReportResponse | null>(null);

  const fetchReport = async () => {
    try {
      const data = await getAICarbonReport();
      setReport(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [stats.foodRescuedCount]); // Auto re-fetch when stats increment

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {/* Profile summary card */}
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-32 h-32 bg-mint-500/10 rounded-full blur-2xl" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />

        <div className="relative flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-mint-400 to-mint-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-mint-500/20">
            ESG
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-extrabold text-white">체리 푸드세이버 님</h3>
              <span className="text-[9px] bg-mint-500 text-white px-2 py-0.5 rounded font-black tracking-wider">LV.3 환경수호수</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">가입 후 마포구 골목 식료품 멸종을 훌륭히 예방하고 있습니다.</p>
          </div>
        </div>

        {/* Competition highlights */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 mt-5 text-center">
          <div className="bg-slate-800/40 p-2.5 rounded-2xl">
            <p className="text-[9px] text-slate-400 font-bold leading-none mb-1">구조한 음식 수</p>
            <p className="text-xs font-black text-orange-400">이번 달 {stats.foodRescuedCount}개의 음식 구조 완료 🧁</p>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-2xl">
            <p className="text-[9px] text-slate-400 font-bold leading-none mb-1">탄소 저감 기여</p>
            <p className="text-xs font-black text-mint-400">탄소 배출 {stats.carbonSavedKg.toFixed(2)}kg 감소 달성 🌲</p>
          </div>
        </div>
      </div>

      {/* Main ESG Metrics Panel */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">나의 누적 가치소비 실적</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Carbon Saved */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-mint-50 flex items-center justify-center text-mint-600 mb-2">
              <Leaf className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-bold leading-none">총 탄소 감축량</p>
              <h4 className="text-md font-black text-slate-800 font-mono">{stats.carbonSavedKg} kg CO₂</h4>
            </div>
            <div className="border-t border-slate-50 pt-2 mt-3 text-[9px] text-slate-400 font-semibold flex items-center">
              <Footprints className="w-3 h-3 mr-0.5 text-mint-500" /> 소나무 {stats.treesPlanted}그루 심은 기여도
            </div>
          </div>

          {/* Money Saved */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-2">
              <TrendingDown className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-bold leading-none">구출로 절약한 식비</p>
              <h4 className="text-md font-black text-slate-800 font-mono">{stats.moneySavedWon.toLocaleString()} 원</h4>
            </div>
            <div className="border-t border-slate-50 pt-2 mt-3 text-[9px] text-slate-400 font-semibold">
              📈 정가 대비 평균 48% 절약 성공!
            </div>
          </div>

          {/* Foods Rescued */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-bold leading-none">음식 폐기 예방 수량</p>
              <h4 className="text-md font-black text-slate-800 font-mono">{stats.foodRescuedCount} 회 구출</h4>
            </div>
            <div className="border-t border-slate-50 pt-2 mt-3 text-[9px] text-slate-400 font-semibold">
              🍰 마감 식품 멸종 예방 참여 지수 94점
            </div>
          </div>
        </div>
      </div>

      {/* AI ESG Carbon Analysis Report Container */}
      <div className="bg-gradient-to-br from-mint-50/30 to-orange-50/30 border border-slate-200/50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-mint-500 to-mint-600 flex items-center justify-center text-white shadow-sm shadow-mint-500/20">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 flex items-center">
                AI 음식물 폐기 절감 리포트
              </h4>
              <p className="text-[9px] text-slate-400 -mt-0.5">Gemini 3.5 Flash 실시간 가치 산정 솔루션</p>
            </div>
          </div>
          <button
            onClick={fetchReport}
            disabled={isAIReportLoading}
            className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isAIReportLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center space-y-4"
            >
              <div className="w-10 h-10 border-4 border-mint-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-extrabold animate-pulse">Gemini AI가 나의 음식 구조 탄소 가치를 계산하는 중...</p>
                <p className="text-[10px] text-slate-400">음식물 분해 메탄 방지율, 소나무 정화 가치, 보관 가이드 파싱</p>
              </div>
            </motion.div>
          ) : report ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Summary quote */}
              <div className="bg-white p-3.5 rounded-xl border border-mint-100 shadow-2xs">
                <p className="text-xs font-extrabold text-slate-800 italic leading-snug">
                  “ {report.summary} ”
                </p>
              </div>

              {/* Detailed analysis */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <ClipboardCheck className="w-3.5 h-3.5 text-mint-500 mr-1" />
                  탄소 감축 환경 분석
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100">
                  {report.detailedAnalysis}
                </p>
              </div>

              {/* AI Expert Tips */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  💡 친환경 푸드 세이버 실천 팁
                </span>
                <div className="space-y-2">
                  {report.recommendations.map((tip, idx) => (
                    <div
                      key={`tip-${idx}`}
                      className="bg-white p-3 rounded-xl border border-slate-100 flex items-start space-x-2 text-[11px] text-slate-600 leading-normal shadow-2xs"
                    >
                      <span className="text-mint-600 font-bold font-mono">0{idx + 1}</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-400">리포트를 불러오는 데 실패했습니다.</p>
              <button
                onClick={fetchReport}
                className="px-4 py-2 bg-mint-600 hover:bg-mint-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                다시 불러오기
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
