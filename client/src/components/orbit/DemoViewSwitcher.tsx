import { cn } from "@/lib/utils";
import { Eye, Briefcase, Brain } from "lucide-react";

export type DemoViewMode = 'public' | 'business' | 'intelligence';

interface DemoViewSwitcherProps {
  activeView: DemoViewMode;
  onViewChange: (view: DemoViewMode) => void;
  className?: string;
}

export function DemoViewSwitcher({ activeView, onViewChange, className }: DemoViewSwitcherProps) {
  const views: { id: DemoViewMode; label: string; icon: typeof Eye; description: string }[] = [
    { id: 'public', label: 'Public Experience', icon: Eye, description: 'What customers see' },
    { id: 'business', label: 'Business View', icon: Briefcase, description: 'Owner perspective' },
    { id: 'intelligence', label: 'Orbit Intelligence', icon: Brain, description: 'Under the hood' },
  ];

  return (
    <div className={cn(
      "flex items-center justify-center gap-1 p-1 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-xl",
      className
    )}>
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = activeView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-[#ff6b4a] to-[#ff4d8f] text-white shadow-lg"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
            data-testid={`button-view-${view.id}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
            <span className="sm:hidden">{view.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}
