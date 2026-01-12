import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Database, Globe, FileText, AlertTriangle, XCircle } from "lucide-react";

export interface IngestionEvidence {
  traceId: string;
  nm_policyVersion: string;
  nm_ingest: {
    mode: 'light' | 'standard' | 'user_assisted';
    discoverySources: string[];
    pagesPlanned: number;
    pagesFetched: number;
    pagesUsed: number;
    cacheHits: number;
    cacheMisses: number;
    outcome: 'success' | 'partial' | 'blocked' | 'error';
    frictionSignals: string[];
    domainRiskScore: number;
    durationMs: number;
  };
}

interface IngestionSummaryProps {
  evidence: IngestionEvidence;
  className?: string;
}

function getOutcomeInfo(outcome: string): { icon: React.ReactNode; label: string; color: string } {
  switch (outcome) {
    case 'success':
      return { 
        icon: <CheckCircle className="w-4 h-4" />, 
        label: 'Success', 
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
      };
    case 'partial':
      return { 
        icon: <AlertTriangle className="w-4 h-4" />, 
        label: 'Partial', 
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' 
      };
    case 'blocked':
      return { 
        icon: <XCircle className="w-4 h-4" />, 
        label: 'Blocked', 
        color: 'text-red-400 bg-red-500/10 border-red-500/30' 
      };
    default:
      return { 
        icon: <XCircle className="w-4 h-4" />, 
        label: 'Error', 
        color: 'text-red-400 bg-red-500/10 border-red-500/30' 
      };
  }
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case 'light': return 'Light Mode';
    case 'standard': return 'Standard Mode';
    case 'user_assisted': return 'Assisted Mode';
    default: return mode;
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function IngestionSummary({ evidence, className }: IngestionSummaryProps) {
  const { nm_ingest } = evidence;
  const outcomeInfo = getOutcomeInfo(nm_ingest.outcome);
  
  return (
    <div className={cn("p-4 rounded-xl bg-white/5 border border-white/10 space-y-4", className)} data-testid="ingestion-summary">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">Scan Summary</h3>
        <div className={cn("flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border", outcomeInfo.color)}>
          {outcomeInfo.icon}
          {outcomeInfo.label}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard 
          icon={<Globe className="w-4 h-4 text-blue-400" />}
          label="Mode"
          value={getModeLabel(nm_ingest.mode)}
        />
        <StatCard 
          icon={<FileText className="w-4 h-4 text-pink-400" />}
          label="Pages"
          value={`${nm_ingest.pagesUsed}/${nm_ingest.pagesFetched}`}
          sublabel={`of ${nm_ingest.pagesPlanned} planned`}
        />
        <StatCard 
          icon={<Database className="w-4 h-4 text-purple-400" />}
          label="Cache"
          value={`${nm_ingest.cacheHits} hits`}
          sublabel={`${nm_ingest.cacheMisses} misses`}
        />
        <StatCard 
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          label="Duration"
          value={formatDuration(nm_ingest.durationMs)}
        />
      </div>
      
      {nm_ingest.discoverySources.length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <span className="text-xs text-white/50">Discovery sources: </span>
          <span className="text-xs text-white/70">
            {nm_ingest.discoverySources.join(', ')}
          </span>
        </div>
      )}
      
      {nm_ingest.frictionSignals.length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <span className="text-xs text-amber-400">Friction detected: </span>
          <span className="text-xs text-white/50">
            {nm_ingest.frictionSignals.slice(0, 3).map(s => s.split(':')[0]).join(', ')}
            {nm_ingest.frictionSignals.length > 3 && ` +${nm_ingest.frictionSignals.length - 3} more`}
          </span>
        </div>
      )}
      
      <div className="text-[10px] text-white/30 font-mono pt-2 border-t border-white/5">
        trace: {evidence.traceId.substring(0, 8)} | policy: {evidence.nm_policyVersion}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}

function StatCard({ icon, label, value, sublabel }: StatCardProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-white/50">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-white">{value}</div>
      {sublabel && <div className="text-[10px] text-white/40">{sublabel}</div>}
    </div>
  );
}
