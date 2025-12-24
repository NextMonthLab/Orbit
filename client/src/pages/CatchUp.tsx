import Layout from "@/components/Layout";
import { MOCK_CARDS } from "@/lib/mockData";
import { Link } from "wouter";
import { CheckCircle2, Lock } from "lucide-react";

export default function CatchUp() {
  return (
    <Layout>
      <div className="p-4 pt-8 md:p-8 max-w-md mx-auto animate-in fade-in duration-500">
        <h1 className="text-3xl font-display font-bold mb-6">Archive</h1>

        <div className="space-y-4">
          {/* Timeline Line */}
          <div className="absolute left-8 top-32 bottom-0 w-px bg-border -z-10 hidden md:block" />

          {MOCK_CARDS.map((card, index) => (
            <Link key={card.id} href={index === 0 ? "/today" : "#"}>
                <div className="group relative flex gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer overflow-hidden">
                    {/* Thumbnail */}
                    <div className="w-20 h-32 flex-shrink-0 rounded-md overflow-hidden bg-black relative">
                         <img src={card.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                         {index === 0 && (
                            <div className="absolute inset-0 bg-primary/20 ring-2 ring-primary inset-0" />
                         )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1">
                             <span className="text-xs font-bold text-primary tracking-wider uppercase">Day {card.dayIndex}</span>
                             {index === 0 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{card.recapText}</p>
                    </div>
                </div>
            </Link>
          ))}
          
          {/* Locked Future Cards */}
          {[4, 5, 6].map((day) => (
             <div key={day} className="flex gap-4 p-4 rounded-lg border border-white/5 bg-white/5 opacity-50 cursor-not-allowed">
                 <div className="w-20 h-32 flex-shrink-0 rounded-md bg-white/5 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white/20" />
                 </div>
                 <div className="flex-1 flex flex-col justify-center">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Day {day}</span>
                    <h3 className="text-xl font-display font-bold mb-2 text-muted-foreground">Locked</h3>
                 </div>
             </div>
          ))}

        </div>
      </div>
    </Layout>
  );
}
