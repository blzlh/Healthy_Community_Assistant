import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeFooter } from "@/components/home/HomeFooter";

export function Home() {
  return (
    <div className="h-screen bg-black text-white antialiased overflow-hidden flex flex-col">
      <HomeHeader />
      <div className="flex-1 overflow-y-auto home-scroll">
        <div className="mx-auto w-[96%] bg-[#0A0A0A] border border-[#292929] rounded-md">
          <div className="px-8 md:px-16 flex flex-col gap-12 py-10">
            <HomeHero />
            <HomeFeatures />
          </div>
        </div>
        <HomeFooter />
      </div>
    </div>
  );
}

export default function HomePage() {
  return <Home />;
}
