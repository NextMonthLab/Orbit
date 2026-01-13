import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDemoOrbitById } from "@/data/demoOrbits";
import businessOrbitLogo from "@assets/business-orbit-logo-cropped.png";
import { ArrowLeft, Rocket, AlertCircle, MessageSquare } from "lucide-react";
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
              />
            </Link>
            <div className="hidden sm:block h-6 w-px bg-white/20" />
            <div className="hidden sm:block">
              <Badge className="bg-[#ff6b4a]/20 text-[#ff6b4a] border-[#ff6b4a]/30">
                Demo Mode
              </Badge>
            </div>
          </div>
          <Link href="/orbit/demos">
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

      <main className="pt-32 pb-24 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-4 w-full"
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff6b4a]/20 to-[#a855f7]/20 flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-[#ff6b4a]" />
              </div>
              <Badge 
                variant="outline" 
                className="w-fit mx-auto mb-4 text-white/60 border-white/20"
              >
                {demo.industry}
              </Badge>
              <CardTitle className="text-white text-3xl mb-2">
                {demo.name}
              </CardTitle>
              <CardDescription className="text-white/60 text-lg">
                {demo.tagline}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {isLive ? (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-[#ff6b4a]/10 via-[#ff4d8f]/10 to-[#a855f7]/10 rounded-xl p-6 border border-white/10">
                    <MessageSquare className="w-8 h-8 text-[#ff6b4a] mx-auto mb-4" />
                    <p className="text-white/80">
                      Chat interface will load here. Start exploring this demo Orbit.
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-[#ff6b4a] to-[#ff4d8f] hover:opacity-90 text-white border-0"
                    data-testid="button-start-chat"
                  >
                    Start Conversation
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="bg-amber-500/10 rounded-xl p-6 border border-amber-500/20">
                    <p className="text-amber-200 mb-2 font-medium">
                      This is a hardcoded flagship demo Orbit
                    </p>
                    <p className="text-amber-200/70 text-sm">
                      Data will be injected here soon. This demo is currently being curated.
                    </p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white/50 text-sm font-mono">
                      Demo ID: <code className="text-[#ff6b4a]">{demoId}</code>
                    </p>
                  </div>

                  <Link href="/orbit/demos">
                    <Button 
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      data-testid="button-view-other-demos"
                    >
                      View Other Demos
                    </Button>
                  </Link>
                </div>
              )}

              {import.meta.env.DEV && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <Card className="bg-amber-500/10 border-amber-500/30">
                    <CardHeader className="py-3">
                      <CardTitle className="text-amber-400 text-xs font-mono flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Developer Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-amber-200/80 text-xs font-mono space-y-1 py-0 pb-3">
                      <p>This route bypasses standard Orbit creation UI.</p>
                      <p>Demo Orbits are hardcoded as JSON payloads / fixtures.</p>
                      <p>Status: <code className="bg-amber-500/20 px-1 rounded">{demo.status}</code></p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
