/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Upload, Leaf, Trees, RefreshCw, ArrowRight, Sparkles, AlertCircle, Check, Info, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AICarbonPhotoAnalysis } from '../types';

export const ConsumerCarbonCalc: React.FC = () => {
  const { analyzeFoodPhotoCarbon } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AICarbonPhotoAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  
  // Camera specific states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Suggested pre-loaded options for quick trial
  const sampleFoods = [
    {
      name: "육즙가득 비프 햄버거 패티",
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60",
      desc: "고탄소 육류 식단 테스트"
    },
    {
      name: "달콤 촉촉 초코 딸기 케이크",
      img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=60",
      desc: "중탄소 가공 제과식단 테스트"
    },
    {
      name: "신선 가득 아보카도 야채 샐러드",
      img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60",
      desc: "저탄소 건강식단 테스트"
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setAnalysis(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setError("카메라 장치 권한을 획득하지 못했습니다. 파일 업로드 방식을 사용해 주세요.");
      setActiveTab('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
    }
  };

  const handleSampleClick = async (sampleImgUrl: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);
    setImage(sampleImgUrl);
    
    try {
      // Fetch image and convert to base64
      const response = await fetch(sampleImgUrl);
      const blob = await response.blob();
      setMimeType(blob.type);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const result = await analyzeFoodPhotoCarbon(base64, blob.type);
          setAnalysis(result);
        } catch (err: any) {
          setError(err.message || "분석 중 오류 발생");
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (e: any) {
      setError("샘플 이미지를 다운로드하여 분석하는 도중 에러가 발생했습니다.");
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      const result = await analyzeFoodPhotoCarbon(image, mimeType);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "AI 분석 과정에서 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    stopCamera();
  };

  const getLevelBadgeColor = (level?: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'LOW':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getLevelText = (level?: string) => {
    switch (level) {
      case 'HIGH':
        return '고탄소 식단 ⚠️';
      case 'MEDIUM':
        return '중탄소 식단 ☕';
      case 'LOW':
        return '친환경 저탄소 식단 🌱';
      default:
        return '일반 식단';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 shadow-xl border border-slate-800">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-mint-500/15 rounded-full blur-2xl" />
        
        <div className="relative space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30">
              지구 수호대 AI 스캔
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">AI 음식 사진 탄소 발자국 계산기 📸</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            음식 사진을 촬영하거나 업로드하면, Gemini AI가 주원료 성분을 정밀 식별해 <br className="hidden sm:inline" />
            이산화탄소 배출 수치와 소나무 환산 지표, 그리고 지구를 살리는 식습관 팁을 전해드립니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Control Panel / Image Input */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800">음식 이미지 소스</h3>

            {!image && !cameraActive ? (
              <div className="space-y-4">
                {/* Mode Select Tabs */}
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button
                    onClick={() => { stopCamera(); setActiveTab('upload'); }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      activeTab === 'upload' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    사진 업로드
                  </button>
                  <button
                    onClick={() => { setActiveTab('camera'); startCamera(); }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      activeTab === 'camera' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    카메라 촬영
                  </button>
                </div>

                {/* Upload Panel */}
                {activeTab === 'upload' && (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-200/80 rounded-2xl p-6 text-center hover:border-emerald-400 transition-all cursor-pointer bg-slate-50/50"
                  >
                    <label className="cursor-pointer space-y-2.5 block">
                      <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-700">여기로 사진을 끌어다 놓거나 클릭</p>
                        <p className="text-[9px] text-slate-400">JPG, PNG 파일 지원 (최대 10MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Camera Fallback text if camera hasn't loaded */}
                {activeTab === 'camera' && !cameraActive && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    카메라를 로딩하는 중입니다...
                  </div>
                )}
              </div>
            ) : null}

            {/* Camera Capture View */}
            {cameraActive && !image && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-800">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                    LIVE CAMERA
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>찰칵! 촬영하기</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview & Analyze Action */}
            {image && (
              <div className="space-y-3.5">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square border border-slate-100 shadow-inner">
                  <img src={image} alt="Uploaded food" className="w-full h-full object-cover" />
                  
                  {/* Real-time laser scanning animation during AI analysis */}
                  {isAnalyzing && (
                    <motion.div
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.8, ease: "linear" }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.9)] z-10"
                    />
                  )}
                  
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="bg-slate-900/90 text-white rounded-full px-3 py-1.5 text-[9px] font-black tracking-widest flex items-center space-x-1.5 shadow-lg border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>AI 식자재 정밀 스캔 중</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={resetAnalyzer}
                    disabled={isAnalyzing}
                    className="absolute top-2 right-2 bg-black/75 hover:bg-black/90 text-white rounded-full p-1.5 transition-all z-20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!analysis && !isAnalyzing && (
                  <button
                    onClick={handleAnalyze}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-mint-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center space-x-1.5 hover:opacity-95"
                  >
                    <Leaf className="w-4 h-4" />
                    <span>AI 탄소 배출 분석 시작</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Experience / Sandbox Samples */}
          {!image && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-800">빠른 샘플 스캔 체험</h3>
              </div>
              <p className="text-[10px] text-slate-400">카메라가 없거나 올릴 사진이 없다면 아래의 대표적인 식단 샘플을 클릭하여 즉석에서 탄소를 정밀 진단해보세요.</p>
              
              <div className="space-y-2">
                {sampleFoods.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleClick(s.img)}
                    className="w-full p-2 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/10 text-left flex items-center space-x-2.5 transition-all"
                  >
                    <img src={s.img} alt={s.name} className="w-10 h-10 object-cover rounded-lg bg-slate-200" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold text-slate-700 truncate">{s.name}</p>
                      <p className="text-[8px] text-slate-400">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Output Analysis Details */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xs h-full flex flex-col justify-center items-center py-20"
              >
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    <Leaf className="w-5 h-5 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-xs font-bold text-slate-800 animate-pulse">Gemini AI 푸드 에코분석 실행 중</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">사진 속 음식 형태와 미세한 결을 정밀 스캔하고 있습니다. 주재료를 낱낱이 분해하여 친환경 탄소 가중치를 수학적으로 대조 중입니다...</p>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-100/50 p-3.5 rounded-2xl max-w-xs text-left">
                  <p className="text-[9px] text-slate-600 leading-normal font-medium">
                    🔍 <b>IPCC & FAO 국제 데이터셋 연동 완료</b><br />
                    소고기(1kg당 27kg CO2e), 치즈/유제품(1kg당 11.9kg CO2e) 등 최신 국제 표준 배출계수를 바탕으로 실시간 수학적 정밀 계산을 수립하고 있습니다.
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-100 text-red-700 p-5 rounded-3xl space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <h4 className="text-xs font-bold">탄소 분석 에러</h4>
                </div>
                <p className="text-[10px] text-red-600/90 leading-relaxed font-medium">{error}</p>
                <button
                  onClick={resetAnalyzer}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold shadow-sm"
                >
                  다시 시도하기
                </button>
              </motion.div>
            )}

            {!isAnalyzing && !error && !analysis && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-4 shadow-2xs h-full flex flex-col justify-center py-24"
              >
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Camera className="w-6 h-6 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700">스캔 대기 중</h4>
                  <p className="text-[10px] text-slate-400 leading-normal max-w-sm mx-auto">
                    좌측 패널에서 음식의 원물 사진을 직접 촬영하거나, 앨범에서 이미지를 올려 AI 분석을 진행해보세요.
                  </p>
                </div>
              </motion.div>
            )}

            {analysis && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Main Stats Card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className={`text-[9px] font-extrabold px-2.5 py-1 border rounded-full ${getLevelBadgeColor(analysis.carbonLevel)}`}>
                        {getLevelText(analysis.carbonLevel)}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-800 mt-2">{analysis.foodName}</h3>
                      <p className="text-[10px] text-slate-400">측정 중량 분량: {analysis.estimatedWeight}</p>
                    </div>
                    
                    <div className="text-right space-y-0.5">
                      <p className="text-[9px] text-slate-400 font-bold">온실가스 배출량</p>
                      <p className="text-2xl font-black text-slate-800">
                        {analysis.carbonFootprintKg.toFixed(2)}<span className="text-xs font-extrabold text-slate-400 ml-0.5">kg CO₂e</span>
                      </p>
                    </div>
                  </div>

                  {/* Visual carbon level gauge */}
                  <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400">
                      <span>저탄소 식단 (0~1kg)</span>
                      <span>중탄소 (1~3kg)</span>
                      <span>고탄소 (3kg+)</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-400 transition-all" style={{ width: analysis.carbonLevel === 'LOW' ? '100%' : '33.3%' }} />
                      <div className="h-full bg-amber-400 transition-all" style={{ width: analysis.carbonLevel === 'MEDIUM' ? '100%' : analysis.carbonLevel === 'LOW' ? '0%' : '33.3%' }} />
                      <div className="h-full bg-red-400 transition-all" style={{ width: analysis.carbonLevel === 'HIGH' ? '100%' : '0%' }} />
                    </div>
                    <p className="text-[9.5px] text-slate-500 font-medium leading-relaxed mt-1">
                      💡 이 음식 한 끼를 섭취함으로써 발생하는 탄소 발자국은 30년생 소나무 약 <span className="font-bold text-slate-800 text-[11px] underline underline-offset-2">{analysis.equivalentTrees}그루</span>가 일 년간 흡수해야 정화되는 엄청난 환경적 무게입니다.
                    </p>
                  </div>

                  {/* HIGH ACCURACY: Ingredient Breakdown Visualizer */}
                  {analysis.ingredients && analysis.ingredients.length > 0 && (
                    <div className="space-y-3 bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-800 flex items-center">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500 mr-1 animate-pulse" />
                          정밀 식자재 성분 분석 및 탄소 비중
                        </h4>
                        <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-100">FAO/IPCC 수치 기준</span>
                      </div>
                      
                      <div className="space-y-3">
                        {analysis.ingredients.map((ing, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-700">
                              <span className="flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                                {ing.name} <span className="text-slate-400 font-normal ml-1">({ing.weightG}g)</span>
                              </span>
                              <span className="font-mono text-slate-500">
                                {(ing.co2G / 1000).toFixed(3)}kg CO₂e <span className="text-emerald-600 font-bold ml-1">({ing.ratio}%)</span>
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${ing.ratio}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className="h-full bg-emerald-500/85 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ecological analysis text */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-800 flex items-center">
                      <Info className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                      주재료별 탄소 발자국 심층 진단
                    </h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium bg-slate-50/30 p-3 rounded-xl border border-slate-100">
                      {analysis.carbonAnalysis}
                    </p>
                  </div>
                </div>

                {/* Earth Saving Tips */}
                <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-3xl p-5 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-800 flex items-center">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    지구를 살리는 현명한 수호 팁
                  </h4>
                  
                  <div className="space-y-2.5">
                    {analysis.earthSavingTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alternative Recommendation Card */}
                <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg space-y-3">
                  <div className="flex items-center space-x-1">
                    <ShieldAlert className="w-4 h-4 text-orange-400" />
                    <h4 className="text-xs font-bold text-orange-400">환경 보호를 위한 저탄소 '라스트픽' 제안</h4>
                  </div>
                  
                  <p className="text-[10.5px] text-slate-300 leading-relaxed font-medium">
                    {analysis.recommendedAlternative}
                  </p>

                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">우리 동네 유기농 빵집/샐러드 마감 할인 보러가기</span>
                    <button className="p-1 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
