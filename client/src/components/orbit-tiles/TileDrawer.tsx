import { cn } from "@/lib/utils";
import type { OrbitTile } from "../../../../shared/orbitTileTypes";
import { ConfidenceBadge, StatusBadge, FreshnessBadge } from "./TileBadges";
import { X, ExternalLink, MessageCircle, Sparkles, Bookmark, Share2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TileDrawerProps {
  tile: OrbitTile | null;
  onClose: () => void;
  className?: string;
}

export function TileDrawer({ tile, onClose, className }: TileDrawerProps) {
  if (!tile) return null;
  
  const isDraft = tile.status === 'draft';
  
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-full sm:w-[480px] bg-background border-l border-border shadow-2xl z-50",
        "animate-in slide-in-from-right duration-300",
        className
      )}
      data-testid="tile-drawer"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={tile.confidence} />
            <StatusBadge status={tile.status} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="drawer-close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {tile.title}
          </h2>
          
          <p className="text-muted-foreground mb-4">
            {tile.summary}
          </p>
          
          <FreshnessBadge scannedAt={tile.freshness.scannedAt} className="mb-6 block" />
          
          {isDraft && tile.missingSignals && tile.missingSignals.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-400 mb-2">Missing Information</h4>
                  <ul className="space-y-1">
                    {tile.missingSignals.map((signal, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {tile.sources.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Sources ({tile.sources.length})
              </h3>
              <div className="space-y-3">
                {tile.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/50 rounded-lg p-4 border border-border"
                    data-testid={`source-${idx}`}
                  >
                    {source.excerpt && (
                      <blockquote className="text-sm text-foreground italic mb-2 pl-3 border-l-2 border-primary">
                        "{source.excerpt}"
                      </blockquote>
                    )}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {source.title || source.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2"
              data-testid="action-ask-orbit"
            >
              <MessageCircle className="w-4 h-4" />
              Ask Orbit
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              data-testid="action-generate-ice"
            >
              <Sparkles className="w-4 h-4" />
              Generate ICE
            </Button>
            <Button
              variant="ghost"
              className="gap-2"
              data-testid="action-save"
            >
              <Bookmark className="w-4 h-4" />
              Save
            </Button>
            <Button
              variant="ghost"
              className="gap-2"
              data-testid="action-share"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TileDrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TileDrawerOverlay({ isOpen, onClose }: TileDrawerOverlayProps) {
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="tile-drawer-overlay"
    />
  );
}
