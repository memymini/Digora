"use client";

import { VoteFeed } from "@/components/home/VoteFeed";
import { HeroSection } from "@/components/home/HeroSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background w-full">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection />
        {/*투표리스트*/}
        <VoteFeed />
      </main>
    </div>
  );
}
