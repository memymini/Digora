import { Option } from "@/types";
import Image from "next/image";

interface ProfileProps {
  candidate: Option;
  color: string;
}

export const Profile = ({ candidate, color }: ProfileProps) => {
  return (
    <div className="w-full">
      <div className="relative aspect-[3/4] overflow-hidden mb-4 md:mb-8 transition-all rounded-lg duration-300 w-full">
        <Image
          src={candidate.imageUrl!}
          alt={candidate.name}
          fill
          className="object-cover"
        />

        <div
          className={`absolute inset-0 flex items-center ${
            color === "blue" ? "bg-vote-blue/10" : "bg-vote-red/10"
          }`}
        />
      </div>
      <div className="text-center">
        <p className={`text-lg font-bold sm:heading-2 mb-1 sm:mb-2`}>
          {candidate.name}
        </p>

        <p
          className={`text-2xl sm:heading-1 font-bold ${
            color === "blue" ? "text-vote-blue" : "text-vote-red"
          }`}
        >
          {candidate.percent || 0}%
        </p>
      </div>
    </div>
  );
};
