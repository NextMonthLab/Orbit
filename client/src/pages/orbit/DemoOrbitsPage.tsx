import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoOrbits } from "@/data/demoOrbits";
import businessOrbitLogo from "@assets/business-orbit-logo-cropped.png";
import { ArrowRight, Rocket, Clock, Store, Briefcase, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const industryIcons: Record<string, typeof Store> = {
  "Takeaway": Store,
  "Professional Services": Briefcase,
  "Ecommerce": ShoppingBag,
};

export default function DemoOrbitsPage() {
  return (
    <div className="min-h-screen bg-[#1a1b2e]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1b2e]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img 
              src={businessOrbitLogo} 
              alt="Business Orbit" 
              className="h-14 w-auto cursor-pointer"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/orbit/demos" className="text-white font-medium">
              Demos
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/orbit">
              <Button 
                className="bg-gradient-to-r from-[#ff6b4a] to-[#ff4d8f] hover:opacity-90 text-white border-0"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <motion.section 
          className="max-w-7xl mx-auto px-6"
          {...fadeInUp}
        >
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-[#ff6b4a]/20 text-[#ff6b4a] border-[#ff6b4a]/30 hover:bg-[#ff6b4a]/30">
              <Rocket className="w-3 h-3 mr-1" />
              Flagship Demos
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Demo Orbits
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Experience curated showcase Orbits. See how Business Orbit transforms 
              different industries with conversational intelligence.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] hover:opacity-90 text-white border-0 text-lg px-8"
              data-testid="button-explore-demos"
            >
              Explore Demo Orbits
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoOrbits.map((demo, index) => {
              const IndustryIcon = industryIcons[demo.industry] || Store;
              const isLive = demo.status === 'live';
              
              return (
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-[#ff6b4a]/50 transition-all duration-300 h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff6b4a]/20 to-[#a855f7]/20 flex items-center justify-center">
                            <IndustryIcon className="w-5 h-5 text-[#ff6b4a]" />
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-white/60 border-white/20"
                          >
                            {demo.industry}
                          </Badge>
                        </div>
                        <Badge 
                          className={isLive 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }
                        >
                          {isLive ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                              Live
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Coming Soon
                            </>
                          )}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-xl">
                        {demo.name}
                      </CardTitle>
                      <CardDescription className="text-white/60 text-base">
                        {demo.tagline}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1" />
                    <CardFooter className="flex flex-col gap-3">
                      <Link href={`/orbit/demo/${demo.id}`} className="w-full">
                        <Button 
                          className={`w-full ${isLive 
                            ? 'bg-gradient-to-r from-[#ff6b4a] to-[#ff4d8f] hover:opacity-90' 
                            : 'bg-white/10 hover:bg-white/20'
                          } text-white border-0`}
                          disabled={!isLive}
                          data-testid={`button-launch-demo-${demo.id}`}
                        >
                          {isLive ? 'Launch Demo' : 'Coming Soon'}
                          {isLive && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                      </Link>
                      <Link href="/orbit" className="w-full">
                        <Button 
                          variant="ghost" 
                          className="w-full text-white/60 hover:text-white hover:bg-white/5"
                          data-testid={`button-view-features-${demo.id}`}
                        >
                          View What You Can Do
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {import.meta.env.DEV && (
          <section className="max-w-7xl mx-auto px-6 mt-16">
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-400 text-sm font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Developer Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-amber-200/80 text-sm font-mono space-y-2">
                <p>Demo Orbits are hardcoded and will be added as JSON payloads / fixtures.</p>
                <p>This route bypasses standard Orbit creation UI.</p>
                <p>To add a new demo: Edit <code className="bg-amber-500/20 px-1 rounded">client/src/data/demoOrbits.ts</code></p>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Business Orbit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
