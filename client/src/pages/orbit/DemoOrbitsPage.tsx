import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoOrbits, sectors, type DemoSector } from "@/data/demoOrbits";
import businessOrbitLogo from "@assets/business-orbit-logo-cropped.png";
import { 
  ArrowRight, 
  Rocket, 
  Clock, 
  Pizza,
  Calculator,
  Smartphone,
  Stethoscope,
  Home,
  MapPin,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const sectorIcons: Record<DemoSector, typeof Pizza> = {
  "Food": Pizza,
  "Professional Services": Calculator,
  "Ecommerce": Smartphone,
  "Healthcare": Stethoscope,
  "Property": Home,
};

const sectorColors: Record<DemoSector, string> = {
  "Food": "from-orange-500/20 to-red-500/20",
  "Professional Services": "from-blue-500/20 to-indigo-500/20",
  "Ecommerce": "from-purple-500/20 to-pink-500/20",
  "Healthcare": "from-teal-500/20 to-cyan-500/20",
  "Property": "from-green-500/20 to-emerald-500/20",
};

const sectorIconColors: Record<DemoSector, string> = {
  "Food": "text-orange-400",
  "Professional Services": "text-blue-400",
  "Ecommerce": "text-purple-400",
  "Healthcare": "text-teal-400",
  "Property": "text-green-400",
};

export default function DemoOrbitsPage() {
  const [activeFilter, setActiveFilter] = useState<DemoSector | 'all'>('all');
  
  const filteredDemos = activeFilter === 'all' 
    ? demoOrbits 
    : demoOrbits.filter(d => d.sector === activeFilter);

  const scrollToGrid = () => {
    document.getElementById('demo-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#1a1b2e]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1b2e]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img 
              src={businessOrbitLogo} 
              alt="Business Orbit" 
              className="h-14 w-auto cursor-pointer"
              data-testid="img-logo"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-white/70 hover:text-white transition-colors" data-testid="link-home">
              Home
            </Link>
            <Link href="/orbits/demos" className="text-white font-medium" data-testid="link-demos">
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
          className="max-w-7xl mx-auto px-6 text-center mb-16"
          {...fadeInUp}
        >
          <Badge className="mb-6 bg-[#ff6b4a]/20 text-[#ff6b4a] border-[#ff6b4a]/30 hover:bg-[#ff6b4a]/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Curated Experiences
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Flagship Demo Orbits
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-10">
            Explore fully curated demo Orbits that show what your business could feel like with NextMonth. 
            Each demo is a real, working Orbit backed by structured datasets.
          </p>
          <Button 
            size="lg"
            onClick={scrollToGrid}
            className="bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] hover:opacity-90 text-white border-0 text-lg px-8"
            data-testid="button-launch-demo-cta"
          >
            <Rocket className="mr-2 w-5 h-5" />
            Launch a Demo
          </Button>
        </motion.section>

        <section id="demo-grid" className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="flex flex-wrap gap-2 justify-center mb-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className={activeFilter === 'all' 
                ? 'bg-white/10 text-white border-white/20' 
                : 'text-white/60 border-white/10 hover:bg-white/5 hover:text-white'}
              data-testid="filter-all"
            >
              All Sectors
            </Button>
            {sectors.map((sector) => (
              <Button
                key={sector}
                variant={activeFilter === sector ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(sector)}
                className={activeFilter === sector 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'text-white/60 border-white/10 hover:bg-white/5 hover:text-white'}
                data-testid={`filter-${sector.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {sector}
              </Button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDemos.map((demo, index) => {
              const SectorIcon = sectorIcons[demo.sector];
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
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sectorColors[demo.sector]} flex items-center justify-center`}>
                            <SectorIcon className={`w-6 h-6 ${sectorIconColors[demo.sector]}`} />
                          </div>
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
                      <Badge 
                        variant="outline" 
                        className="w-fit text-white/60 border-white/20 mb-2"
                      >
                        {demo.sector}
                      </Badge>
                      <CardTitle className="text-white text-xl">
                        {demo.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-white/50 text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {demo.location}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-0">
                      <CardDescription className="text-white/60 text-base leading-relaxed">
                        {demo.tagline}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-4">
                      <Link href={`/orbit/demo/${demo.id}`} className="w-full">
                        <Button 
                          className={`w-full ${isLive 
                            ? 'bg-gradient-to-r from-[#ff6b4a] to-[#ff4d8f] hover:opacity-90' 
                            : 'bg-white/10 hover:bg-white/20'
                          } text-white border-0`}
                          data-testid={`button-launch-${demo.id}`}
                        >
                          {isLive ? 'Launch Demo' : 'Coming Soon'}
                          {isLive && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                      </Link>
                      <Link href="/" className="w-full">
                        <Button 
                          variant="ghost" 
                          className="w-full text-white/60 hover:text-white hover:bg-white/5"
                          data-testid={`button-what-can-orbit-do-${demo.id}`}
                        >
                          What can Orbit do?
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

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
                <p>Demo Orbits are hardcoded fixtures that bypass standard Orbit creation/ingestion.</p>
                <p>To add a new demo: Edit <code className="bg-amber-500/20 px-1 rounded">client/src/data/demoOrbits.ts</code></p>
                <p>To make a demo live: Set <code className="bg-amber-500/20 px-1 rounded">status: "live"</code></p>
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
