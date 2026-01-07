import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  FileText,
  Lightbulb,
  TrendingUp,
  Hash,
  Filter,
  X,
  Link2,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import GlobalNav from "@/components/GlobalNav";

interface HeroPost {
  id: number;
  businessSlug: string;
  url: string;
  sourcePlatform: string;
  title?: string;
  text?: string;
  ogImageUrl?: string;
  ogDescription?: string;
  status: 'pending' | 'enriching' | 'ready' | 'needs_text' | 'error';
  extracted?: {
    topics?: string[];
    hookType?: string;
    intent?: string;
    offers?: string[];
    proofPoints?: string[];
    entities?: string[];
    riskFlags?: string[];
    followUpIdeas?: Array<{ title: string; hook: string; linkBack: string }>;
  };
  performedBecause?: string;
  outcomeNote?: string;
  tags?: string[];
  errorMessage?: string;
  useAsKnowledge?: boolean;
  createdAt: string;
}

interface InsightsData {
  topThemes: Array<{ theme: string; count: number }>;
  topHooks: Array<{ hookType: string; count: number }>;
  topProofTypes: Array<{ proofType: string; count: number }>;
  suggestions: Array<{
    title: string;
    hook: string;
    theme: string;
    basedOnPostId: number;
    linkBackSuggestion: string;
  }>;
  summary: string;
  postCount: number;
  readyCount: number;
}

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: '🔗',
  x: '𝕏',
  instagram: '📸',
  facebook: '📘',
  youtube: '▶️',
  tiktok: '🎵',
  other: '🔗',
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-zinc-700 text-zinc-300' },
  enriching: { label: 'Processing...', color: 'bg-blue-900/50 text-blue-300' },
  ready: { label: 'Ready', color: 'bg-green-900/50 text-green-300' },
  needs_text: { label: 'Needs Content', color: 'bg-yellow-900/50 text-yellow-300' },
  error: { label: 'Error', color: 'bg-red-900/50 text-red-300' },
};

function StatusBadge({ status }: { status: HeroPost['status'] }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={`${config.color} text-xs`} data-testid={`badge-status-${status}`}>
      {status === 'enriching' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
      {config.label}
    </Badge>
  );
}

function HeroPostCard({ 
  post, 
  onEnrich, 
  onDelete,
  onToggleKnowledge,
  isEnriching 
}: { 
  post: HeroPost; 
  onEnrich: () => void; 
  onDelete: () => void;
  onToggleKnowledge: (useAsKnowledge: boolean) => void;
  isEnriching: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div 
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
      data-testid={`hero-post-${post.id}`}
    >
      <div className="flex">
        {post.ogImageUrl && (
          <div className="w-24 h-24 flex-shrink-0 bg-zinc-800">
            <img 
              src={post.ogImageUrl} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{PLATFORM_ICONS[post.sourcePlatform] || '🔗'}</span>
                <StatusBadge status={post.status} />
              </div>
              <h3 className="text-sm font-medium text-white line-clamp-1">
                {post.title || post.url}
              </h3>
              {post.ogDescription && (
                <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                  {post.ogDescription}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                data-testid={`link-external-${post.id}`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              {(post.status === 'pending' || post.status === 'needs_text' || post.status === 'error') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEnrich}
                  disabled={isEnriching}
                  className="h-8 w-8"
                  data-testid={`button-enrich-${post.id}`}
                >
                  {isEnriching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-zinc-500 hover:text-red-400"
                data-testid={`button-delete-${post.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {post.status === 'ready' && post.extracted && (
            <>
              <div className="flex flex-wrap gap-1 mt-2">
                {post.extracted.topics?.slice(0, 3).map((topic, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                    <Hash className="w-3 h-3 mr-1" />
                    {topic}
                  </Badge>
                ))}
                {post.extracted.hookType && (
                  <Badge variant="outline" className="text-xs border-purple-800/50 text-purple-400">
                    {post.extracted.hookType}
                  </Badge>
                )}
              </div>
              
              {/* Knowledge toggle - only show for posts with text */}
              {post.text && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
                  <Switch
                    checked={post.useAsKnowledge || false}
                    onCheckedChange={(checked) => onToggleKnowledge(checked)}
                    id={`knowledge-${post.id}`}
                    data-testid={`switch-knowledge-${post.id}`}
                  />
                  <label 
                    htmlFor={`knowledge-${post.id}`}
                    className="text-xs text-zinc-400 flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    Use as knowledge source
                  </label>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 p-0 h-auto"
                onClick={() => setShowDetails(!showDetails)}
                data-testid={`button-toggle-details-${post.id}`}
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </Button>
              
              {showDetails && (
                <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2 text-xs">
                  {post.extracted.proofPoints && post.extracted.proofPoints.length > 0 && (
                    <div>
                      <span className="text-zinc-500">Proof Points:</span>
                      <ul className="mt-1 space-y-1">
                        {post.extracted.proofPoints.map((proof, i) => (
                          <li key={i} className="text-zinc-400 pl-2 border-l border-zinc-700">
                            {proof}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {post.extracted.offers && post.extracted.offers.length > 0 && (
                    <div>
                      <span className="text-zinc-500">Offers/CTAs:</span>
                      <p className="text-zinc-400">{post.extracted.offers.join(', ')}</p>
                    </div>
                  )}
                  {post.extracted.intent && (
                    <div>
                      <span className="text-zinc-500">Intent:</span>
                      <span className="ml-2 text-zinc-400 capitalize">{post.extracted.intent}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {post.status === 'error' && post.errorMessage && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-3 h-3" />
              {post.errorMessage}
            </div>
          )}

          {post.status === 'needs_text' && (
            <div className="mt-2 text-xs text-yellow-400/80">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              Paste the post text to enable AI analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightsPanel({ insights }: { insights: InsightsData }) {
  if (insights.postCount === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
        <Lightbulb className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
        <p className="text-zinc-400">Add Hero Posts to unlock pattern insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-medium text-white">Summary</h3>
        </div>
        <p className="text-sm text-zinc-400">{insights.summary}</p>
        <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800">
          <div>
            <div className="text-2xl font-semibold text-white">{insights.postCount}</div>
            <div className="text-xs text-zinc-500">Total Posts</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-green-400">{insights.readyCount}</div>
            <div className="text-xs text-zinc-500">Analyzed</div>
          </div>
        </div>
      </div>

      {insights.topThemes.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Top Themes</h3>
          </div>
          <div className="space-y-2">
            {insights.topThemes.map((theme, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{theme.theme}</span>
                <span className="text-xs text-zinc-500">{theme.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.topHooks.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-medium text-white">Hook Types</h3>
          </div>
          <div className="space-y-2">
            {insights.topHooks.map((hook, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 capitalize">{hook.hookType.replace(/_/g, ' ')}</span>
                <span className="text-xs text-zinc-500">{hook.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.suggestions.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-medium text-white">Next Post Ideas</h3>
          </div>
          <div className="space-y-3">
            {insights.suggestions.slice(0, 3).map((suggestion, i) => (
              <div key={i} className="p-3 bg-zinc-800/50 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-1">{suggestion.title}</h4>
                <p className="text-xs text-zinc-400">{suggestion.hook}</p>
                <Badge variant="outline" className="mt-2 text-xs border-zinc-700 text-zinc-500">
                  {suggestion.theme}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AddPostModal({ 
  slug, 
  onSuccess 
}: { 
  slug: string; 
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [bulkUrls, setBulkUrls] = useState('');

  const createMutation = useMutation({
    mutationFn: async (data: { url: string; text?: string } | { urls: string[] }) => {
      const endpoint = 'urls' in data 
        ? `/api/orbit/${slug}/hero-posts/bulk` 
        : `/api/orbit/${slug}/hero-posts`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      setOpen(false);
      setUrl('');
      setText('');
      setBulkUrls('');
      onSuccess();
    },
  });

  const handleSubmit = () => {
    if (mode === 'single') {
      if (!url.trim()) return;
      createMutation.mutate({ url: url.trim(), text: text.trim() || undefined });
    } else {
      const urls = bulkUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
      if (urls.length === 0) return;
      createMutation.mutate({ urls });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-add-hero-post">
          <Plus className="w-4 h-4" />
          Add Hero Post
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Hero Posts</DialogTitle>
          <DialogDescription>
            Add your best-performing social media posts to analyze patterns
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'single' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('single')}
            data-testid="button-mode-single"
          >
            <Link2 className="w-4 h-4 mr-1" />
            Single URL
          </Button>
          <Button
            variant={mode === 'bulk' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('bulk')}
            data-testid="button-mode-bulk"
          >
            <FileText className="w-4 h-4 mr-1" />
            Bulk Add
          </Button>
        </div>

        {mode === 'single' ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Post URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linkedin.com/posts/..."
                className="bg-zinc-900 border-zinc-800"
                data-testid="input-post-url"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">
                Post Text <span className="text-zinc-600">(optional, helps AI analysis)</span>
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the post content here..."
                className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                data-testid="input-post-text"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">
              Post URLs <span className="text-zinc-600">(one per line, max 20)</span>
            </label>
            <Textarea
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder="https://linkedin.com/posts/example1&#10;https://twitter.com/user/status/123&#10;https://instagram.com/p/..."
              className="bg-zinc-900 border-zinc-800 min-h-[150px] font-mono text-sm"
              data-testid="input-bulk-urls"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel-add"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || (mode === 'single' ? !url.trim() : !bulkUrls.trim())}
            data-testid="button-submit-add"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Add {mode === 'single' ? 'Post' : 'Posts'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HeroPosts() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/orbit/:slug/hero-posts");
  const slug = params?.slug || '';
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['hero-posts', slug, statusFilter, platformFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (platformFilter !== 'all') params.set('platform', platformFilter);
      const res = await fetch(`/api/orbit/${slug}/hero-posts?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load');
      return res.json() as Promise<{ posts: HeroPost[] }>;
    },
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['hero-post-insights', slug],
    queryFn: async () => {
      const res = await fetch(`/api/orbit/${slug}/hero-posts/insights`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load');
      return res.json() as Promise<InsightsData>;
    },
  });

  const enrichMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/orbit/${slug}/hero-posts/${postId}/enrich`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to enrich');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-posts', slug] });
      queryClient.invalidateQueries({ queryKey: ['hero-post-insights', slug] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/orbit/${slug}/hero-posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-posts', slug] });
      queryClient.invalidateQueries({ queryKey: ['hero-post-insights', slug] });
    },
  });

  const toggleKnowledgeMutation = useMutation({
    mutationFn: async ({ postId, useAsKnowledge }: { postId: number; useAsKnowledge: boolean }) => {
      const res = await fetch(`/api/orbit/${slug}/hero-posts/${postId}/knowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ useAsKnowledge }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      return res.json();
    },
    onSuccess: (_, { useAsKnowledge }) => {
      queryClient.invalidateQueries({ queryKey: ['hero-posts', slug] });
      queryClient.invalidateQueries({ queryKey: ['orbit-strength', slug] });
      toast.success(useAsKnowledge ? 'Added as knowledge source' : 'Removed from knowledge sources');
    },
    onError: () => {
      toast.error('Failed to update knowledge setting');
    },
  });

  const posts = postsData?.posts || [];

  return (
    <div className="min-h-screen bg-black">
      <GlobalNav />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/orbit/${slug}/datahub`)}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-white">Hero Posts</h1>
            <p className="text-sm text-zinc-500">
              Analyze your best-performing posts to unlock content patterns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800" data-testid="select-status-filter">
                    <Filter className="w-4 h-4 mr-2 text-zinc-500" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="needs_text">Needs Text</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800" data-testid="select-platform-filter">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="x">X / Twitter</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>

                {(statusFilter !== 'all' || platformFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStatusFilter('all'); setPlatformFilter('all'); }}
                    className="text-zinc-500"
                    data-testid="button-clear-filters"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <AddPostModal 
                slug={slug} 
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['hero-posts', slug] });
                }} 
              />
            </div>

            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-12 text-center">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-lg font-medium text-white mb-2">No Hero Posts yet</h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Add your best-performing social media posts to discover patterns
                </p>
                <AddPostModal 
                  slug={slug} 
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['hero-posts', slug] });
                  }} 
                />
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <HeroPostCard
                    key={post.id}
                    post={post}
                    onEnrich={() => enrichMutation.mutate(post.id)}
                    onDelete={() => {
                      if (confirm('Delete this Hero Post?')) {
                        deleteMutation.mutate(post.id);
                      }
                    }}
                    onToggleKnowledge={(useAsKnowledge) => 
                      toggleKnowledgeMutation.mutate({ postId: post.id, useAsKnowledge })
                    }
                    isEnriching={enrichMutation.isPending && enrichMutation.variables === post.id}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Pattern Insights
              </h2>
              {insightsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : insights ? (
                <InsightsPanel insights={insights} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
