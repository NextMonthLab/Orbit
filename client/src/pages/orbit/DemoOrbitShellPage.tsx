import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDemoOrbitById } from "@/data/demoOrbits";
import businessOrbitLogo from "@assets/business-orbit-logo-cropped.png";
import { 
  ArrowLeft, 
  AlertCircle, 
  LayoutGrid,
  BookOpen,
  MessageCircle,
  MapPin,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function DemoOrbitShellPage() {
  const { demoId } = useParams<{ demoId: string }>();
  const demo = demoId ? getDemoOrbitById(demoId) : undefined;

  if (!demo) {
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
              <CardTitle className="text-white text-2xl">Demo Not Found</CardTitle>
              <CardDescription className="text-white/60">
                The demo Orbit you're looking for doesn't exist or hasn't been created yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/orbits/demos">
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

  const isLive = demo.status === 'live';

  return (
    <div className="min-h-screen bg-[#1a1b2e]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1b2e]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <img 
                src={businessOrbitLogo} 
                alt="Business Orbit" 
                className="h-14 w-auto cursor-pointer"
                data-testid="img-logo"
              />
            </Link>
            <div className="hidden sm:block h-6 w-px bg-white/20" />
            <div className="hidden sm:block">
              <Badge className="bg-[#ff6b4a]/20 text-[#ff6b4a] border-[#ff6b4a]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Demo Mode
              </Badge>
            </div>
          </div>
          <Link href="/orbits/demos">
            <Button 
              variant="ghost" 
              className="text-white/70 hover:text-white hover:bg-white/10"
              data-testid="button-exit-demo"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Exit Demo
            </Button>
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <Badge 
                variant="outline" 
                className="mb-4 text-white/60 border-white/20"
              >
                {demo.sector}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {demo.name}
              </h1>
              <div className="flex items-center justify-center gap-1.5 text-white/50 text-sm mb-4">
                <MapPin className="w-4 h-4" />
                {demo.location}
              </div>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                {demo.tagline}
              </p>
            </div>

            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 mb-8">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6b4a]/20 to-[#a855f7]/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-[#ff6b4a]" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Curated Demo Orbit
                </h2>
                <p className="text-white/60 max-w-lg mx-auto">
                  This is a curated demo Orbit. The full dataset-backed experience will load here next.
                  You'll be able to explore real products, services, policies, and ask questions.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-white font-medium mb-2">Overview</h3>
                  <p className="text-white/50 text-sm">
                    See the full business at a glance
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-white font-medium mb-2">Explore Knowledge</h3>
                  <p className="text-white/50 text-sm">
                    Browse structured information
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors relative">
                <Badge className="absolute top-3 right-3 bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                  Coming Soon
                </Badge>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#ff6b4a]/20 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-[#ff6b4a]" />
                  </div>
                  <h3 className="text-white font-medium mb-2">Ask the Orbit</h3>
                  <p className="text-white/50 text-sm">
                    Conversational intelligence
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-white/40 text-sm">
                This demo bypasses Orbit creation and ingestion. Data is curated and fixture-backed.
              </p>
            </div>

            {import.meta.env.DEV && (
              <div className="mt-8">
                <Card className="bg-amber-500/10 border-amber-500/30">
                  <CardHeader className="py-3">
                    <CardTitle className="text-amber-400 text-xs font-mono flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Developer Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-amber-200/80 text-xs font-mono space-y-1 py-0 pb-3">
                    <p>Demo ID: <code className="bg-amber-500/20 px-1 rounded">{demoId}</code></p>
                    <p>Status: <code className="bg-amber-500/20 px-1 rounded">{demo.status}</code></p>
                    <p>This route bypasses standard Orbit creation UI.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
