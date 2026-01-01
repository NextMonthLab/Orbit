import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Loader2, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  Plus,
  Film,
  Eye,
  MessageCircle,
  MousePointer,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GlobalNav from "@/components/GlobalNav";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface OwnedOrbit {
  businessSlug: string;
  sourceUrl: string;
  generationStatus: string;
  previewId: string | null;
  customTitle: string | null;
  planTier: string | null;
  stats: {
    visits: number;
    interactions: number;
    conversations: number;
    iceViews: number;
  };
}

interface OrbitsResponse {
  orbits: OwnedOrbit[];
}

export default function Launchpad() {
  const { user } = useAuth();

  const { data: orbitsData, isLoading: orbitsLoading } = useQuery<OrbitsResponse>({
    queryKey: ["my-orbits"],
    queryFn: async () => {
      const response = await fetch("/api/me/orbits");
      if (!response.ok) return { orbits: [] };
      return response.json();
    },
  });

  const { data: universes, isLoading: universesLoading } = useQuery({
    queryKey: ["universes"],
    queryFn: () => api.getUniverses(),
  });

  const isLoading = orbitsLoading || universesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <GlobalNav context="app" />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const orbits = orbitsData?.orbits || [];
  const hasOrbits = orbits.length > 0;
  const hasStories = universes && universes.length > 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <GlobalNav context="app" />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-launchpad-title">
            Welcome back{user?.username ? `, ${user.username}` : ''}
          </h1>
          <p className="text-white/60">Your creative command center</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* IceMaker Section */}
          <Card className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">IceMaker</CardTitle>
                  <CardDescription className="text-white/50">Interactive Cinematic Experiences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasStories ? (
                <div className="space-y-3">
                  <p className="text-sm text-white/60">
                    {universes.length} {universes.length === 1 ? 'story' : 'stories'} available
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/icemaker">
                      <Button className="bg-purple-500 hover:bg-purple-600" data-testid="button-open-icemaker">
                        <Film className="w-4 h-4 mr-2" />
                        Open IceMaker
                      </Button>
                    </Link>
                    <Link href="/try">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="button-create-story">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/60">
                    Transform your content into interactive cinematic experiences
                  </p>
                  <Link href="/try">
                    <Button className="bg-purple-500 hover:bg-purple-600 w-full" data-testid="button-try-icemaker">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Your First ICE
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orbit Section */}
          <Card className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Orbit</CardTitle>
                  <CardDescription className="text-white/50">AI-Powered Business Presence</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasOrbits ? (
                <div className="space-y-3">
                  {orbits.slice(0, 2).map((orbit) => {
                    const displayName = orbit.customTitle || orbit.businessSlug.replace(/-/g, ' ');
                    return (
                      <Link key={orbit.businessSlug} href={`/orbit/${orbit.businessSlug}/hub`}>
                        <div 
                          className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
                          data-testid={`orbit-quick-${orbit.businessSlug}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white capitalize">{displayName}</span>
                            <span className="text-xs text-blue-400 capitalize">{orbit.planTier || 'free'}</span>
                          </div>
                          <div className="flex gap-4 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {orbit.stats.visits}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" /> {orbit.stats.conversations}
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointer className="w-3 h-3" /> {orbit.stats.interactions}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link href="/orbit/my">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" data-testid="button-all-orbits">
                        View All Orbits
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/60">
                    Create an AI-powered presence for your business with product catalogues and smart discovery
                  </p>
                  <Link href="/orbit">
                    <Button className="bg-blue-500 hover:bg-blue-600 w-full" data-testid="button-create-orbit">
                      <Globe className="w-4 h-4 mr-2" />
                      Create Your Orbit
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-white/80">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/try">
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10" data-testid="action-new-ice">
                <Plus className="w-4 h-4 mr-2" />
                New ICE
              </Button>
            </Link>
            <Link href="/orbit">
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10" data-testid="action-new-orbit">
                <Globe className="w-4 h-4 mr-2" />
                New Orbit
              </Button>
            </Link>
            {hasOrbits && (
              <Link href={`/orbit/${orbits[0].businessSlug}/import`}>
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10" data-testid="action-import-catalogue">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Catalogue
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
