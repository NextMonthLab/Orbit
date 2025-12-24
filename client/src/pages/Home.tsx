import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Play, ArrowRight, Flame } from "lucide-react";
import { MOCK_UNIVERSE, MOCK_CARDS } from "@/lib/mockData";

export default function Home() {
  const todayCard = MOCK_CARDS[0]; // Assume first card is today for MVP

  return (
    <Layout>
      <div className="p-4 pt-8 md:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Header with Streak */}
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Daily Drop</span>
                <h1 className="text-3xl md:text-5xl font-display font-black text-foreground uppercase tracking-tight">{MOCK_UNIVERSE.name}</h1>
            </div>
            <div className="flex flex-col items-center bg-card border border-border px-3 py-2 rounded-lg shadow-lg">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                <span className="text-xs font-bold font-mono mt-1">DAY 3</span>
            </div>
        </div>

        <p className="text-muted-foreground max-w-sm text-sm border-l-2 border-primary/50 pl-3 italic">
            {MOCK_UNIVERSE.description}
        </p>

        {/* Today's Card Preview */}
        <div className="relative max-w-sm mx-auto group cursor-pointer mt-8">
             <Link href="/today">
                <div className="relative aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border-2 border-white/5 group-hover:border-primary/50 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-primary/20">
                    <img src={todayCard.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/40 backdrop-blur-sm animate-pulse">
                            <Play className="w-6 h-6 text-white ml-1 fill-white" />
                        </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent pt-24">
                        <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-bold bg-primary text-white rounded uppercase tracking-wider shadow-lg">Today's Chapter</span>
                        <h2 className="text-3xl font-display font-bold text-white mb-1 drop-shadow-md">{todayCard.title}</h2>
                        <div className="flex items-center gap-2 text-white/80 text-xs font-medium tracking-wide">
                            <span>TAP TO WATCH</span>
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
            <Link href="/catch-up">
                <div className="p-4 rounded-lg bg-card/50 border border-border hover:bg-card hover:border-primary/50 transition-all cursor-pointer text-center group">
                    <span className="block text-2xl font-bold mb-1 group-hover:text-primary transition-colors">2</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Missed Cards</span>
                </div>
            </Link>
             <a href="https://discord.com" target="_blank" rel="noreferrer">
                <div className="p-4 rounded-lg bg-card/50 border border-border hover:bg-[#5865F2]/10 hover:border-[#5865F2] transition-all cursor-pointer text-center group">
                    <span className="block text-2xl font-bold mb-1 group-hover:text-[#5865F2] transition-colors">👾</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Community</span>
                </div>
            </a>
        </div>

      </div>
    </Layout>
  );
}
