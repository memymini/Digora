"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export const DefaultHero = () => {
  return (
    <section className="mb-12">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
          여론의 새로운 기준 <span className="text-brand-main">디고라</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          여러분의 의견을 보여주세요.
        </p>
      </div>

      <Link href="/vote/1" className="block">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative group cursor-pointer battle-card">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 z-20 shadow-lg">
            <div className="live-indicator"></div> 실시간 투표 진행중
          </div>

          <div className="flex flex-col flex-row h-auto md:h-96">
            <div className="flex-1 relative h-52 md:h-auto overflow-hidden">
              {/* Image */}
              <div className="w-full h-full relative">
                <Image
                  src="/images/politician-a.jpg"
                  alt="Option A"
                  fill
                  className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 bg-indigo-50"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex flex-col justify-end p-4 md:p-10">
                <span className="text-indigo-300 font-bold text-xs md:text-sm mb-1">
                  찬성
                </span>
                <div className="text-white text-3xl md:text-5xl font-black tracking-tighter">
                  ???
                </div>
                <div className="text-white/80 text-xs md:text-sm mt-1">
                  ▲ 참여하여 확인하기
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white rounded-full w-12 h-12 md:w-20 md:h-20 flex items-center justify-center font-black text-lg md:text-3xl shadow-lg border-4 border-slate-100 italic text-slate-800">
                VS
              </div>
            </div>

            <div className="flex-1 relative h-52 md:h-auto overflow-hidden">
              {/* Image */}
              <div className="w-full h-full relative">
                <Image
                  src="/images/politician-b.jpg"
                  alt="Option B"
                  fill
                  className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 bg-rose-50"
                  style={{ objectPosition: "top" }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/80 to-transparent flex flex-col justify-end p-4 md:p-10 items-end">
                <span className="text-rose-300 font-bold text-xs md:text-sm mb-1">
                  반대
                </span>
                <div className="text-white text-3xl md:text-5xl font-black tracking-tighter">
                  ???
                </div>
                <div className="text-white/80 text-xs md:text-sm mt-1">
                  ▲ 참여하여 확인하기
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-slate-800 transition-colors">
            <div className="font-bold text-lg text-center sm:text-left break-keep">
              지금 가장 뜨거운 이슈에 투표하세요
            </div>
            <button className="bg-brand-main hover:bg-indigo-400 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors shadow-lg shadow-indigo-500/30 w-full sm:w-auto">
              🔥 지금 참여하기
            </button>
          </div>
        </div>
      </Link>
    </section>
  );
};
