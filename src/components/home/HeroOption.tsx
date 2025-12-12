"use client";

import Image from "next/image";
import { Option } from "@/types";

interface HeroOptionProps {
  option: Option;
  theme: "indigo" | "rose";
  align?: "left" | "right";
}

export const HeroOption = ({
  option,
  theme,
  align = "left",
}: HeroOptionProps) => {
  const isIndigo = theme === "indigo";
  const bgClass = isIndigo ? "bg-indigo-50" : "bg-rose-50";
  const gradientClass = isIndigo ? "from-indigo-900/80" : "from-rose-900/80";
  const textClass = isIndigo ? "text-indigo-200" : "text-rose-200";
  const alignClass = align === "right" ? "items-end" : "";

  return (
    <div className="flex-1 relative h-52 md:h-auto overflow-hidden">
      <div className={`w-full h-full relative ${bgClass}`}>
        {option.imageUrl && (
          <Image
            src={option.imageUrl}
            alt={option.name}
            fill
            className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
          />
        )}
      </div>
      <div
        className={`absolute inset-0 bg-gradient-to-t ${gradientClass} to-transparent flex flex-col justify-end p-4 md:p-10 ${alignClass}`}
      >
        <span className={`${textClass} font-black text-lg md:text-3xl mb-2`}>
          {option.name}
        </span>
        <div className="text-white text-3xl md:text-5xl font-black tracking-tighter">
          {option.count}
        </div>
      </div>
    </div>
  );
};
