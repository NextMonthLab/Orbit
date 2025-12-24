import Layout from "@/components/Layout";
import CardPlayer from "@/components/CardPlayer";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Download } from "lucide-react";
import { MOCK_CARDS } from "@/lib/mockData";
import { Link } from "wouter";

export default function Today() {
  const card = MOCK_CARDS[0];

  return (
    <Layout>
      <div className="p-4 pb-24 md:p-8 max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* The Card Player */}
        <CardPlayer card={card} />

        {/* Scene Text */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold">{card.title}</h1>
                <span className="text-xs font-mono text-muted-foreground">DAY {card.dayIndex}</span>
            </div>
            
            <p className="text-lg leading-relaxed text-muted-foreground font-serif border-l-2 border-primary pl-4 italic">
                "{card.sceneText}"
            </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3">
            <Link href="/chat">
                <Button size="lg" className="w-full gap-2 text-md py-6 font-display">
                    <MessageSquare className="w-5 h-5" />
                    Chat with Character
                </Button>
            </Link>
            
            <Button variant="outline" className="w-full gap-2 border-white/10 hover:bg-white/5">
                <Download className="w-4 h-4" />
                Save Video Clip
            </Button>
        </div>

      </div>
    </Layout>
  );
}
