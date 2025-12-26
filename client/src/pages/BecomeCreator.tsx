import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Wand2, Video, Users, BarChart3, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function BecomeCreator() {
  const { user, refetch } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const becomeCreatorMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/me/become-creator", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to become a creator");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome, Creator!",
        description: "You can now start building your stories.",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isAlreadyCreator = user?.role === 'creator' || user?.role === 'admin' || user?.isAdmin;

  if (isAlreadyCreator) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-4">You're Already a Creator!</h2>
          <p className="text-muted-foreground mb-6">
            Head to your dashboard to start creating amazing stories.
          </p>
          <Link href="/admin">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const freeTierFeatures = [
    "Create up to 1 universe",
    "Up to 5 story cards",
    "Basic text stories",
    "Share with viewers",
  ];

  const proTierFeatures = [
    "Unlimited universes",
    "Up to 50 story cards per story",
    "Custom AI characters",
    "AI image generation",
    "Voice narration",
    "Analytics dashboard",
  ];

  const businessTierFeatures = [
    "Everything in Pro",
    "Unlimited story cards",
    "AI video generation",
    "Export for distribution",
    "Priority support",
    "Custom branding",
  ];

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-purple-600 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Start Your Story</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Become a Creator
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Transform your ideas into interactive stories. Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 relative" data-testid="card-free-tier">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-muted-foreground" />
                Free
              </CardTitle>
              <CardDescription>Get started with the basics</CardDescription>
              <div className="text-3xl font-bold mt-2">$0<span className="text-base font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {freeTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => becomeCreatorMutation.mutate()}
                disabled={becomeCreatorMutation.isPending}
                data-testid="button-start-free"
              >
                {becomeCreatorMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Start Free
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500 relative" data-testid="card-pro-tier">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-xs font-medium">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Pro
              </CardTitle>
              <CardDescription>For serious storytellers</CardDescription>
              <div className="text-3xl font-bold mt-2">$19<span className="text-base font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {proTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled data-testid="button-upgrade-pro">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 relative" data-testid="card-business-tier">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-muted-foreground" />
                Business
              </CardTitle>
              <CardDescription>Full production capabilities</CardDescription>
              <div className="text-3xl font-bold mt-2">$49<span className="text-base font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {businessTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled data-testid="button-upgrade-business">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-8 text-muted-foreground text-sm">
          <p>All creators start with a free account. Upgrade anytime to unlock more features.</p>
        </div>
      </div>
    </Layout>
  );
}
