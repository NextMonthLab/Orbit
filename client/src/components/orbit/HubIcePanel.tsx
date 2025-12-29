import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Zap, TrendingUp, Gift, AlertTriangle, Crown, Mic, Volume2, Play, Loader2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface HubIcePanelProps {
  businessSlug: string;
  planTier: 'free' | 'grow' | 'insight' | 'intelligence';
}

interface IceAllowanceResponse {
  allowance: number;
  used: number;
  remaining: number;
  periodStart: string;
  tier: string;
}

interface Voice {
  id: string;
  name: string;
  previewTextHint: string;
  tags: string[];
}

interface VoiceSettingsResponse {
  universeId: number | null;
  narrationEnabled: boolean;
  defaultVoice: string | null;
  defaultSpeed: number;
  defaultMode: string;
  cardsWithNarration: number;
  cardsWithAudio: number;
  totalCards: number;
}

const VOICE_DESCRIPTIONS: Record<string, string> = {
  alloy: "Balanced, neutral",
  echo: "Warm, resonant",
  fable: "British storyteller",
  onyx: "Deep, authoritative",
  nova: "Friendly, energetic",
  shimmer: "Soft, expressive",
};

export function HubIcePanel({ businessSlug, planTier }: HubIcePanelProps) {
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const INSIGHT_TIERS = ['insight', 'intelligence'];
  const isInsightTier = INSIGHT_TIERS.includes(planTier);
  const PAID_TIERS = ['grow', 'insight', 'intelligence'];
  const isPaidTier = PAID_TIERS.includes(planTier);

  const { data: allowanceData, isLoading } = useQuery<IceAllowanceResponse>({
    queryKey: ['/api/orbit', businessSlug, 'ice-allowance'],
    queryFn: async () => {
      const res = await fetch(`/api/orbit/${businessSlug}/ice-allowance`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch ICE allowance');
      return res.json();
    },
    enabled: isPaidTier,
  });

  const { data: voices = [] } = useQuery<Voice[]>({
    queryKey: ['/api/tts/voices'],
    queryFn: async () => {
      const res = await fetch('/api/tts/voices', { credentials: 'include' });
      if (!res.ok) return [];
      const data = await res.json();
      return data.voices || [];
    },
  });

  const { data: voiceSettings, isLoading: voiceSettingsLoading } = useQuery<VoiceSettingsResponse>({
    queryKey: ['/api/orbit', businessSlug, 'voice-settings'],
    queryFn: async () => {
      const res = await fetch(`/api/orbit/${businessSlug}/voice-settings`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch voice settings');
      return res.json();
    },
    enabled: isPaidTier,
  });

  const updateVoiceSettingsMutation = useMutation({
    mutationFn: async (settings: { narrationEnabled?: boolean; defaultVoice?: string; defaultSpeed?: number }) => {
      const res = await fetch(`/api/orbit/${businessSlug}/voice-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to update voice settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orbit', businessSlug, 'voice-settings'] });
    },
  });

  const generateAllNarrationsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/orbit/${businessSlug}/narrations/generate-all`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate narrations');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/orbit', businessSlug, 'voice-settings'] });
      toast({
        title: "Narration generation started",
        description: `Generating audio for ${data.cardsToGenerate} cards...`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const previewVoice = async (voiceId: string) => {
    setPreviewingVoice(voiceId);
    try {
      const res = await fetch(`/api/tts/preview?voice=${voiceId}&text=Welcome to your Interactive Cinematic Experience.`, {
        credentials: 'include',
      });
      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play();
        audio.onended = () => setPreviewingVoice(null);
      }
    } catch (err) {
      console.error('Preview failed:', err);
    } finally {
      setTimeout(() => setPreviewingVoice(null), 3000);
    }
  };

  const getNudgeMessage = (used: number, allowance: number) => {
    if (allowance === 0) return null;
    
    const usageRatio = used / allowance;
    
    if (usageRatio >= 1.33) {
      return {
        type: 'warning' as const,
        icon: AlertTriangle,
        message: "You're using ICE heavily! Consider Orbit Intelligence for more credits.",
        action: 'Upgrade',
      };
    }
    if (usageRatio >= 1) {
      return {
        type: 'info' as const,
        icon: Zap,
        message: "You've used your bundled credits. Additional ICEs are pay-as-you-go.",
        action: null,
      };
    }
    if (usageRatio >= 0.67) {
      return {
        type: 'success' as const,
        icon: TrendingUp,
        message: "Great momentum! You're making the most of your Orbit.",
        action: null,
      };
    }
    return null;
  };

  const nudge = allowanceData ? getNudgeMessage(allowanceData.used, allowanceData.allowance) : null;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
          <div className="h-32 bg-zinc-800 rounded mt-6"></div>
        </div>
      </div>
    );
  }

  const cardsNeedingAudio = voiceSettings ? voiceSettings.cardsWithNarration - voiceSettings.cardsWithAudio : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-1">ICE Maker</h2>
        <p className="text-zinc-400 text-sm">
          Create Interactive Cinematic Experiences for your visitors
        </p>
      </div>

      {isInsightTier && allowanceData && (
        <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-5 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-400" />
              <h3 className="font-medium text-white">Monthly Bundled Credits</h3>
            </div>
            <span className="text-sm text-zinc-400">
              Resets monthly
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{allowanceData.allowance}</p>
              <p className="text-xs text-zinc-500">Included</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-pink-400">{allowanceData.used}</p>
              <p className="text-xs text-zinc-500">Used</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{allowanceData.remaining}</p>
              <p className="text-xs text-zinc-500">Remaining</p>
            </div>
          </div>

          <div className="mb-2">
            <Progress 
              value={allowanceData.allowance > 0 ? Math.min((allowanceData.used / allowanceData.allowance) * 100, 100) : 0} 
              className="h-2 bg-zinc-700"
            />
          </div>
          <p className="text-xs text-zinc-500">
            {allowanceData.used} of {allowanceData.allowance} credits used this period
          </p>
        </div>
      )}

      {nudge && (
        <div className={cn(
          "mb-6 rounded-lg p-4 border flex items-start gap-3",
          nudge.type === 'warning' && "bg-amber-500/10 border-amber-500/30",
          nudge.type === 'info' && "bg-blue-500/10 border-blue-500/30",
          nudge.type === 'success' && "bg-emerald-500/10 border-emerald-500/30"
        )}>
          <nudge.icon className={cn(
            "h-5 w-5 mt-0.5 shrink-0",
            nudge.type === 'warning' && "text-amber-400",
            nudge.type === 'info' && "text-blue-400",
            nudge.type === 'success' && "text-emerald-400"
          )} />
          <div className="flex-1">
            <p className={cn(
              "text-sm",
              nudge.type === 'warning' && "text-amber-200",
              nudge.type === 'info' && "text-blue-200",
              nudge.type === 'success' && "text-emerald-200"
            )}>
              {nudge.message}
            </p>
            {nudge.action && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
              >
                <Crown className="h-4 w-4 mr-1" />
                {nudge.action} to Intelligence
              </Button>
            )}
          </div>
        </div>
      )}

      {planTier === 'grow' && (
        <div className="mb-6 bg-zinc-800/30 rounded-lg p-5 border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-emerald-400" />
            <h3 className="font-medium text-white">Pay-as-you-go</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Create ICE experiences for £8 per credit. Each standard ICE includes 12 cards, 12 AI images, and up to 4 video scenes.
          </p>
          <div className="flex items-center gap-2 text-sm text-purple-300">
            <Gift className="h-4 w-4" />
            <span>Upgrade to Orbit Understand for 6 bundled credits/month</span>
          </div>
        </div>
      )}

      {isPaidTier && (
        <div className="mb-6 bg-zinc-800/50 rounded-lg p-5 border border-zinc-700">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="h-5 w-5 text-blue-400" />
            <h3 className="font-medium text-white">Voice Narration</h3>
          </div>
          
          {voiceSettingsLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-zinc-700 rounded"></div>
              <div className="h-10 bg-zinc-700 rounded"></div>
            </div>
          ) : voiceSettings?.universeId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Enable voice narration</p>
                  <p className="text-xs text-zinc-500">Add AI-spoken dialogue to your ICE cards</p>
                </div>
                <Switch
                  checked={voiceSettings.narrationEnabled}
                  onCheckedChange={(checked) => updateVoiceSettingsMutation.mutate({ narrationEnabled: checked })}
                  data-testid="switch-narration-enabled"
                />
              </div>

              {voiceSettings.narrationEnabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Default Voice</label>
                    <div className="flex gap-2">
                      <Select
                        value={voiceSettings.defaultVoice || 'alloy'}
                        onValueChange={(voice) => updateVoiceSettingsMutation.mutate({ defaultVoice: voice })}
                      >
                        <SelectTrigger className="flex-1 bg-zinc-900 border-zinc-700" data-testid="select-voice">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {voices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              <div className="flex items-center gap-2">
                                <span>{voice.name}</span>
                                <span className="text-xs text-zinc-500">
                                  {VOICE_DESCRIPTIONS[voice.id] || voice.previewTextHint}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-zinc-700"
                        onClick={() => previewVoice(voiceSettings.defaultVoice || 'alloy')}
                        disabled={previewingVoice !== null}
                        data-testid="button-preview-voice"
                      >
                        {previewingVoice ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-zinc-400">Speaking Speed</label>
                      <span className="text-sm text-white">{voiceSettings.defaultSpeed?.toFixed(1) || '1.0'}x</span>
                    </div>
                    <Slider
                      value={[voiceSettings.defaultSpeed || 1.0]}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      onValueCommit={(value) => updateVoiceSettingsMutation.mutate({ defaultSpeed: value[0] })}
                      className="w-full"
                      data-testid="slider-speed"
                    />
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Slower</span>
                      <span>Faster</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-white">Narration Status</p>
                        <p className="text-xs text-zinc-500">
                          {voiceSettings.cardsWithAudio} of {voiceSettings.cardsWithNarration} cards have audio
                        </p>
                      </div>
                      {voiceSettings.cardsWithNarration > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          {voiceSettings.cardsWithAudio === voiceSettings.cardsWithNarration ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Check className="h-3 w-3" /> All ready
                            </span>
                          ) : (
                            <span className="text-amber-400">
                              {cardsNeedingAudio} need audio
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {cardsNeedingAudio > 0 && (
                      <Button
                        onClick={() => generateAllNarrationsMutation.mutate()}
                        disabled={generateAllNarrationsMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        data-testid="button-generate-all-narrations"
                      >
                        {generateAllNarrationsMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-4 w-4 mr-2" />
                            Generate All Narrations ({cardsNeedingAudio} cards)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Create an ICE first to configure voice narration settings.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-400" />
            What's included in an ICE?
          </h4>
          <ul className="text-sm text-zinc-400 space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
              12 narrative cards/scenes
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              12 AI-generated images
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Up to 4 video scenes (auto-selected)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Script and styling included
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              AI voice narration (optional)
            </li>
          </ul>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          size="lg"
          data-testid="button-create-ice"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Create New ICE
        </Button>
      </div>
    </div>
  );
}
