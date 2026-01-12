import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { PlayCircle, PauseCircle, Activity, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface ActiveIcePanelProps {
  universeId: number;
  universeSlug?: string | null;
}

interface IceStatus {
  iceStatus: string;
  activeSince: string | null;
  pausedAt: string | null;
  ownerUserId: number | null;
  currentActive?: number;
  limit?: number;
  analyticsEnabled?: boolean;
  chatEnabled?: boolean;
}

export function ActiveIcePanel({ universeId, universeSlug }: ActiveIcePanelProps) {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery<IceStatus>({
    queryKey: ["ice-status", universeId],
    queryFn: async () => {
      const res = await fetch(`/api/experiences/${universeId}/status`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch status");
      return res.json();
    },
  });

  const { data: summary } = useQuery<{
    currentActive: number;
    limit: number;
    remaining: number;
  }>({
    queryKey: ["active-ices-summary"],
    queryFn: async () => {
      const res = await fetch("/api/user/active-ices", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/experiences/${universeId}/activate`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to activate");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ice-status", universeId] });
      queryClient.invalidateQueries({ queryKey: ["active-ices-summary"] });
      queryClient.invalidateQueries({ queryKey: ["universe", universeId] });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/experiences/${universeId}/pause`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to pause");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ice-status", universeId] });
      queryClient.invalidateQueries({ queryKey: ["active-ices-summary"] });
      queryClient.invalidateQueries({ queryKey: ["universe", universeId] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isActive = status?.iceStatus === "active";
  const isPaused = status?.iceStatus === "paused";
  const isDraft = status?.iceStatus === "draft" || !status?.iceStatus;
  const limit = summary?.limit ?? status?.limit ?? 0;
  const currentActive = summary?.currentActive ?? status?.currentActive ?? 0;
  const atLimit = limit !== -1 && currentActive >= limit && !isActive;

  return (
    <Card data-testid="active-ice-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <CardTitle>Hosting Status</CardTitle>
          </div>
          <Badge
            variant={isActive ? "default" : isPaused ? "secondary" : "outline"}
            className={isActive ? "bg-green-500" : isPaused ? "bg-yellow-500" : ""}
          >
            {isActive ? "Active" : isPaused ? "Paused" : "Draft"}
          </Badge>
        </div>
        <CardDescription>
          Control public access to this experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <PlayCircle className="w-4 h-4" />
              <span>Publicly accessible</span>
            </div>
            {status?.activeSince && (
              <p className="text-xs text-muted-foreground">
                Active since {format(new Date(status.activeSince), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
            {universeSlug && (
              <Link href={`/story/${universeSlug}`}>
                <Button variant="link" size="sm" className="gap-1 h-auto p-0 text-xs" data-testid="link-public-url">
                  <ExternalLink className="w-3 h-3" />
                  View public page
                </Button>
              </Link>
            )}
          </div>
        )}

        {isPaused && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <PauseCircle className="w-4 h-4" />
              <span>Not publicly accessible</span>
            </div>
            {status?.pausedAt && (
              <p className="text-xs text-muted-foreground">
                Paused on {format(new Date(status.pausedAt), "MMM d, yyyy")}
              </p>
            )}
          </div>
        )}

        {isDraft && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This experience is in draft mode. Activate it to make it publicly accessible.
            </p>
          </div>
        )}

        {summary && limit !== -1 && (
          <div className="text-xs text-muted-foreground">
            Using {currentActive} of {limit} active experience{limit !== 1 ? "s" : ""}
          </div>
        )}

        {atLimit && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-yellow-600 dark:text-yellow-400">Limit reached</p>
              <p className="text-xs text-muted-foreground">
                Pause another experience or upgrade your plan to activate more.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {(isPaused || isDraft) && (
            <Button
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending || atLimit}
              className="gap-2"
              data-testid="button-activate"
            >
              {activateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              Activate
            </Button>
          )}

          {isActive && (
            <Button
              variant="outline"
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
              className="gap-2"
              data-testid="button-pause"
            >
              {pauseMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PauseCircle className="w-4 h-4" />
              )}
              Pause
            </Button>
          )}
        </div>

        {(activateMutation.isError || pauseMutation.isError) && (
          <p className="text-sm text-red-500" data-testid="error-message">
            {activateMutation.error?.message || pauseMutation.error?.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
