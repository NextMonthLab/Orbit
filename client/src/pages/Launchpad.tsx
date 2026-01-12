import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Lightbulb } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import { useAuth } from "@/lib/auth";
import {
  LaunchpadHeader,
  SignalTiles,
  TopInsightCard,
  InsightFeed,
  PowerUpBanner,
  type OrbitSummary,
  type Insight,
} from "@/components/launchpad";
import { FirstRunOnboarding, Spotlight, type SpotlightStep } from "@/components/onboarding";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OnboardingProfile {
  id: number;
  userId: number;
  onboardingCompleted: boolean;
  onboardingDismissed: boolean;
  onboardingPath: "orbit-first" | null;
  onboardingCompletedAt: string | null;
}

interface OwnedOrbit {
  businessSlug: string;
  sourceUrl: string;
  generationStatus: string;
  previewId: string | null;
  customTitle: string | null;
  planTier: string | null;
  strengthScore: number;
  stats: {
    visits: number;
    interactions: number;
    conversations: number;
    leads: number;
  };
}

interface OrbitsResponse {
  orbits: OwnedOrbit[];
}

const SELECTED_ORBIT_KEY = "launchpad_selected_orbit";

function getStoredOrbitSlug(): string | null {
  try {
    return localStorage.getItem(SELECTED_ORBIT_KEY);
  } catch {
    return null;
  }
}

function setStoredOrbitSlug(slug: string): void {
  try {
    localStorage.setItem(SELECTED_ORBIT_KEY, slug);
  } catch {
  }
}

export default function Launchpad() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const processedQueryParams = useRef(false);

  const [selectedOrbit, setSelectedOrbit] = useState<OrbitSummary | null>(null);
  const [highlightedInsightId, setHighlightedInsightId] = useState<string | null>(null);
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTour, setActiveTour] = useState<"orbit-first" | null>(null);
  const [tourStep, setTourStep] = useState(0);

  const { data: orbitsData, isLoading: orbitsLoading, isError: orbitsError } = useQuery<OrbitsResponse>({
    queryKey: ["my-orbits"],
    queryFn: async () => {
      const response = await fetch("/api/me/orbits", { credentials: "include" });
      if (!response.ok) return { orbits: [] };
      return response.json();
    },
  });

  const orbits = orbitsData?.orbits || [];
  const hasOrbits = orbits.length > 0;

  const orbitSummaries: OrbitSummary[] = orbits.map((o) => ({
    id: o.businessSlug,
    slug: o.businessSlug,
    name: o.customTitle || o.businessSlug.replace(/-/g, " "),
    status: o.planTier && o.planTier !== "free" ? "powered" : "basic",
    strengthScore: o.strengthScore ?? 0,
  }));

  useEffect(() => {
    if (!orbitsLoading && !orbitsError && !hasOrbits) {
      setLocation("/orbit/claim");
    }
  }, [orbitsLoading, orbitsError, hasOrbits, setLocation]);

  useEffect(() => {
    if (orbitSummaries.length > 0 && !selectedOrbit) {
      const storedSlug = getStoredOrbitSlug();
      const found = orbitSummaries.find((o) => o.slug === storedSlug);
      setSelectedOrbit(found || orbitSummaries[0]);
    }
  }, [orbitSummaries, selectedOrbit]);

  useEffect(() => {
    if (processedQueryParams.current) return;
    if (!orbitSummaries.length) return;
    
    const params = new URLSearchParams(searchString);
    const orbitSlug = params.get("orbit");
    const insightId = params.get("insight");
    
    if (!orbitSlug) {
      processedQueryParams.current = true;
      return;
    }
    
    const targetOrbit = orbitSummaries.find((o) => o.slug === orbitSlug);
    if (targetOrbit) {
      setSelectedOrbit(targetOrbit);
      setStoredOrbitSlug(orbitSlug);
      if (insightId) {
        setHighlightedInsightId(insightId);
        const timer = setTimeout(() => setHighlightedInsightId(null), 3000);
        return () => clearTimeout(timer);
      }
      processedQueryParams.current = true;
      window.history.replaceState({}, "", "/launchpad");
    }
  }, [searchString, orbitSummaries]);

  const { data: insightsData, isLoading: insightsLoading } = useQuery<{ 
    insights: Insight[];
    total?: number;
    remaining?: number;
    locked?: boolean;
    upgradeMessage?: string;
  }>({
    queryKey: ["orbit-insights", selectedOrbit?.slug],
    queryFn: async () => {
      if (!selectedOrbit?.slug) return { insights: [] };
      const response = await fetch(`/api/orbit/${selectedOrbit.slug}/insights`, {
        credentials: "include",
      });
      if (!response.ok) return { insights: [] };
      return response.json();
    },
    enabled: !!selectedOrbit?.slug,
  });

  const { data: onboardingProfile } = useQuery<OnboardingProfile | null>({
    queryKey: ["me", "onboarding"],
    queryFn: async () => {
      const response = await fetch("/api/me/onboarding", { credentials: "include" });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user,
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/me/onboarding/tour", { 
        onboardingCompleted: true,
        onboardingDismissed: false 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "onboarding"] });
    },
  });

  useEffect(() => {
    if (!user || orbitsLoading) return;
    if (onboardingProfile === undefined) return;
    
    const shouldShowOnboarding = 
      onboardingProfile === null || 
      (!onboardingProfile.onboardingCompleted && !onboardingProfile.onboardingDismissed);
    
    if (shouldShowOnboarding && hasOrbits) {
      setShowOnboarding(true);
    }
  }, [user, onboardingProfile, orbitsLoading, hasOrbits]);

  const orbitTourSteps: SpotlightStep[] = [
    {
      id: "header",
      targetSelector: '[data-testid="launchpad-header"]',
      title: "Your Orbit at a Glance",
      description: "This shows which Orbit is selected and its current status. You can switch between different Orbits here.",
      position: "bottom",
    },
    {
      id: "insights",
      targetSelector: '[data-testid="top-insight-card"]',
      title: "AI-Powered Insights",
      description: "Your Orbit generates insights from conversations and data to help you understand your audience.",
      position: "right",
    },
  ];

  const handleStartTour = (path: "orbit-first") => {
    setActiveTour(path);
    setTourStep(0);
  };

  const handleTourNext = () => {
    if (tourStep < orbitTourSteps.length - 1) {
      setTourStep((prev) => prev + 1);
    }
  };

  const handleTourSkip = () => {
    setActiveTour(null);
    setTourStep(0);
    completeOnboardingMutation.mutate();
  };

  const handleTourComplete = () => {
    setActiveTour(null);
    setTourStep(0);
    completeOnboardingMutation.mutate();
    toast({
      title: "Tour Complete!",
      description: "You're all set to start using Orbit. Need help? Click 'Take the Tour' in the menu anytime.",
    });
  };

  const handleOpenTourFromMenu = () => {
    setShowOnboarding(true);
  };

  const insights = insightsData?.insights || [];
  const insightsLocked = insightsData?.locked || false;
  const insightsUpgradeMessage = insightsData?.upgradeMessage;
  const insightsRemaining = insightsData?.remaining ?? 0;
  const topInsight = insights.find((i) => i.kind === "top") || insights[0] || null;
  const feedInsights = insights.filter((i) => i.kind !== "top" || i.id !== topInsight?.id);

  const currentOrbitStats = orbits.find((o) => o.businessSlug === selectedOrbit?.slug)?.stats;

  const handleOrbitSelect = useCallback((orbit: OrbitSummary) => {
    setSelectedOrbit(orbit);
    setStoredOrbitSlug(orbit.slug);
  }, []);

  if (orbitsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNav context="app" onStartTour={handleOpenTourFromMenu} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!hasOrbits) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNav context="app" onStartTour={handleOpenTourFromMenu} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <GlobalNav context="app" onStartTour={handleOpenTourFromMenu} />
      
      <FirstRunOnboarding
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStartTour={handleStartTour}
      />
      
      {activeTour === "orbit-first" && (
        <Spotlight
          steps={orbitTourSteps}
          currentStep={tourStep}
          onNext={handleTourNext}
          onSkip={handleTourSkip}
          onComplete={handleTourComplete}
        />
      )}

      <LaunchpadHeader
        orbits={orbitSummaries}
        selectedOrbit={selectedOrbit}
        onOrbitSelect={handleOrbitSelect}
      />

      {selectedOrbit?.status === "basic" && (
        <PowerUpBanner
          orbitSlug={selectedOrbit.slug}
          onUpgrade={() => setLocation(`/orbit/${selectedOrbit.slug}/sources`)}
        />
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full">
          <SignalTiles
            visits={currentOrbitStats?.visits || 0}
            conversations={currentOrbitStats?.conversations || 0}
            leads={currentOrbitStats?.leads || 0}
          />

          <TopInsightCard insight={topInsight} />

          <InsightFeed
            insights={feedInsights}
            highlightedInsightId={highlightedInsightId}
            isLoading={insightsLoading}
            locked={insightsLocked}
            upgradeMessage={insightsUpgradeMessage}
            remainingInsights={insightsRemaining}
            orbitSlug={selectedOrbit?.slug}
          />
        </div>
      </div>
    </div>
  );
}
