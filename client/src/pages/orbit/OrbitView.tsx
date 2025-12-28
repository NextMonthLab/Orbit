import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { OrbitGrid } from "@/components/orbit/OrbitGrid";
import { ClaimCTA } from "@/components/orbit/ClaimCTA";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Globe, Clock, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrbitPackMeta {
  businessSlug: string;
  version: string;
  generatedAt: string;
  sourceUrl: string;
  schemaVersion: string;
}

interface OrbitBrand {
  name: string;
  logo?: string;
  accent?: string;
  tone?: string;
  positioning?: string;
  taglineCandidates: string[];
}

interface OrbitBox {
  id: string;
  type: "page" | "service" | "faq" | "testimonial" | "blog" | "document" | "custom";
  title: string;
  summary: string;
  themes: string[];
}

interface OrbitPack {
  meta: OrbitPackMeta;
  brand: OrbitBrand;
  boxes: OrbitBox[];
  faqs: { question: string; answer: string }[];
}

interface OrbitResponse {
  status: "ready" | "generating" | "failed";
  businessSlug: string;
  ownerId?: number | null;
  lastUpdated?: string;
  pack?: OrbitPack;
  error?: string;
  requestedAt?: string;
}

export default function OrbitView() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data, isLoading, error, refetch } = useQuery<OrbitResponse>({
    queryKey: ["orbit", slug],
    queryFn: async () => {
      const response = await fetch(`/api/orbit/${slug}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orbit");
      }
      return response.json();
    },
    refetchInterval: (query) => {
      if (query.state.data?.status === "generating") {
        return 3000;
      }
      return false;
    },
    enabled: !!slug,
  });

  const isUnclaimed = !data?.ownerId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64 bg-zinc-800" />
            <Skeleton className="h-6 w-96 bg-zinc-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48 bg-zinc-800 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-semibold text-zinc-100">Orbit Not Found</h1>
          <p className="text-zinc-400">{(error as Error).message}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/for/brands"}
            className="mt-4"
          >
            Create an Orbit
          </Button>
        </div>
      </div>
    );
  }

  if (data?.status === "generating") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-pink-400 mx-auto animate-spin" />
          <h1 className="text-xl font-semibold text-zinc-100">Generating Orbit...</h1>
          <p className="text-zinc-400">This usually takes about 30 seconds</p>
          {data.requestedAt && (
            <p className="text-xs text-zinc-500">
              Started: {new Date(data.requestedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (data?.status === "failed") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-semibold text-zinc-100">Generation Failed</h1>
          <p className="text-zinc-400">{data.error || "An error occurred"}</p>
          <Button 
            variant="outline"
            onClick={() => refetch()}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const pack = data?.pack;

  if (!pack) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-zinc-400 mx-auto" />
          <h1 className="text-xl font-semibold text-zinc-100">No Pack Available</h1>
          <p className="text-zinc-400">This orbit hasn't been generated yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black ${isUnclaimed ? 'pb-32' : ''}`}>
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {pack.brand.logo && (
                <img 
                  src={pack.brand.logo} 
                  alt={pack.brand.name}
                  className="h-10 w-10 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-zinc-100" data-testid="text-brand-name">
                  {pack.brand.name}
                </h1>
                {pack.brand.taglineCandidates?.[0] && (
                  <p className="text-sm text-zinc-400">{pack.brand.taglineCandidates[0]}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              {isUnclaimed && (
                <Badge variant="outline" className="border-pink-500/30 text-pink-400">
                  Unclaimed
                </Badge>
              )}
              <a 
                href={pack.meta.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Visit Website</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {pack.brand.positioning && (
          <div className="mb-8">
            <p className="text-lg text-zinc-300 max-w-3xl" data-testid="text-positioning">
              {pack.brand.positioning}
            </p>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-200">
            Content ({pack.boxes.length} boxes)
          </h2>
          {data?.lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              <span>Updated: {new Date(data.lastUpdated).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <OrbitGrid boxes={pack.boxes} isUnclaimed={isUnclaimed} />

        {pack.faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-zinc-200 mb-4">
              Common Questions ({pack.faqs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pack.faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800"
                >
                  <p className="font-medium text-zinc-200 mb-2">{faq.question}</p>
                  {faq.answer && (
                    <p className="text-sm text-zinc-400">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {isUnclaimed && (
        <ClaimCTA 
          businessSlug={data?.businessSlug || slug || ""} 
          brandName={pack.brand.name}
          isSticky={true}
        />
      )}
    </div>
  );
}
