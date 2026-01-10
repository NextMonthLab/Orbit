import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Globe, RefreshCw, AlertCircle, CheckCircle, Zap, Settings2, Users } from "lucide-react";

export type IngestionMode = 'light' | 'standard' | 'user_assisted';

interface UrlIngestFormProps {
  onSubmit: (url: string, options?: { forceRescan?: boolean; mode?: IngestionMode }) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  lastUrl?: string | null;
  className?: string;
  showModeSelector?: boolean;
}

export function UrlIngestForm({ 
  onSubmit, 
  isLoading = false, 
  error = null,
  lastUrl = null,
  className,
  showModeSelector = true
}: UrlIngestFormProps) {
  const [url, setUrl] = useState(lastUrl || "");
  const [isValid, setIsValid] = useState(true);
  const [mode, setMode] = useState<IngestionMode>('light');
  
  const validateUrl = (input: string): boolean => {
    if (!input.trim()) return true;
    
    const trimmed = input.trim();
    const urlToTest = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    
    try {
      const parsed = new URL(urlToTest);
      // Must have a valid-looking hostname with at least one dot
      const hostname = parsed.hostname;
      if (!hostname || !hostname.includes('.')) return false;
      // No spaces allowed anywhere
      if (trimmed.includes(' ')) return false;
      // Hostname should match a reasonable pattern (letters, numbers, dots, hyphens)
      if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/.test(hostname)) return false;
      return true;
    } catch {
      return false;
    }
  };
  
  const handleChange = (value: string) => {
    setUrl(value);
    setIsValid(validateUrl(value));
  };
  
  const handleSubmit = async (e: React.FormEvent, forceRescan = false) => {
    e.preventDefault();
    if (!url.trim() || !isValid || isLoading) return;
    await onSubmit(url.trim(), { forceRescan, mode });
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("space-y-4", className)}
      data-testid="url-ingest-form"
    >
      {showModeSelector && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <Label className="text-sm font-medium mb-3 block text-white/70">Scan Mode</Label>
          <RadioGroup 
            value={mode} 
            onValueChange={(v) => setMode(v as IngestionMode)} 
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            data-testid="radio-ingestion-mode"
          >
            <Label
              htmlFor="mode-light"
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                mode === 'light' 
                  ? "border-pink-500 bg-pink-500/10" 
                  : "border-white/10 hover:border-white/20"
              )}
            >
              <RadioGroupItem value="light" id="mode-light" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="w-4 h-4 text-pink-400" />
                  Light
                </div>
                <p className="text-xs text-white/50 mt-1">
                  Quick scan (up to 12 pages). Best for most sites.
                </p>
              </div>
            </Label>
            
            <Label
              htmlFor="mode-standard"
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                mode === 'standard' 
                  ? "border-pink-500 bg-pink-500/10" 
                  : "border-white/10 hover:border-white/20"
              )}
            >
              <RadioGroupItem value="standard" id="mode-standard" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Settings2 className="w-4 h-4 text-blue-400" />
                  Standard
                </div>
                <p className="text-xs text-white/50 mt-1">
                  Deeper scan (up to 25 pages). For larger sites.
                </p>
              </div>
            </Label>
            
            <Label
              htmlFor="mode-user-assisted"
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                mode === 'user_assisted' 
                  ? "border-pink-500 bg-pink-500/10" 
                  : "border-white/10 hover:border-white/20"
              )}
            >
              <RadioGroupItem value="user_assisted" id="mode-user-assisted" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="w-4 h-4 text-amber-400" />
                  Assisted
                </div>
                <p className="text-xs text-white/50 mt-1">
                  Only scan URLs you provide. For protected sites.
                </p>
              </div>
            </Label>
          </RadioGroup>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter website URL (e.g., example.com)"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isLoading}
            className={cn(
              "pl-10 h-12 text-base",
              !isValid && "border-red-500 focus-visible:ring-red-500"
            )}
            data-testid="input-url"
          />
          {url && isValid && (
            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!url.trim() || !isValid || isLoading}
            className="h-12 px-6"
            data-testid="button-scan"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              'Scan Website'
            )}
          </Button>
          
          {lastUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading}
              className="h-12"
              title="Force rescan"
              data-testid="button-rescan"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {!isValid && url && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          Please enter a valid URL
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </form>
  );
}
