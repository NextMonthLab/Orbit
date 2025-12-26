import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";

interface CreatorPublic {
  id: number;
  displayName: string;
  slug: string | null;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  externalLink: string | null;
  universes: Array<{
    id: number;
    slug: string;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    genre: string | null;
  }>;
}

export default function CreatorProfile() {
  const [match, params] = useRoute("/creator/:slug");
  const slug = params?.slug || "";

  const { data: creator, isLoading, error } = useQuery<CreatorPublic>({
    queryKey: ["creator", slug],
    queryFn: async () => {
      const res = await fetch(`/api/creators/${slug}`);
      if (!res.ok) throw new Error("Creator not found");
      return res.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !creator) {
    return (
      <Layout>
        <div className="p-8 max-w-md mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold">Creator Not Found</h1>
          <p className="text-muted-foreground">
            This creator profile doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button data-testid="button-go-home">Go Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const initials = creator.displayName?.slice(0, 2).toUpperCase() || "??";

  return (
    <Layout>
      <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary" data-testid="img-creator-avatar">
            <AvatarImage src={creator.avatarUrl || undefined} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="text-center sm:text-left flex-1 space-y-2">
            <h1 className="text-3xl font-display font-bold" data-testid="text-creator-name">
              {creator.displayName}
            </h1>
            {creator.headline && (
              <p className="text-lg text-muted-foreground" data-testid="text-creator-headline">
                {creator.headline}
              </p>
            )}
            {creator.externalLink && (
              <a
                href={creator.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
                data-testid="link-creator-external"
              >
                <ExternalLink className="w-4 h-4" />
                {new URL(creator.externalLink).hostname}
              </a>
            )}
          </div>
        </div>

        {creator.bio && (
          <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="text-creator-bio">
            {creator.bio.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Stories by {creator.displayName}
          </h2>

          {creator.universes.length === 0 ? (
            <p className="text-muted-foreground">No published stories yet.</p>
          ) : (
            <div className="grid gap-4">
              {creator.universes.map((universe) => (
                <Link key={universe.id} href={`/story/${universe.slug}`}>
                  <Card
                    className="hover:border-primary transition-colors cursor-pointer"
                    data-testid={`card-universe-${universe.id}`}
                  >
                    <CardContent className="flex gap-4 p-4">
                      {universe.coverImageUrl && (
                        <img
                          src={universe.coverImageUrl}
                          alt={universe.title}
                          className="w-20 h-28 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate">{universe.title}</h3>
                        {universe.genre && (
                          <span className="text-xs text-muted-foreground uppercase">
                            {universe.genre}
                          </span>
                        )}
                        {universe.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {universe.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
