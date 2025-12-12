export const RankingSection = () => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          🏆 명예의 전당{" "}
          <span className="text-xs font-normal text-slate-400">
            (오늘 기준)
          </span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-black text-sm shadow-md">
              1
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-800">
                불꽃효자이재명
              </div>
              <div className="text-xs text-slate-400">총 12,400타</div>
            </div>
            <span className="text-xs font-bold text-brand-main bg-indigo-50 px-2 py-1 rounded-full">
              찬성측
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white font-black text-sm">
              2
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-800">국회수호자</div>
              <div className="text-xs text-slate-400">총 10,120타</div>
            </div>
            <span className="text-xs font-bold text-brand-sub bg-rose-50 px-2 py-1 rounded-full">
              반대측
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-700/50 flex items-center justify-center text-white font-black text-sm">
              3
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-800">
                아무나이겨라
              </div>
              <div className="text-xs text-slate-400">총 8,400타</div>
            </div>
            <span className="text-xs font-bold text-brand-main bg-indigo-50 px-2 py-1 rounded-full">
              찬성측
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 mb-2">
            당신의 순위는 상위 45%입니다.
          </p>
          <button className="w-full py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
            내 순위 올리러 가기
          </button>
        </div>
      </div>
    </div>
  );
};
