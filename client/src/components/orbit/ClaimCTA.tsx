import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink } from "lucide-react";

interface ClaimCTAProps {
  businessSlug: string;
  brandName?: string;
  isSticky?: boolean;
}

export function ClaimCTA({ businessSlug, brandName, isSticky = true }: ClaimCTAProps) {
  const handleClaim = () => {
    window.location.href = `/for/brands?claim=${businessSlug}`;
  };

  return (
    <div 
      className={`
        ${isSticky ? 'fixed bottom-0 left-0 right-0 z-50' : ''}
        bg-gradient-to-r from-zinc-900/95 via-zinc-900/98 to-zinc-900/95 
        backdrop-blur-md border-t border-pink-500/20
      `}
      data-testid="claim-cta-banner"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-medium text-zinc-100">
              {brandName ? `Is this your business?` : 'Claim this Orbit'}
            </p>
            <p className="text-xs sm:text-sm text-zinc-400">
              Take control and unlock the full experience
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleClaim}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium px-6"
          data-testid="button-claim-orbit"
        >
          <span className="hidden sm:inline">Claim this Orbit</span>
          <span className="sm:hidden">Claim</span>
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-center py-2 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-500">
          Powered by <span className="text-pink-400 font-medium">NextMonth</span>
        </p>
      </div>
    </div>
  );
}
