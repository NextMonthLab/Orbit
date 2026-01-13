import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDemoOrbitBySlug } from "@/data/demoOrbits";
import businessOrbitLogo from "@assets/business-orbit-logo-cropped.png";
import { 
  ArrowLeft, 
  AlertCircle,
  LayoutGrid,
  BookOpen,
  MessageCircle,
  FileText,
  Settings,
  BarChart3,
  Users,
  Sparkles,
  Brain,
  Eye,
  ExternalLink,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import type { OrbitMeta, OrbitBox, OrbitDocument } from "@shared/schema";

const DEMO_SLUGS = ['slice-and-stone-pizza', 'clarity-chartered-accountants', 'techvault-uk'];

export default function DemoBackendView() {
  const { slug } = useParams<{ slug: string }>();
  const demoInfo = slug ? getDemoOrbitBySlug(slug) : undefined;
  const isDemoOrbit = slug && DEMO_SLUGS.includes(slug);

  const { data: orbit, isLoading: orbitLoading } = useQuery<OrbitMeta>({
    queryKey: ['/api/orbit', slug],
    enabled: Boolean(slug && isDemoOrbit),
  });

  const { data: tiles } = useQuery<OrbitBox[]>({
    queryKey: [`/api/orbit/${slug}/boxes`],
    enabled: Boolean(slug && isDemoOrbit),
  });

  const { data: documents } = useQuery<OrbitDocument[]>({
    queryKey: [`/api/orbit/${slug}/documents`],
    enabled: Boolean(slug && isDemoOrbit),
  });

  if (!isDemoOrbit) {
    return (
      <div className="min-h-screen bg-[#1a1b2e] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10 max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <CardTitle className="text-white text-2xl">Demo Mode Only</CardTitle>
              <CardDescription className="text-white/60">
                Backend demo access is only available for our curated demo Orbits. 
                This ensures a safe, read-only experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/orbit/demos">
                <Button 
                  className="bg-gradient-to-r from-[#ff6b4a] to-[#ff4d8f] hover:opacity-90 text-white border-0"
                  data-testid="button-back-to-demos"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  View Demo Orbits
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (orbitLoading) {
    return (
      <div className="min-h-screen bg-[#1a1b2e] flex items-center justify-center">
        <div className="text-white/60">Loading demo backend...</div>
      </div>
    );
  }

  if (!orbit) {
    return (
      <div className="min-h-screen bg-[#1a1b2e] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10 max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-white text-2xl">Orbit Not Found</CardTitle>
              <CardDescription className="text-white/60">
                This demo Orbit hasn't been seeded yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/orbit/demos">
                <Button 
                  className="bg-gradient-to-r from-[#ff6b4a] to-[#ff4d8f] hover:opacity-90 text-white border-0"
                  data-testid="button-back-to-demos"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Demo Orbits
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const tileCount = tiles?.length || 0;
  const documentCount = documents?.length || 0;

  return (
    <div className="min-h-screen bg-[#1a1b2e]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1b2e]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <img 
                src={businessOrbitLogo} 
                alt="Business Orbit" 
                className="h-10 w-auto cursor-pointer"
                data-testid="img-logo"
              />
            </Link>
            <div className="hidden sm:block h-6 w-px bg-white/20" />
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Brain className="w-3 h-3 mr-1" />
              Backend Demo Mode
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/orbit/${slug}`}>
              <Button 
                variant="outline"
                size="sm"
                className="text-white/70 border-white/20 hover:bg-white/10"
                data-testid="button-view-front"
              >
                <Eye className="mr-2 w-4 h-4" />
                View Orbit Front
              </Button>
            </Link>
            <Link href="/orbit/demos">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
                data-testid="button-exit-demo"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Exit Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {demoInfo?.name || orbit.businessSlug}
                </h1>
                <Badge variant="outline" className="text-white/60 border-white/20">
                  {demoInfo?.sector || 'Demo'}
                </Badge>
              </div>
              <p className="text-white/60 max-w-2xl">
                {demoInfo?.tagline || 'Explore this demo Orbit backend'}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{tileCount}</p>
                      <p className="text-white/50 text-sm">Knowledge Tiles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{documentCount}</p>
                      <p className="text-white/50 text-sm">Documents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">AI</p>
                      <p className="text-white/50 text-sm">Chat Enabled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">Live</p>
                      <p className="text-white/50 text-sm">Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="tiles" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 p-1 mb-6">
                <TabsTrigger 
                  value="tiles" 
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Knowledge Tiles
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tiles">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-blue-400" />
                      Knowledge Tiles
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      These tiles represent structured knowledge about the business. In production, owners can edit, reorder, and refine these tiles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tiles && tiles.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tiles.slice(0, 12).map((box: OrbitBox) => (
                          <div 
                            key={box.id} 
                            className="p-4 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="text-xs text-white/50 border-white/20">
                                {box.boxType || 'info'}
                              </Badge>
                            </div>
                            <h4 className="text-white font-medium mb-1 line-clamp-1">{box.title}</h4>
                            <p className="text-white/50 text-sm line-clamp-2">{box.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/40">
                        <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No tiles found</p>
                      </div>
                    )}
                    {tiles && tiles.length > 12 && (
                      <p className="text-center text-white/40 text-sm mt-4">
                        Showing 12 of {tiles.length} tiles (demo mode)
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Documents
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Supporting documents that provide context and detailed information for the AI chat.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {documents && documents.length > 0 ? (
                      <div className="space-y-3">
                        {documents.map((doc: OrbitDocument) => (
                          <div 
                            key={doc.id} 
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{doc.title}</h4>
                              <p className="text-white/50 text-sm">
                                {doc.category || 'document'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/40">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No documents found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-amber-400" />
                      Orbit Settings
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Configuration options for this Orbit. In demo mode, settings are read-only.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white/50 text-sm w-32">Business Name</span>
                        <span className="text-white">{demoInfo?.name || orbit.businessSlug}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white/50 text-sm w-32">Slug</span>
                        <span className="text-white font-mono text-sm">{orbit.businessSlug}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white/50 text-sm w-32">Type</span>
                        <Badge variant="outline" className="text-white/60 border-white/20">
                          {orbit.orbitType || 'standard'}
                        </Badge>
                      </div>
                      {orbit.sourceUrl && (
                        <div className="flex items-center gap-3">
                          <span className="text-white/50 text-sm w-32">Website</span>
                          <a 
                            href={orbit.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1"
                          >
                            {orbit.sourceUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-center gap-2 text-amber-400 text-sm">
                        <Lock className="w-4 h-4" />
                        <span className="font-medium">Demo Mode</span>
                      </div>
                      <p className="text-amber-200/70 text-sm mt-1">
                        Settings are read-only in demo mode. Sign up to create and configure your own Orbit.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            This is a read-only demo. No changes can be saved.
          </p>
          <Link href="/orbit/claim">
            <Button 
              className="bg-gradient-to-r from-[#ff6b4a] to-[#ff4d8f] hover:opacity-90 text-white border-0"
              data-testid="button-create-orbit"
            >
              <Sparkles className="mr-2 w-4 h-4" />
              Create Your Own Orbit
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
