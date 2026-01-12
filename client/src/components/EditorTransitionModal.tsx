import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Image, 
  Video, 
  MessageCircle, 
  Settings, 
  BarChart3,
  ChevronRight,
  Check,
  Wand2
} from "lucide-react";

interface EditorTransitionModalProps {
  onComplete: () => void;
}

const FEATURES = [
  {
    icon: Wand2,
    title: "AI Media Generation",
    description: "Generate custom images, video clips, and voiceover for every card in your story.",
  },
  {
    icon: MessageCircle,
    title: "Live AI Characters",
    description: "Your interactivity nodes are now fully active. Audiences can have real conversations.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track views, engagement, and conversation patterns to understand your audience.",
  },
  {
    icon: Settings,
    title: "Advanced Controls",
    description: "Fine-tune your character personalities, visual style, and publishing settings.",
  },
];

export function EditorTransitionModal({ onComplete }: EditorTransitionModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-950 border border-purple-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
      >
        <div className="relative p-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to the Professional Editor
            </h2>
            <p className="text-slate-400 text-sm">
              Your preview has been upgraded. Here's what's new:
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{feature.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <Button
            onClick={onComplete}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg font-semibold"
            data-testid="button-start-creating"
          >
            Start Creating
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-xs text-center text-slate-500 mt-4">
            Your preview content has been transferred to My Projects
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function useEditorTransition() {
  const [showTransition, setShowTransition] = useState(false);
  
  const checkAndShowTransition = (isNewUpgrade: boolean) => {
    if (typeof window === "undefined") return;
    if (isNewUpgrade && !localStorage.getItem("editor_transition_seen")) {
      setShowTransition(true);
    }
  };
  
  const completeTransition = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("editor_transition_seen", "true");
    }
    setShowTransition(false);
  };
  
  return {
    showTransition,
    checkAndShowTransition,
    completeTransition,
  };
}
