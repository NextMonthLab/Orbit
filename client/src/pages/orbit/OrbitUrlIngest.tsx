import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import OrbitLayout from "@/components/OrbitLayout";
import { 
  UrlIngestForm, 
  TileRow, 
  TileDrawer, 
  TileDrawerOverlay 
} from "@/components/orbit-tiles";
import type { OrbitTile, OrbitCrawlReport, TileCategory } from "../../../../shared/orbitTileTypes";
import { Loader2, Globe, AlertCircle, CheckCircle2 } from "lucide-react";

interface IngestResponse {
  success: boolean;
  orbitId: string;
  tiles: OrbitTile[];
  crawlReport: OrbitCrawlReport;
  cached?: boolean;
  message?: string;
}

interface GroupedTiles {
  'Top Insights': OrbitTile[];
  'Services & Offers': OrbitTile[];
  'FAQs & Objections': OrbitTile[];
  'Proof & Trust': OrbitTile[];
  'Recommendations': OrbitTile[];
}

function groupTilesByCategory(tiles: OrbitTile[]): GroupedTiles {
  const groups: GroupedTiles = {
    'Top Insights': [],
    'Services & Offers': [],
    'FAQs & Objections': [],
    'Proof & Trust': [],
    'Recommendations': [],
  };
  
  for (const tile of tiles) {
    if (groups[tile.category as keyof GroupedTiles]) {
      groups[tile.category as keyof GroupedTiles].push(tile);
    } else {
      groups['Top Insights'].push(tile);
    }
  }
  
  return groups;
}

export default function OrbitUrlIngest() {
  const [tiles, setTiles] = useState<OrbitTile[]>([]);
  const [crawlReport, setCrawlReport] = useState<OrbitCrawlReport | null>(null);
  const [selectedTile, setSelectedTile] = useState<OrbitTile | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  
  const ingestMutation = useMutation({
    mutationFn: async ({ url, forceRescan }: { url: string; forceRescan?: boolean }) => {
      const response = await fetch('/api/orbit/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, forceRescan }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to ingest URL');
      }
      
      return response.json() as Promise<IngestResponse>;
    },
    onSuccess: (data) => {
      setTiles(data.tiles);
      setCrawlReport(data.crawlReport);
      setResultMessage(data.message || null);
    },
  });
  
  const handleSubmit = async (url: string, forceRescan?: boolean) => {
    setLastUrl(url);
    setResultMessage(null);
    await ingestMutation.mutateAsync({ url, forceRescan });
  };
  
  const groupedTiles = groupTilesByCategory(tiles);
  const rows = [
    { title: 'Top Insights', tiles: groupedTiles['Top Insights'] },
    { title: 'Services & Offers', tiles: groupedTiles['Services & Offers'] },
    { title: 'FAQs & Objections', tiles: groupedTiles['FAQs & Objections'] },
    { title: 'Proof & Trust', tiles: groupedTiles['Proof & Trust'] },
    { title: 'Recommendations', tiles: groupedTiles['Recommendations'] },
  ].filter(row => row.tiles.length > 0);
  
  return (
    <OrbitLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Website Intelligence
            </h1>
            <p className="text-muted-foreground">
              Enter any website URL to extract business insights and topic tiles
            </p>
          </div>
          
          <UrlIngestForm
            onSubmit={handleSubmit}
            isLoading={ingestMutation.isPending}
            error={ingestMutation.error?.message}
            lastUrl={lastUrl}
            className="mb-8"
          />
          
          {ingestMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <Globe className="w-16 h-16 text-muted-foreground" />
                <Loader2 className="w-8 h-8 text-primary absolute -bottom-2 -right-2 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Analyzing Website
              </h3>
              <p className="text-muted-foreground max-w-md">
                Crawling pages, extracting content, and generating insights. This may take up to 60 seconds.
              </p>
            </div>
          )}
          
          {!ingestMutation.isPending && crawlReport && (
            <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-foreground font-medium">
                    {crawlReport.pagesSucceeded} of {crawlReport.pagesAttempted} pages scanned
                  </span>
                </div>
                <div className="text-muted-foreground">
                  {tiles.length} tiles generated
                </div>
                <div className="text-muted-foreground">
                  {(crawlReport.crawlDurationMs / 1000).toFixed(1)}s
                </div>
                {resultMessage && (
                  <div className="text-muted-foreground italic">
                    {resultMessage}
                  </div>
                )}
              </div>
              
              {crawlReport.errors.length > 0 && (
                <div className="mt-3 flex items-start gap-2 text-sm text-amber-500">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {crawlReport.errors.length} page{crawlReport.errors.length > 1 ? 's' : ''} could not be crawled
                  </span>
                </div>
              )}
            </div>
          )}
          
          {!ingestMutation.isPending && rows.length > 0 && (
            <div className="space-y-8">
              {rows.map((row) => (
                <TileRow
                  key={row.title}
                  title={row.title}
                  tiles={row.tiles}
                  onTileClick={setSelectedTile}
                />
              ))}
            </div>
          )}
          
          {!ingestMutation.isPending && tiles.length === 0 && lastUrl && !ingestMutation.error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Globe className="w-16 h-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No tiles generated
              </h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't extract enough content from this website. Try a different URL or check if the site is accessible.
              </p>
            </div>
          )}
        </div>
        
        <TileDrawerOverlay 
          isOpen={!!selectedTile} 
          onClose={() => setSelectedTile(null)} 
        />
        <TileDrawer 
          tile={selectedTile} 
          onClose={() => setSelectedTile(null)} 
        />
      </div>
    </OrbitLayout>
  );
}
