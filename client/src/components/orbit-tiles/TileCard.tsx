import { cn } from "@/lib/utils";
import type { OrbitTile } from "../../../../shared/orbitTileTypes";
import { ConfidenceBadge, StatusBadge, FreshnessBadge } from "./TileBadges";
import { ChevronRight, AlertCircle } from "lucide-react";

interface TileCardProps {
  tile: OrbitTile;
  onClick?: () => void;
  className?: string;
}

export function TileCard({ tile, onClick, className }: TileCardProps) {
  const isDraft = tile.status === 'draft';
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col p-4 rounded-xl border text-left transition-all duration-200",
        "bg-card hover:bg-accent/50",
        "border-border hover:border-primary/50",
        "min-w-[280px] max-w-[320px] h-[180px]",
        isDraft && "opacity-80",
        className
      )}
      data-testid={`tile-card-${tile.topicSlug}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-foreground line-clamp-1 flex-1">
          {tile.title}
        </h3>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-3 mb-auto">
        {tile.summary}
      </p>
      
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <ConfidenceBadge confidence={tile.confidence} />
        <StatusBadge status={tile.status} />
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <FreshnessBadge scannedAt={tile.freshness.scannedAt} />
        {tile.sources.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {tile.sources.length} source{tile.sources.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {isDraft && tile.missingSignals && tile.missingSignals.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-amber-950/30 to-transparent rounded-b-xl p-2">
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <AlertCircle className="w-3 h-3" />
            <span className="line-clamp-1">{tile.missingSignals[0]}</span>
          </div>
        </div>
      )}
    </button>
  );
}
