import { Eye, EyeOff, Link2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Visibility = "private" | "unlisted" | "public";

interface VisibilityBadgeProps {
  visibility: Visibility;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const visibilityConfig: Record<Visibility, {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "secondary" | "outline";
  colors: string;
}> = {
  private: {
    label: "Private",
    description: "Only you can see this",
    icon: EyeOff,
    variant: "outline",
    colors: "border-zinc-600 text-zinc-400 bg-zinc-900/50",
  },
  unlisted: {
    label: "Unlisted",
    description: "Anyone with the link can view",
    icon: Link2,
    variant: "secondary",
    colors: "border-amber-600/50 text-amber-400 bg-amber-900/20",
  },
  public: {
    label: "Public",
    description: "Visible to everyone",
    icon: Globe,
    variant: "default",
    colors: "border-emerald-600/50 text-emerald-400 bg-emerald-900/20",
  },
};

export function VisibilityBadge({ 
  visibility, 
  size = "sm", 
  showLabel = true,
  className 
}: VisibilityBadgeProps) {
  const config = visibilityConfig[visibility] || visibilityConfig.private;
  const Icon = config.icon;
  
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const badgeSize = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline"
            className={cn(
              "gap-1 cursor-help border",
              badgeSize,
              config.colors,
              className
            )}
            data-testid={`badge-visibility-${visibility}`}
          >
            <Icon className={iconSize} />
            {showLabel && <span>{config.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function VisibilityIcon({ visibility, className }: { visibility: Visibility; className?: string }) {
  const config = visibilityConfig[visibility] || visibilityConfig.private;
  const Icon = config.icon;
  return <Icon className={cn("text-muted-foreground", className)} />;
}
