import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Focus, 
  Send, 
  ChevronDown,
  AlertCircle,
  Check,
  X,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { ScopedConversation, ScopedMessage, NodeRefinement } from '@shared/schema';

interface TileInfo {
  id: number | string;
  label?: string;
  name?: string;
  title?: string;
}

interface ScopedRefinementPaneProps {
  tile: TileInfo | null;
  orbitSlug: string;
  isOwnerMode: boolean;
  onClose?: () => void;
  className?: string;
}

function getTileLabel(tile: TileInfo): string {
  return tile.label || tile.name || tile.title || 'Unknown';
}

export function ScopedRefinementPane({ 
  tile, 
  orbitSlug, 
  isOwnerMode, 
  onClose,
  className 
}: ScopedRefinementPaneProps) {
  const [conversation, setConversation] = useState<ScopedConversation | null>(null);
  const [messages, setMessages] = useState<ScopedMessage[]>([]);
  const [refinements, setRefinements] = useState<NodeRefinement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [scopeWarning, setScopeWarning] = useState<string | null>(null);
  const [pendingRefinementId, setPendingRefinementId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const nodeLabel = tile ? getTileLabel(tile) : '';
  const nodeId = tile?.id ? String(tile.id) : '';

  useEffect(() => {
    if (!tile?.id || !isOwnerMode) {
      setConversation(null);
      setMessages([]);
      setRefinements([]);
      return;
    }

    const fetchConversation = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/orbit/${orbitSlug}/scoped/${encodeURIComponent(nodeId)}?nodeLabel=${encodeURIComponent(nodeLabel)}`,
          { credentials: 'include' }
        );
        if (response.ok) {
          const data = await response.json();
          setConversation(data.conversation);
          setMessages(data.messages || []);
          setRefinements(data.refinements || []);
        }
      } catch (error) {
        console.error('Failed to fetch scoped conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [tile?.id, orbitSlug, isOwnerMode, nodeId, nodeLabel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !conversation || isSending) return;

    const message = inputValue.trim();
    setInputValue('');
    setIsSending(true);
    setScopeWarning(null);

    const optimisticMessage: ScopedMessage = {
      id: Date.now(),
      conversationId: conversation.id,
      role: 'owner',
      content: message,
      messageType: 'chat',
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await apiRequest(
        'POST',
        `/api/orbit/${orbitSlug}/scoped/${conversation.id}/message`,
        { content: message }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== optimisticMessage.id);
          return [...filtered, data.ownerMessage, data.orbitMessage];
        });

        if (data.scopeWarning && data.refinement) {
          setScopeWarning(data.scopeWarning);
          setPendingRefinementId(data.refinement.id);
        }

        if (data.refinement) {
          setRefinements(prev => [...prev, data.refinement]);
        }
      } else {
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        toast({
          title: "Failed to send message",
          description: "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      console.error('Error sending scoped message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleScopeChoice = async (scope: 'local' | 'similar_nodes') => {
    if (!pendingRefinementId) {
      setScopeWarning(null);
      return;
    }

    try {
      const response = await apiRequest(
        'PATCH',
        `/api/orbit/${orbitSlug}/refinements/${pendingRefinementId}`,
        { 
          scope,
          status: 'confirmed'
        }
      );

      if (response.ok) {
        const { refinement: updatedRefinement } = await response.json();
        setRefinements(prev => 
          prev.map(r => r.id === pendingRefinementId ? updatedRefinement : r)
        );
        toast({
          title: scope === 'local' ? "Applied locally" : "Applied to similar areas",
          description: `Your refinement has been ${scope === 'local' ? 'applied only to this area' : 'applied across similar areas'}.`
        });
      } else {
        toast({
          title: "Failed to apply scope",
          description: "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error confirming scope:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setScopeWarning(null);
      setPendingRefinementId(null);
    }
  };

  if (!tile) {
    return null;
  }

  if (!isOwnerMode) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-col bg-background border-l border-border",
      className
    )}>
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Focus className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Refining: {nodeLabel}</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-scoped-pane"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="p-3 bg-muted/20 border-b border-border">
        <p className="text-xs text-muted-foreground">
          We're focusing on <span className="font-medium text-foreground">"{nodeLabel}"</span> right now. 
          This conversation only affects this area unless you tell me otherwise.
        </p>
      </div>

      {isLoading ? (
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-2/3 ml-auto" />
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start refining this area</p>
                  <p className="text-xs mt-1">
                    Ask how I understand it, or tell me how to adjust
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === 'owner' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      msg.role === 'owner' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}
                  >
                    {msg.content}
                    {msg.messageType === 'refinement' && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Refinement
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {scopeWarning && (
            <div className="p-3 bg-amber-500/10 border-t border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-amber-700 dark:text-amber-300">{scopeWarning}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScopeChoice('local')}
                      data-testid="button-scope-local"
                    >
                      Just this area
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleScopeChoice('similar_nodes')}
                      data-testid="button-scope-similar"
                    >
                      Similar areas too
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {refinements.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                data-testid="button-show-refinements"
              >
                <ChevronDown className="w-3 h-3" />
                {refinements.length} refinement{refinements.length !== 1 ? 's' : ''} made
              </button>
            </div>
          )}

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Refine "${nodeLabel}"...`}
                className="resize-none text-sm min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                data-testid="input-scoped-message"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isSending}
                size="icon"
                className="shrink-0"
                data-testid="button-send-scoped"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Try: "How do you describe this?" or "Make this feel more premium"
            </p>
          </div>
        </>
      )}
    </div>
  );
}
