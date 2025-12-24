import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Flame, Lock, Zap } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Fake login delay
    setTimeout(() => {
        setLocation("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    StoryFlix
                </h1>
                <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
                    Interactive Narrative Engine
                </p>
            </div>

            <Card className="bg-card/50 backdrop-blur-md border-white/10 shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Enter the Story</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to resume your progress
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                placeholder="detective@sector7.com" 
                                type="email" 
                                required 
                                className="bg-black/50 border-white/10 h-11"
                            />
                        </div>
                        <Button className="w-full h-11 font-bold tracking-wide" disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Accessing...
                                </span>
                            ) : (
                                "CONTINUE"
                            )}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-muted-foreground font-mono">Or join silently</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5" onClick={() => setLocation("/")}>
                        Continue as Guest
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-center gap-8 text-xs text-muted-foreground font-mono tracking-widest uppercase opacity-50">
                <div className="flex items-center gap-2">
                    <Flame className="w-3 h-3" /> Daily Drops
                </div>
                <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Secrets
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Live Chat
                </div>
            </div>
        </div>
    </div>
  );
}
