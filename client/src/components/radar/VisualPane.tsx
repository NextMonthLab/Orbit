import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ExternalLink, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Link2, 
  ChevronLeft, 
  ChevronRight,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TileVisualBinding } from '@shared/schema';

interface TileInfo {
  id: number | string;
  label?: string;
  name?: string;
  title?: string;
}

interface VisualPaneProps {
  tile: TileInfo | null;
  orbitSlug: string;
  isOwnerMode: boolean;
  onVisualCorrection?: (message: string) => void;
  className?: string;
}

function getTileLabel(tile: TileInfo): string {
  return tile.label || tile.name || tile.title || 'Unknown';
}

export function VisualPane({ 
  tile, 
  orbitSlug, 
  isOwnerMode, 
  onVisualCorrection,
  className 
}: VisualPaneProps) {
  const [bindings, setBindings] = useState<TileVisualBinding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!tile?.id) {
      setBindings([]);
      setCurrentIndex(0);
      return;
    }

    const fetchBindings = async () => {
      setIsLoading(true);
      try {
        // tile.id can be number or string - pass as-is to API
        // API will handle parsing/lookup based on ID format
        const tileId = String(tile.id);
        const response = await fetch(`/api/orbit/${orbitSlug}/tiles/${encodeURIComponent(tileId)}/visuals`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setBindings(data.bindings || []);
          setCurrentIndex(0);
        } else {
          // Not found is ok - tile may not have bindings
          setBindings([]);
        }
      } catch (error) {
        console.error('Failed to fetch visual bindings:', error);
        setBindings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBindings();
  }, [tile?.id, orbitSlug]);

  if (!tile) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center h-full text-muted-foreground p-6",
        className
      )}>
        <HelpCircle className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm text-center">
          Select a knowledge tile to see its linked visuals
        </p>
      </div>
    );
  }

  const currentBinding = bindings[currentIndex];
  const hasMultiple = bindings.length > 1;

  const getBindingIcon = (type: string) => {
    switch (type) {
      case 'page': return <FileText className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'embed': return <Link2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'auto_detected': return 'Auto-detected';
      case 'owner_specified': return 'You set this';
      case 'crawl_inferred': return 'From your site';
      default: return source;
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-3 p-4", className)}>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (bindings.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center h-full text-muted-foreground p-6",
        className
      )}>
        <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm text-center mb-2">
          No visuals linked to "{getTileLabel(tile)}" yet
        </p>
        {isOwnerMode && (
          <p className="text-xs text-center opacity-70">
            Tell me about what you'd like to show here
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          {getBindingIcon(currentBinding?.bindingType || 'page')}
          <span className="text-sm font-medium truncate max-w-[200px]">
            {currentBinding?.title || getTileLabel(tile)}
          </span>
        </div>
        {currentBinding?.isPrimary && (
          <Badge variant="secondary" className="text-xs">
            Primary
          </Badge>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {currentBinding?.bindingType === 'page' && currentBinding.sourceUrl ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-muted/50 flex items-center justify-center relative group">
              {currentBinding.thumbnailUrl ? (
                <img 
                  src={currentBinding.thumbnailUrl} 
                  alt={currentBinding.title || 'Page preview'}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <FileText className="w-16 h-16 mb-2 opacity-50" />
                  <span className="text-sm">Page preview</span>
                </div>
              )}
              <a 
                href={currentBinding.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Button size="sm" variant="secondary" className="gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Open
                </Button>
              </a>
            </div>
          </div>
        ) : currentBinding?.bindingType === 'image' ? (
          <div className="h-full flex items-center justify-center bg-muted/50">
            <img 
              src={currentBinding.sourceUrl || currentBinding.assetPath || ''} 
              alt={currentBinding.title || 'Visual'}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : currentBinding?.bindingType === 'video' && currentBinding.sourceUrl ? (
          <div className="h-full flex items-center justify-center bg-black">
            <video 
              src={currentBinding.sourceUrl}
              controls
              className="max-h-full max-w-full"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/50 text-muted-foreground">
            <FileText className="w-16 h-16 opacity-50" />
          </div>
        )}
      </div>

      <div className="p-3 border-t space-y-2">
        {currentBinding?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {currentBinding.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getSourceLabel(currentBinding?.source || 'auto_detected')}
            </Badge>
            {currentBinding?.ownerApproved && (
              <Check className="w-3 h-3 text-green-500" />
            )}
          </div>
          
          {hasMultiple && (
            <div className="flex items-center gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6"
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                data-testid="button-visual-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[40px] text-center">
                {currentIndex + 1} / {bindings.length}
              </span>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6"
                onClick={() => setCurrentIndex(i => Math.min(bindings.length - 1, i + 1))}
                disabled={currentIndex === bindings.length - 1}
                data-testid="button-visual-next"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {isOwnerMode && currentBinding?.sourceReason && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-2">
            <span className="font-medium">Why this visual: </span>
            {currentBinding.sourceReason}
          </div>
        )}
      </div>
    </div>
  );
}
