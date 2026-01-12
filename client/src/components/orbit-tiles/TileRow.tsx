import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { OrbitTile } from "../../../../shared/orbitTileTypes";
import { TileCard } from "./TileCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TileRowProps {
  title: string;
  tiles: OrbitTile[];
  onTileClick?: (tile: OrbitTile) => void;
  className?: string;
}

export function TileRow({ title, tiles, onTileClick, className }: TileRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };
  
  if (tiles.length === 0) return null;
  
  return (
    <div className={cn("relative", className)} data-testid={`tile-row-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        <span className="text-sm text-muted-foreground">
          {tiles.length} tile{tiles.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="relative group">
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll('left')}
            data-testid="scroll-left"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          onScroll={updateScrollButtons}
        >
          {tiles.map((tile) => (
            <TileCard
              key={tile.id}
              tile={tile}
              onClick={() => onTileClick?.(tile)}
            />
          ))}
        </div>
        
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll('right')}
            data-testid="scroll-right"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
