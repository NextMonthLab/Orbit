import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Globe, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

interface UrlIngestFormProps {
  onSubmit: (url: string, forceRescan?: boolean) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  lastUrl?: string | null;
  className?: string;
}

export function UrlIngestForm({ 
  onSubmit, 
  isLoading = false, 
  error = null,
  lastUrl = null,
  className 
}: UrlIngestFormProps) {
  const [url, setUrl] = useState(lastUrl || "");
  const [isValid, setIsValid] = useState(true);
  
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
    await onSubmit(url.trim(), forceRescan);
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("space-y-4", className)}
      data-testid="url-ingest-form"
    >
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
