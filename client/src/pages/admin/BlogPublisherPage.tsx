import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import { 
  FileText, 
  Eye, 
  Upload, 
  Check, 
  X, 
  Loader2,
  ExternalLink,
  Trash2,
  Edit3,
  Calendar,
  User,
  ShieldX
} from "lucide-react";
import type { BlogPost } from "@shared/schema";

interface ValidationResult {
  valid: boolean;
  message?: string;
  metadata?: {
    title: string;
    slug: string;
    description: string | null;
    author: string | null;
    tags: string[];
    heroImageUrl: string | null;
    heroAlt: string | null;
    heroCaption: string | null;
    ctaPrimaryLabel: string | null;
    ctaPrimaryUrl: string | null;
    ctaSecondaryLabel: string | null;
    ctaSecondaryUrl: string | null;
    canonicalUrl: string | null;
    internalLinks: string[];
  };
  contentMarkdown?: string;
  existingPost?: { id: number; slug: string; title: string } | null;
  wordCount?: number;
}

function escapeYamlValue(value: string): string {
  if (value.includes('"') || value.includes('\n') || value.includes(':')) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return `"${value}"`;
}

export default function BlogPublisherPage() {
  const { user, loading: authLoading } = useAuth();
  const [markdown, setMarkdown] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "posts">("write");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const validateMutation = useMutation({
    mutationFn: async (md: string) => {
      const res = await fetch("/api/admin/blog/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ markdown: md }),
      });
      return res.json();
    },
    onSuccess: (data: ValidationResult) => {
      setValidation(data);
      if (!data.valid) {
        toast({
          title: "Validation Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to validate blog post",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setMarkdown("");
      setValidation(null);
      setEditingId(null);
      setActiveTab("posts");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Blog post deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <ShieldX className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-white/60 text-center max-w-md">
          You need administrator privileges to access the Blog Publisher.
        </p>
      </div>
    );
  }

  const handleValidate = () => {
    if (!markdown.trim()) {
      toast({
        title: "Error",
        description: "Please paste some markdown content first",
        variant: "destructive",
      });
      return;
    }
    validateMutation.mutate(markdown);
  };

  const handlePublish = () => {
    if (!validation?.valid || !validation.metadata) return;

    const postData = {
      id: editingId || validation.existingPost?.id || undefined,
      slug: validation.metadata.slug,
      title: validation.metadata.title,
      description: validation.metadata.description,
      contentMarkdown: validation.contentMarkdown,
      heroImageUrl: validation.metadata.heroImageUrl,
      heroAlt: validation.metadata.heroAlt,
      heroCaption: validation.metadata.heroCaption,
      ctaPrimaryLabel: validation.metadata.ctaPrimaryLabel,
      ctaPrimaryUrl: validation.metadata.ctaPrimaryUrl,
      ctaSecondaryLabel: validation.metadata.ctaSecondaryLabel,
      ctaSecondaryUrl: validation.metadata.ctaSecondaryUrl,
      author: validation.metadata.author,
      tags: validation.metadata.tags,
      canonicalUrl: validation.metadata.canonicalUrl,
      internalLinks: validation.metadata.internalLinks,
      status: publishImmediately ? "published" : "draft",
    };

    saveMutation.mutate(postData);
  };

  const handleEdit = (post: BlogPost) => {
    const frontmatter = [
      "---",
      `title: ${escapeYamlValue(post.title)}`,
      `slug: ${escapeYamlValue(post.slug)}`,
      post.description ? `description: ${escapeYamlValue(post.description)}` : null,
      post.author ? `author: ${escapeYamlValue(post.author)}` : null,
      post.tags?.length ? `tags: [${post.tags.map(t => escapeYamlValue(t)).join(", ")}]` : null,
      post.heroImageUrl ? `heroImageUrl: ${escapeYamlValue(post.heroImageUrl)}` : null,
      post.heroAlt ? `heroAlt: ${escapeYamlValue(post.heroAlt)}` : null,
      post.ctaPrimaryLabel ? `ctaPrimaryLabel: ${escapeYamlValue(post.ctaPrimaryLabel)}` : null,
      post.ctaPrimaryUrl ? `ctaPrimaryUrl: ${escapeYamlValue(post.ctaPrimaryUrl)}` : null,
      "---",
      "",
    ].filter(Boolean).join("\n");

    setMarkdown(frontmatter + post.contentMarkdown);
    setEditingId(post.id);
    setPublishImmediately(post.status === "published");
    setActiveTab("write");
    setValidation(null);
  };

  const sampleMarkdown = `---
title: "Getting Started with Orbit"
description: "Learn how Orbit transforms how AI systems discover and represent your business"
author: "Orbit Team"
tags: [orbit, ai-discovery, business]
heroImageUrl: "/images/orbit-hero.jpg"
ctaPrimaryLabel: "Claim Your Orbit"
ctaPrimaryUrl: "/for/brands"
---

# Getting Started with Orbit

Orbit is your Business-to-AI interface. In this guide, we'll explore how to set up and optimize your Orbit for maximum AI discovery.

## What is Orbit?

Orbit creates a machine-readable identity for your business that AI systems can understand and accurately represent.

## Key Benefits

1. **Control Your Narrative** - Define how AI represents you
2. **Track AI Access** - See which AI systems are discovering you
3. **Improve Accuracy** - Reduce AI hallucinations about your business

## Getting Started

Visit the For Brands page to claim your business Orbit today.`;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
            Blog Publisher
          </h1>
          <p className="text-white/60 mt-2">
            Create and manage blog posts by pasting markdown content
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "posts")}>
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="write" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300" data-testid="tab-write">
              <Edit3 className="w-4 h-4 mr-2" />
              Write / Paste
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300" data-testid="tab-posts">
              <FileText className="w-4 h-4 mr-2" />
              All Posts ({posts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {editingId ? "Edit Post" : "Paste Markdown"}
                  </CardTitle>
                  <CardDescription className="text-white/50">
                    Paste your blog post with optional YAML frontmatter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={markdown}
                    onChange={(e) => {
                      setMarkdown(e.target.value);
                      setValidation(null);
                    }}
                    placeholder={sampleMarkdown}
                    className="min-h-[400px] bg-black/50 border-white/20 text-white font-mono text-sm"
                    data-testid="input-markdown"
                  />
                  
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleValidate}
                      disabled={!markdown.trim() || validateMutation.isPending}
                      className="bg-purple-500 hover:bg-purple-400"
                      data-testid="button-validate"
                    >
                      {validateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      Validate & Preview
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setMarkdown(sampleMarkdown)}
                      className="border-white/20 text-white/70 hover:bg-white/10"
                      data-testid="button-sample"
                    >
                      Load Sample
                    </Button>

                    {editingId && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMarkdown("");
                          setValidation(null);
                          setEditingId(null);
                        }}
                        className="border-white/20 text-white/70 hover:bg-white/10"
                        data-testid="button-cancel-edit"
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Preview & Publish
                  </CardTitle>
                  <CardDescription className="text-white/50">
                    Review extracted metadata before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!validation && (
                    <div className="text-center py-12 text-white/40">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Paste markdown and click Validate to preview</p>
                    </div>
                  )}

                  {validation && !validation.valid && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center gap-2 text-red-400">
                        <X className="w-5 h-5" />
                        <span className="font-medium">Validation Failed</span>
                      </div>
                      <p className="mt-2 text-red-300/80">{validation.message}</p>
                    </div>
                  )}

                  {validation?.valid && validation.metadata && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Valid Blog Post</span>
                          <Badge variant="outline" className="ml-auto border-green-500/50 text-green-400">
                            {validation.wordCount} words
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-white/50 text-xs">Title</Label>
                          <p className="text-white font-medium" data-testid="preview-title">{validation.metadata.title}</p>
                        </div>
                        
                        <div>
                          <Label className="text-white/50 text-xs">Slug</Label>
                          <p className="text-pink-400 font-mono text-sm" data-testid="preview-slug">/blog/{validation.metadata.slug}</p>
                        </div>

                        {validation.metadata.description && (
                          <div>
                            <Label className="text-white/50 text-xs">Description</Label>
                            <p className="text-white/80 text-sm">{validation.metadata.description}</p>
                          </div>
                        )}

                        {validation.metadata.author && (
                          <div>
                            <Label className="text-white/50 text-xs">Author</Label>
                            <p className="text-white/80 text-sm">{validation.metadata.author}</p>
                          </div>
                        )}

                        {validation.metadata.tags?.length > 0 && (
                          <div>
                            <Label className="text-white/50 text-xs">Tags</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {validation.metadata.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-purple-500/20 text-purple-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {validation.existingPost && (
                          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                            <p className="text-yellow-400 text-sm">
                              This will update existing post: "{validation.existingPost.title}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="publish"
                              checked={publishImmediately}
                              onCheckedChange={setPublishImmediately}
                              data-testid="switch-publish"
                            />
                            <Label htmlFor="publish" className="text-white/80">
                              Publish immediately
                            </Label>
                          </div>
                          <Badge variant={publishImmediately ? "default" : "secondary"}>
                            {publishImmediately ? "Will be published" : "Will save as draft"}
                          </Badge>
                        </div>

                        <Button
                          onClick={handlePublish}
                          disabled={saveMutation.isPending}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400"
                          data-testid="button-publish"
                        >
                          {saveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {editingId || validation.existingPost ? "Update Post" : "Create Post"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">All Blog Posts</CardTitle>
                <CardDescription className="text-white/50">
                  Manage your published and draft blog posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-pink-400" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No blog posts yet</p>
                    <p className="text-sm mt-2">Paste some markdown to create your first post</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-lg bg-black/30 border border-white/10 hover:border-white/20 transition-colors"
                        data-testid={`post-item-${post.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-white truncate">{post.title}</h3>
                              <Badge
                                variant={post.status === "published" ? "default" : "secondary"}
                                className={post.status === "published" ? "bg-green-500/20 text-green-400" : ""}
                              >
                                {post.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-pink-400 font-mono truncate">/blog/{post.slug}</p>
                            {post.description && (
                              <p className="text-sm text-white/50 mt-1 line-clamp-2">{post.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                              {post.author && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {post.author}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {post.status === "published" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/50 hover:text-white"
                                onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                                data-testid={`button-view-${post.id}`}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white/50 hover:text-white"
                              onClick={() => handleEdit(post)}
                              data-testid={`button-edit-${post.id}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white/50 hover:text-red-400"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this post?")) {
                                  deleteMutation.mutate(post.id);
                                }
                              }}
                              data-testid={`button-delete-${post.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
