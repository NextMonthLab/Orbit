import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Sparkles, ArrowRight, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlobalNav from "@/components/GlobalNav";

interface VerifyResponse {
  success: boolean;
  subscription: {
    planId: number;
    status: string;
  };
  plan: {
    name: string;
    displayName: string;
  };
  pendingAction: {
    previewId: string | null;
    checkoutOptions: {
      mediaOptions: { images: boolean; video: boolean; music: boolean; voiceover: boolean };
      outputChoice: "download" | "publish";
      expansionScope: string;
      selectedPlan: string | null;
      interactivityNodeCount: number;
    };
  } | null;
}

export default function CheckoutSuccessPage() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<"verifying" | "success" | "transitioning" | "error">("verifying");
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  const verifyMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Verification failed");
      }
      return res.json() as Promise<VerifyResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
      setPhase("success");
      setTimeout(() => setPhase("transitioning"), 2000);
    },
    onError: (err: Error) => {
      setError(err.message);
      setPhase("error");
    },
  });

  useEffect(() => {
    if (sessionId && phase === "verifying") {
      // DEV BYPASS: Skip verification for dev sessions
      if (sessionId === "dev_bypass") {
        const previewId = urlParams.get("preview_id");
        setResult({
          success: true,
          subscription: { planId: 2, status: "active" },
          plan: { name: "pro", displayName: "Pro" },
          pendingAction: previewId ? {
            previewId,
            checkoutOptions: {
              mediaOptions: { images: true, video: true, music: true, voiceover: true },
              outputChoice: "publish",
              expansionScope: "preview_only",
              selectedPlan: "pro",
              interactivityNodeCount: 0,
            },
          } : null,
        });
        setPhase("success");
        setTimeout(() => setPhase("transitioning"), 2000);
        return;
      }
      verifyMutation.mutate(sessionId);
    }
  }, [sessionId]);

  const handleContinue = () => {
    if (result?.pendingAction?.previewId) {
      navigate(`/ice/preview/${result.pendingAction.previewId}?upgraded=true`);
    } else {
      navigate("/icemaker");
    }
  };

  useEffect(() => {
    if (phase === "transitioning") {
      const timer = setTimeout(handleContinue, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <GlobalNav />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <AnimatePresence mode="wait">
          {phase === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm max-w-md mx-auto">
                <CardContent className="p-8">
                  <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
                  <h2 className="text-2xl font-cinzel text-white mb-2">Verifying Payment</h2>
                  <p className="text-gray-400">Setting up your account...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm max-w-md mx-auto overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
                <CardContent className="p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                  </motion.div>
                  <h2 className="text-2xl font-cinzel text-white mb-2">
                    Welcome to {result.plan.displayName || result.plan.name}!
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Your subscription is now active
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">All features unlocked</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === "transitioning" && result && (
            <motion.div
              key="transitioning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm max-w-lg mx-auto overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
                <CardContent className="p-8">
                  <Film className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h2 className="text-2xl font-cinzel text-white mb-4">
                    {result.pendingAction?.previewId 
                      ? "Returning to Your Story" 
                      : "Opening Professional Editor"}
                  </h2>
                  <p className="text-gray-400 mb-6">
                    {result.pendingAction?.previewId 
                      ? "Your preview is exactly where you left it. Now you can generate full media, add AI interactivity, and publish your experience."
                      : "You now have access to all professional features. Create your next cinematic experience."}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Redirecting...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">!</span>
                  </div>
                  <h2 className="text-2xl font-cinzel text-white mb-2">Verification Issue</h2>
                  <p className="text-gray-400 mb-6">{error || "Unable to verify your payment"}</p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/icemaker")}
                      data-testid="button-go-home"
                    >
                      Go to IceMaker
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()}
                      data-testid="button-retry"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {(phase === "success" || phase === "transitioning") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2"
          >
            <Button 
              onClick={handleContinue}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              data-testid="button-continue"
            >
              Continue Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
