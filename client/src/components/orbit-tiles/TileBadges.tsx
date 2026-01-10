import { cn } from "@/lib/utils";
import type { TileConfidence, TileStatus } from "../../../../shared/orbitTileTypes";

interface ConfidenceBadgeProps {
  confidence: TileConfidence;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const styles = {
    high: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };

  const labels = {
    high: "High confidence",
    medium: "Medium",
    low: "Low",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        styles[confidence],
        className
      )}
      data-testid={`badge-confidence-${confidence}`}
    >
      {labels[confidence]}
    </span>
  );
}

interface StatusBadgeProps {
  status: TileStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status !== 'draft') return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        "bg-slate-500/20 text-slate-400 border border-slate-500/30",
        className
      )}
      data-testid="badge-status-draft"
    >
      Draft insight
    </span>
  );
}

interface FreshnessBadgeProps {
  scannedAt: string;
  className?: string;
}

export function FreshnessBadge({ scannedAt, className }: FreshnessBadgeProps) {
  const date = new Date(scannedAt);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  let label: string;
  if (diffHours < 24) {
    label = "Scanned today";
  } else if (diffHours < 48) {
    label = "Scanned yesterday";
  } else {
    label = `Scanned ${date.toLocaleDateString()}`;
  }

  return (
    <span
      className={cn(
        "text-xs text-muted-foreground",
        className
      )}
      data-testid="badge-freshness"
    >
      {label}
    </span>
  );
}
