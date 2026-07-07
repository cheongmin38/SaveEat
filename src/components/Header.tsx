/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Leaf, Store, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Header: React.FC = () => {
  const { currentRole, setCurrentRole, stats } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setCurrentRole('consumer')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-mint-500 shadow-sm shadow-mint-500/10">
              <Leaf className="w-5.5 h-5.5 text-white" />
              <motion.div 
                className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="text-[8px] font-extrabold text-white leading-none">%</span>
              </motion.div>
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                라스트픽<span className="text-orange-500 font-display font-medium">LastPick</span>
              </span>
              <p className="text-[10px] text-mint-600 font-bold leading-none mt-0.5 flex items-center">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" /> ESG 푸드 세이버
              </p>
            </div>
          </div>

          {/* Location for context */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200/60 rounded-full text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-mint-500" />
            <span>서울시 마포구 창전동 주변 📍</span>
          </div>

          {/* Role Switching Tabs (Consumer / Seller / IR Hub) */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200/40">
            <button
              onClick={() => setCurrentRole('consumer')}
              className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                currentRole === 'consumer'
                  ? 'bg-white text-mint-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-mint-500" />
              <span className="hidden sm:inline">소비자 홈</span>
            </button>
            <button
              onClick={() => setCurrentRole('seller')}
              className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                currentRole === 'seller'
                  ? 'bg-white text-orange-500 shadow-sm'
                  : 'text-slate-600 hover:text-orange-500'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden sm:inline">판매자 관리</span>
            </button>
          </div>

          {/* Global ESG Impact Metric */}
          <div className="hidden lg:flex items-center space-x-2 bg-mint-50/50 px-3.5 py-1.5 rounded-full border border-mint-100">
            <div className="w-2 h-2 bg-mint-500 rounded-full animate-pulse" />
            <span className="text-[11px] text-slate-700 font-medium">
              오늘 구조한 탄소: <strong className="text-mint-600 font-mono">{(stats.carbonSavedKg * 12.5).toFixed(1)}kg</strong> CO₂ 🌿
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
