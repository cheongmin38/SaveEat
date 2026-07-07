/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { ConsumerHome } from './components/ConsumerHome';
import { ConsumerMap } from './components/ConsumerMap';
import { ConsumerFavorites } from './components/ConsumerFavorites';
import { ConsumerOrders } from './components/ConsumerOrders';
import { ConsumerMyPage } from './components/ConsumerMyPage';
import { SellerDashboard } from './components/SellerDashboard';
import { SellerRegister } from './components/SellerRegister';
import { SellerStats } from './components/SellerStats';

import { Home, MapPin, Heart, ClipboardList, User, LayoutDashboard, PlusCircle, BarChart3, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { currentRole, orders } = useApp();

  // Navigation states
  const [consumerTab, setConsumerTab] = useState<'home' | 'map' | 'favorites' | 'orders' | 'mypage'>('home');
  const [sellerTab, setSellerTab] = useState<'dashboard' | 'register' | 'stats'>('dashboard');

  const pendingReservationsCount = orders.filter(o => o.status === 'pending').length;

  const renderConsumerView = () => {
    switch (consumerTab) {
      case 'home':
        return <ConsumerHome />;
      case 'map':
        return <ConsumerMap />;
      case 'favorites':
        return <ConsumerFavorites />;
      case 'orders':
        return <ConsumerOrders />;
      case 'mypage':
        return <ConsumerMyPage />;
      default:
        return <ConsumerHome />;
    }
  };

  const renderSellerView = () => {
    switch (sellerTab) {
      case 'dashboard':
        return <SellerDashboard />;
      case 'register':
        return <SellerRegister />;
      case 'stats':
        return <SellerStats />;
      default:
        return <SellerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col font-sans text-slate-800 antialiased selection:bg-mint-100 selection:text-mint-900 pb-20">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {currentRole === 'consumer' && (
            <motion.div
              key="consumer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Dynamic Consumer Page Render */}
              {renderConsumerView()}

              {/* Sticky bottom mobile navigation menu bar */}
              <div className="fixed bottom-4 inset-x-0 bg-slate-900 text-white border border-slate-800 py-3 px-6 z-40 flex justify-around items-center max-w-md mx-auto rounded-full shadow-2xl">
                {[
                  { id: 'home', label: '홈', icon: Home },
                  { id: 'map', label: '지도', icon: MapPin },
                  { id: 'favorites', label: '단골', icon: Heart },
                  { id: 'orders', label: '주문내역', icon: ClipboardList, badge: pendingReservationsCount > 0 ? pendingReservationsCount : undefined },
                  { id: 'mypage', label: '마이리포트', icon: User }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = consumerTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setConsumerTab(tab.id as any)}
                      className={`relative flex flex-col items-center space-y-1 py-1 px-3.5 rounded-full transition-all duration-200 ${
                        isActive 
                          ? 'text-mint-500 scale-105 font-bold' 
                          : 'text-slate-400 hover:text-white font-medium'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-mint-500' : 'stroke-[1.8px]'}`} />
                      <span className="text-[10px] tracking-tight">{tab.label}</span>
                      
                      {tab.badge !== undefined && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-bold text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {currentRole === 'seller' && (
            <motion.div
              key="seller"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Sub navigation pills for seller admin */}
              <div className="flex space-x-1.5 bg-white p-1.5 border border-slate-200/60 rounded-full max-w-md mx-auto shadow-sm select-none">
                {[
                  { id: 'dashboard', label: '현황판', icon: LayoutDashboard },
                  { id: 'register', label: '상품 등록', icon: PlusCircle },
                  { id: 'stats', label: '분석 및 통계', icon: BarChart3 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = sellerTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSellerTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Seller Page Render */}
              {renderSellerView()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
