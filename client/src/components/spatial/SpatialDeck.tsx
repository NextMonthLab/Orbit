import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SpatialCard } from "./SpatialCard";
import type { Lane, SiteCard } from "@/lib/siteCatalogue";

interface LaneRowProps {
  lane: Lane;
  onCardClick: (card: SiteCard) => void;
  accentColor?: string;
  theme?: 'dark' | 'light';
}

function LaneRow({ lane, onCardClick, accentColor, theme }: LaneRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  
  if (lane.cards.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 
          className="text-sm font-medium uppercase tracking-wide"
          style={{ color: accentColor }}
        >
          {lane.title}
        </h2>
        {lane.cards.length > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1 rounded-full transition-colors"
              style={{ color: mutedColor }}
              data-testid={`lane-scroll-left-${lane.id}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1 rounded-full transition-colors"
              style={{ color: mutedColor }}
              data-testid={`lane-scroll-right-${lane.id}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {lane.cards.map((card) => (
          <div key={card.id} style={{ scrollSnapAlign: 'start' }}>
            <SpatialCard
              card={card}
              onClick={onCardClick}
              accentColor={accentColor}
              theme={theme}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface SpatialDeckProps {
  lanes: Lane[];
  onCardClick: (card: SiteCard) => void;
  accentColor?: string;
  theme?: 'dark' | 'light';
}

export function SpatialDeck({ lanes, onCardClick, accentColor = '#ffffff', theme = 'dark' }: SpatialDeckProps) {
  const bgColor = theme === 'dark' ? '#0a0a0a' : '#f5f5f5';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto pt-4 pb-32"
      style={{ background: bgColor }}
      data-testid="spatial-deck"
    >
      {lanes.map((lane) => (
        <LaneRow
          key={lane.id}
          lane={lane}
          onCardClick={onCardClick}
          accentColor={accentColor}
          theme={theme}
        />
      ))}
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
}
