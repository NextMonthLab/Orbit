import { Link } from "wouter";
import { 
  Map,
  Brain,
  ArrowRight,
  Building2,
  Shield,
  MessageSquare
} from "lucide-react";
import OrbitLayout from "@/components/OrbitLayout";

export default function OrbitHome() {
  return (
    <OrbitLayout>
      <div className="p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white" data-testid="text-orbit-title">
            Orbit
          </h1>
          <p className="text-white/60" data-testid="text-orbit-subtitle">
            Control how AI represents your brand in the age of AI-powered discovery
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/orbit/claim">
            <div className="group p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer" data-testid="card-claim-orbit">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Claim Your Orbit</h3>
              <p className="text-sm text-white/60 mb-4">
                Set up your business presence for AI-powered discovery
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link href="/orbit/map">
            <div className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer" data-testid="card-knowledge-map">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Map className="w-6 h-6 text-white/60" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Knowledge Map</h3>
              <p className="text-sm text-white/60 mb-4">
                Visualize and manage your brand's knowledge graph
              </p>
              <div className="flex items-center text-white/60 text-sm font-medium group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link href="/orbit/intelligence">
            <div className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer" data-testid="card-intelligence">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white/60" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Intelligence View</h3>
              <p className="text-sm text-white/60 mb-4">
                See how AI systems perceive and represent your brand
              </p>
              <div className="flex items-center text-white/60 text-sm font-medium group-hover:gap-2 transition-all">
                Analyze <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>

        <div className="pt-8 border-t border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6" data-testid="text-why-orbit">
            Why Orbit?
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Shield, title: "AI Discovery Control", desc: "Ensure AI systems represent your brand accurately" },
              { icon: Brain, title: "Knowledge Management", desc: "Structure your brand's information for AI consumption" },
              { icon: MessageSquare, title: "Conversational Interface", desc: "Let customers interact with your brand through AI" },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white/5" data-testid={`feature-${i + 1}`}>
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{feature.title}</h4>
                  <p className="text-xs text-white/50">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OrbitLayout>
  );
}
