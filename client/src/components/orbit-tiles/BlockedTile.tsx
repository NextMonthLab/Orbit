import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, HelpCircle, ArrowRight, Users, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlockedTileProps {
  blockedReason?: string;
  hostname?: string;
  onRequestAssistance?: () => void;
  onTryManualImport?: () => void;
  className?: string;
}

export function BlockedTile({ 
  blockedReason, 
  hostname,
  onRequestAssistance,
  onTryManualImport,
  className 
}: BlockedTileProps) {
  const isBotProtection = blockedReason?.toLowerCase().includes('bot protection') || 
                          blockedReason?.toLowerCase().includes('403') ||
                          blockedReason?.toLowerCase().includes('challenge');
  
  return (
    <div 
      className={cn(
        "p-6 rounded-xl border-2 border-dashed",
        isBotProtection 
          ? "border-amber-500/30 bg-amber-500/5" 
          : "border-red-500/30 bg-red-500/5",
        className
      )}
      data-testid="blocked-tile"
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          isBotProtection ? "bg-amber-500/20" : "bg-red-500/20"
        )}>
          {isBotProtection ? (
            <Shield className={cn("w-6 h-6", isBotProtection ? "text-amber-400" : "text-red-400")} />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-400" />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-base font-medium text-white">
              {isBotProtection ? "Website Protection Detected" : "Scan Incomplete"}
            </h3>
            <p className="text-sm text-white/60 mt-1">
              {isBotProtection 
                ? `${hostname || 'This website'} uses bot protection that prevents automated scanning.`
                : blockedReason || "Unable to fully scan this website."
              }
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <HelpCircle className="w-3.5 h-3.5" />
              Recommended next steps
            </div>
            <ul className="space-y-1.5 text-sm text-white/70">
              {isBotProtection && (
                <>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-pink-400 shrink-0" />
                    <span>Use <strong>Assisted Mode</strong> to manually provide page content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-pink-400 shrink-0" />
                    <span>Request our team to set up your Orbit for you</span>
                  </li>
                </>
              )}
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-pink-400 shrink-0" />
                <span>Import your product/menu data manually via JSON</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {onRequestAssistance && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestAssistance}
                className="border-pink-500/30 hover:bg-pink-500/10"
                data-testid="button-request-assistance"
              >
                <Users className="w-4 h-4 mr-2" />
                Request Assistance
              </Button>
            )}
            {onTryManualImport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTryManualImport}
                data-testid="button-manual-import"
              >
                <Upload className="w-4 h-4 mr-2" />
                Try Manual Import
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
