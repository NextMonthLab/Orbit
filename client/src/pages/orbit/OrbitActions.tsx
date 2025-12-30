import { Zap, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrbitLayout from "@/components/OrbitLayout";

const actions = [
  {
    id: 1,
    title: "Update Business Hours",
    description: "Your business hours may be outdated in AI responses",
    status: "pending",
    priority: "high",
  },
  {
    id: 2,
    title: "Add Product Information",
    description: "3 products missing key details that AI systems need",
    status: "pending",
    priority: "medium",
  },
  {
    id: 3,
    title: "Verify Contact Details",
    description: "Ensure your contact information is accurate",
    status: "completed",
    priority: "low",
  },
];

export default function OrbitActions() {
  return (
    <OrbitLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white" data-testid="text-actions-title">
            Actions
          </h1>
          <p className="text-white/60 text-sm">
            Recommended actions to improve your AI presence
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30" data-testid="stat-pending">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">2</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30" data-testid="stat-completed">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-white">1</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30" data-testid="stat-urgent">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Urgent</span>
            </div>
            <p className="text-2xl font-bold text-white">1</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white" data-testid="text-action-list">
            Action Items
          </h2>
          {actions.map((action) => (
            <div
              key={action.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                action.status === "completed"
                  ? "bg-white/5 border-white/10 opacity-60"
                  : action.priority === "high"
                  ? "bg-red-500/5 border-red-500/30"
                  : "bg-white/5 border-white/10"
              }`}
              data-testid={`action-${action.id}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    action.status === "completed"
                      ? "bg-green-500/20"
                      : action.priority === "high"
                      ? "bg-red-500/20"
                      : "bg-blue-500/20"
                  }`}
                >
                  {action.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Zap className={`w-5 h-5 ${action.priority === "high" ? "text-red-400" : "text-blue-400"}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{action.title}</h3>
                  <p className="text-sm text-white/60">{action.description}</p>
                </div>
              </div>
              {action.status !== "completed" && (
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white gap-1" data-testid={`button-action-${action.id}`}>
                  Take Action
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </OrbitLayout>
  );
}
