import { motion } from "framer-motion";
import { Globe, Sparkles, Shield, BarChart3, Palette, MessageCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ScanProgressScreenProps {
  domain: string;
}

const steps = [
  { 
    id: 'deep-read', 
    label: 'Deep Read', 
    description: 'Reading your site structure so visitors get accurate answers',
    minDwell: 3000,
  },
  { 
    id: 'concept-map', 
    label: 'Understanding', 
    description: 'Extracting services and questions customers actually ask',
    minDwell: 4000,
  },
  { 
    id: 'language-check', 
    label: 'Language Validation', 
    description: 'Ensuring everything reads naturally, not like labels',
    minDwell: 3000,
  },
  { 
    id: 'mental-model', 
    label: 'Visitor Clarity', 
    description: 'Checking if a visitor would understand what you do',
    minDwell: 3000,
  },
  { 
    id: 'build', 
    label: 'Building', 
    description: 'Creating your 24/7 assistant with validated content',
    minDwell: 2000,
  },
];

const ownerBenefits = [
  { icon: Palette, title: 'Brand Matching', description: 'Your colours, your voice' },
  { icon: Shield, title: 'AI Safeguards', description: 'Control what AI says' },
  { icon: BarChart3, title: 'Insights', description: 'What customers ask' },
  { icon: MessageCircle, title: '24/7 Leads', description: 'Capture enquiries always' },
];

export function ScanProgressScreen({ domain }: ScanProgressScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let cumulativeTime = 0;

    steps.forEach((step, index) => {
      if (index > 0) {
        const timer = setTimeout(() => {
          setCurrentStep(index);
        }, cumulativeTime);
        timers.push(timer);
      }
      cumulativeTime += step.minDwell;
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/[0.04] border border-white/[0.08] rounded-full">
          <Globe className="w-4 h-4 text-white/50" />
          <span className="text-white/60 text-sm">{domain}</span>
        </div>
        
        <h1 className="text-2xl font-semibold text-white mb-3">
          Understanding your website
        </h1>
        <p className="text-white/50 text-sm mb-10">
          We're reading carefully so visitors get accurate answers.
        </p>

        <div className="space-y-2.5 mb-12">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isComplete 
                    ? 'bg-white/[0.04] border-white/[0.12]' 
                    : isCurrent 
                      ? 'bg-white/[0.03] border-white/[0.1]' 
                      : 'bg-white/[0.01] border-white/[0.04]'
                }`}
              >
                <div className="relative w-8 h-8 rounded-full flex items-center justify-center">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-white/60" />
                  ) : isCurrent ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-white/10 border-t-white/50"
                      />
                      <span className="text-xs font-medium text-white/70">{index + 1}</span>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-white/30">{index + 1}</span>
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className={`text-sm font-medium ${
                    isComplete ? 'text-white/70' : isCurrent ? 'text-white/80' : 'text-white/40'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${
                    isComplete ? 'text-white/40' : isCurrent ? 'text-white/50' : 'text-white/25'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="h-px bg-white/[0.06] mb-8" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-white/40" />
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
              When you activate
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ownerBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.015] border border-white/[0.04]"
              >
                <benefit.icon className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white/60">{benefit.title}</p>
                  <p className="text-[10px] text-white/30">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
