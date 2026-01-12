import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Palette, Type, FileText, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HubBrandPanelProps {
  businessSlug: string;
  planTier: 'free' | 'grow' | 'insight' | 'intelligence';
  currentTitle?: string | null;
  currentDescription?: string | null;
}

export function HubBrandPanel({ 
  businessSlug, 
  planTier,
  currentTitle,
  currentDescription,
}: HubBrandPanelProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(currentTitle || '');
  const [description, setDescription] = useState(currentDescription || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTitle(currentTitle || '');
    setDescription(currentDescription || '');
  }, [currentTitle, currentDescription]);

  useEffect(() => {
    const titleChanged = title !== (currentTitle || '');
    const descChanged = description !== (currentDescription || '');
    setHasChanges(titleChanged || descChanged);
  }, [title, description, currentTitle, currentDescription]);

  const updateBrandMutation = useMutation({
    mutationFn: async (data: { customTitle: string; customDescription: string }) => {
      const response = await fetch(`/api/orbit/${businessSlug}/brand`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update brand settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orbit", businessSlug] });
      setHasChanges(false);
    },
  });

  if (planTier === 'free') {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-white mb-1">Brand Settings</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Customize your Orbit's appearance
        </p>
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
          <CardContent className="p-6 text-center">
            <Palette className="h-12 w-12 text-pink-400 mx-auto mb-4" />
            <h3 className="font-semibold text-white text-lg mb-2">Unlock Brand Customization</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Upgrade to Grow to customize your Orbit's title, description, and branding.
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
              Upgrade to Grow
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-1" data-testid="text-brand-title">
          Brand Settings
        </h2>
        <p className="text-zinc-400 text-sm">
          Customize how your Orbit appears to visitors
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-medium text-white flex items-center gap-2">
            <Type className="h-4 w-4 text-pink-400" />
            Custom Title
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Override the default title displayed on your Orbit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter custom title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-800 border-zinc-700"
            data-testid="input-custom-title"
          />
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-medium text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-400" />
            Custom Description
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Override the default description for your Orbit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            placeholder="Enter custom description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm min-h-[100px] resize-none"
            data-testid="input-custom-description"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          {hasChanges ? (
            <span className="text-amber-400">Unsaved changes</span>
          ) : updateBrandMutation.isSuccess ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">Changes saved</span>
            </>
          ) : (
            <span>No changes</span>
          )}
        </div>
        <Button
          onClick={() => updateBrandMutation.mutate({
            customTitle: title,
            customDescription: description,
          })}
          disabled={!hasChanges || updateBrandMutation.isPending}
          className={cn(
            "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600",
            !hasChanges && "opacity-50"
          )}
          data-testid="button-save-brand"
        >
          {updateBrandMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-pink-400 mt-0.5" />
            <div>
              <p className="text-sm text-zinc-300 mb-1">More customization coming soon</p>
              <p className="text-xs text-zinc-500">
                Logo upload, accent colors, and custom fonts will be available in a future update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
