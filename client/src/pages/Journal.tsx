import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, ArrowLeft, Calendar, Eye, MessageCircle } from "lucide-react";

interface UserProgress {
  id: number;
  userId: number;
  cardId: number;
  completed: boolean;
  viewedAt: string;
  card?: {
    id: number;
    title: string;
    dayIndex: number;
    universeId: number;
  };
  universe?: {
    id: number;
    title: string;
  };
}

export default function Journal() {
  const { user, loading: authLoading } = useAuth();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["user-progress"],
    queryFn: async () => {
      const response = await fetch("/api/user/progress", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch progress");
      return response.json() as Promise<UserProgress[]>;
    },
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Journal</h1>
        <p className="text-muted-foreground mb-4 text-center">
          Sign in to track your story progress and save your journey.
        </p>
        <Link href="/login">
          <Button data-testid="button-login">Sign In</Button>
        </Link>
      </div>
    );
  }

  const groupedProgress = progress?.reduce((acc, item) => {
    const universeId = item.universe?.id || 0;
    if (!acc[universeId]) {
      acc[universeId] = {
        universe: item.universe,
        items: [],
      };
    }
    acc[universeId].items.push(item);
    return acc;
  }, {} as Record<number, { universe?: { id: number; title: string }; items: UserProgress[] }>);

  return (
    <div className="min-h-screen bg-background" data-testid="journal-page">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Case Journal</h1>
            <p className="text-sm text-muted-foreground">Your story progress</p>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        {!progress || progress.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">No entries yet</h2>
              <p className="text-muted-foreground mb-4">
                Start watching stories to track your progress here.
              </p>
              <Link href="/today">
                <Button data-testid="button-start-watching">Start Watching</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="space-y-6">
              {Object.values(groupedProgress || {}).map((group) => (
                <Card key={group.universe?.id || 0} data-testid={`journal-universe-${group.universe?.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {group.universe?.title || "Unknown Story"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.items
                        .sort((a, b) => (b.card?.dayIndex || 0) - (a.card?.dayIndex || 0))
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            data-testid={`journal-entry-${item.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                  {item.card?.dayIndex || "?"}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{item.card?.title || "Untitled"}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.viewedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.completed && (
                                <Badge variant="secondary">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Viewed
                                </Badge>
                              )}
                              <Link href={`/card/${item.cardId}`}>
                                <Button variant="ghost" size="sm" data-testid={`button-view-${item.id}`}>
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
