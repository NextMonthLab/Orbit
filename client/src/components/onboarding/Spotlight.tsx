import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";

export interface SpotlightStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  action?: {
    label: string;
    onClick?: () => void;
  };
}

interface SpotlightProps {
  steps: SpotlightStep[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function Spotlight({
  steps,
  currentStep,
  onNext,
  onSkip,
  onComplete,
}: SpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (!step) return;

    const updatePosition = () => {
      const target = document.querySelector(step.targetSelector);
      if (!target) {
        console.warn(`Spotlight target not found: ${step.targetSelector}`);
        return;
      }

      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      const padding = 12;
      const tooltipWidth = 320;
      const tooltipHeight = 180;

      let x = 0;
      let y = 0;

      const position = step.position || "bottom";
      const align = step.align || "center";

      switch (position) {
        case "top":
          y = rect.top - tooltipHeight - padding;
          break;
        case "bottom":
          y = rect.bottom + padding;
          break;
        case "left":
          x = rect.left - tooltipWidth - padding;
          y = rect.top + (rect.height - tooltipHeight) / 2;
          break;
        case "right":
          x = rect.right + padding;
          y = rect.top + (rect.height - tooltipHeight) / 2;
          break;
      }

      if (position === "top" || position === "bottom") {
        switch (align) {
          case "start":
            x = rect.left;
            break;
          case "center":
            x = rect.left + (rect.width - tooltipWidth) / 2;
            break;
          case "end":
            x = rect.right - tooltipWidth;
            break;
        }
      }

      x = Math.max(16, Math.min(x, window.innerWidth - tooltipWidth - 16));
      y = Math.max(16, Math.min(y, window.innerHeight - tooltipHeight - 16));

      setTooltipPosition({ x, y });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      observer.disconnect();
    };
  }, [step]);

  const handleNext = () => {
    if (step.action?.onClick) {
      step.action.onClick();
    }
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  if (!step || !targetRect) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "auto" }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 4}
                y={targetRect.top - 4}
                width={targetRect.width + 8}
                height={targetRect.height + 8}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
            onClick={onSkip}
          />
        </svg>

        <div
          className="absolute pointer-events-none"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        >
          <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-black animate-pulse" />
        </div>

        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-auto"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            width: 320,
          }}
          data-testid="spotlight-tooltip"
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-400">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button
                  onClick={onSkip}
                  className="text-zinc-500 hover:text-white transition-colors"
                  data-testid="button-spotlight-skip"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 mb-4">{step.description}</p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-spotlight-next"
                >
                  {step.action?.label || (isLastStep ? "Got it" : "Next")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <button
                  onClick={onSkip}
                  className="text-sm text-zinc-500 hover:text-zinc-400 px-2"
                  data-testid="button-spotlight-skip-text"
                >
                  Skip tour
                </button>
              </div>
            </div>
            <div className="h-1 bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default Spotlight;
