import { Brain, RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrbitLayout from "@/components/OrbitLayout";

const insights = [
  {
    type: "success",
    title: "Brand Recognition Strong",
    description: "AI systems correctly identify your brand in 94% of queries",
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  {
    type: "warning",
    title: "Competitor Confusion",
    description: "Some AI responses confuse your products with competitors",
    icon: AlertTriangle,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
  },
  {
    type: "info",
    title: "Trending Topic",
    description: "Increased mentions in AI-powered search queries this week",
    icon: TrendingUp,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
];

export default function OrbitIntelligence() {
  return (
    <OrbitLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" data-testid="text-intelligence-title">
              Intelligence View
            </h1>
            <p className="text-white/60 text-sm">
              See how AI systems perceive and represent your brand
            </p>
          </div>
          <Button variant="outline" className="border-white/10 text-white/60 gap-2" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4" />
            Refresh Analysis
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-accuracy">
            <p className="text-sm text-white/50 mb-1">AI Accuracy Score</p>
            <p className="text-3xl font-bold text-white">94%</p>
            <p className="text-xs text-green-400 mt-1">↑ 3% from last week</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-mentions">
            <p className="text-sm text-white/50 mb-1">AI Mentions</p>
            <p className="text-3xl font-bold text-white">1,247</p>
            <p className="text-xs text-blue-400 mt-1">Last 7 days</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-issues">
            <p className="text-sm text-white/50 mb-1">Issues Detected</p>
            <p className="text-3xl font-bold text-white">3</p>
            <p className="text-xs text-yellow-400 mt-1">Requires attention</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white" data-testid="text-insights-heading">
            Latest Insights
          </h2>
          {insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              data-testid={`insight-${i}`}
            >
              <div className={`w-10 h-10 rounded-lg ${insight.bgColor} flex items-center justify-center flex-shrink-0`}>
                <insight.icon className={`w-5 h-5 ${insight.color}`} />
              </div>
              <div>
                <h3 className="font-medium text-white">{insight.title}</h3>
                <p className="text-sm text-white/60">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </OrbitLayout>
  );
}
