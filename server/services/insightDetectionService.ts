import { storage } from '../storage';
import type { InsertOrbitInsight, InsertOrbitSuggestion, InsightType, SuggestionType, OrbitMessage } from '@shared/schema';

interface PatternEvidence {
  type: string;
  data: any;
}

interface DetectedPattern {
  insightType: InsightType;
  title: string;
  description: string;
  evidence: PatternEvidence[];
  confidence: 'low' | 'medium' | 'high';
  relatedNodeIdentifiers?: string[];
  suggestion?: {
    type: SuggestionType;
    title: string;
    description: string;
    actionPrompt?: string;
  };
}

export async function analyzeConversationPatterns(businessSlug: string): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];
  
  try {
    const orbitMeta = await storage.getOrbitMeta(businessSlug);
    if (!orbitMeta) return patterns;

    const conversations = await storage.getOrbitConversations(businessSlug, 30);
    if (conversations.length < 5) return patterns;

    const messages = await Promise.all(
      conversations.slice(0, 20).map(c => storage.getOrbitMessages(c.id))
    );

    const allUserMessages: OrbitMessage[] = messages.flat().filter((m: OrbitMessage) => m.role === 'user');
    if (allUserMessages.length < 10) return patterns;

    const topicCounts: Record<string, number> = {};
    const questionPatterns: string[] = [];

    for (const msg of allUserMessages) {
      const content = msg.content.toLowerCase();
      
      if (content.includes('?') || content.startsWith('how') || content.startsWith('what') || 
          content.startsWith('when') || content.startsWith('where') || content.startsWith('why')) {
        questionPatterns.push(msg.content);
      }

      const topics = ['pricing', 'cost', 'price', 'availability', 'shipping', 'delivery', 
                      'warranty', 'support', 'contact', 'hours', 'location', 'returns'];
      for (const topic of topics) {
        if (content.includes(topic)) {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      }
    }

    for (const [topic, count] of Object.entries(topicCounts)) {
      if (count >= 3) {
        const percentage = Math.round((count / allUserMessages.length) * 100);
        patterns.push({
          insightType: 'pattern',
          title: `Frequent questions about ${topic}`,
          description: `${percentage}% of recent conversations mention "${topic}". This topic is getting significant attention from visitors.`,
          evidence: [{ type: 'message_count', data: { topic, count, total: allUserMessages.length } }],
          confidence: count >= 5 ? 'high' : 'medium',
          suggestion: {
            type: 'add_content',
            title: `Address ${topic} more prominently`,
            description: `Many visitors are asking about ${topic}. Would you like to make this information more visible?`,
            actionPrompt: `Help me address visitor questions about ${topic}`
          }
        });
      }
    }

    return patterns;
  } catch (error) {
    console.error('[insight-detection] Error analyzing conversation patterns:', error);
    return patterns;
  }
}

export async function analyzeEngagementPatterns(businessSlug: string): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];
  
  try {
    const analytics = await storage.getOrbitAnalytics(businessSlug, 30);
    if (!analytics || analytics.length < 7) return patterns;

    const totalVisits = analytics.reduce((sum, d) => sum + (d.visits || 0), 0);
    const totalConversations = analytics.reduce((sum, d) => sum + (d.conversations || 0), 0);
    
    if (totalVisits > 100 && totalConversations < 5) {
      patterns.push({
        insightType: 'engagement',
        title: 'High traffic but low conversation rate',
        description: `Your orbit has received ${totalVisits} visits but only ${totalConversations} conversations in the last 30 days. Visitors may not be finding what they need.`,
        evidence: [{ type: 'engagement_ratio', data: { visits: totalVisits, conversations: totalConversations } }],
        confidence: 'high',
        suggestion: {
          type: 'clarify',
          title: 'Review entry points',
          description: 'Consider whether your initial messaging encourages conversation.',
          actionPrompt: 'Help me understand why visitors might not be engaging'
        }
      });
    }

    return patterns;
  } catch (error) {
    console.error('[insight-detection] Error analyzing engagement patterns:', error);
    return patterns;
  }
}

export async function analyzeNodeRelationships(businessSlug: string): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];
  
  try {
    const orbitMeta = await storage.getOrbitMeta(businessSlug);
    if (!orbitMeta) return patterns;
    
    const topicTiles = await storage.getTopicTilesByOrbit(orbitMeta.id);
    if (!topicTiles || topicTiles.length < 3) return patterns;

    const tilesWithLowRelevance = topicTiles.filter((t: any) => (t.relevanceScore || 50) < 30);
    const tilesWithHighRelevance = topicTiles.filter((t: any) => (t.relevanceScore || 50) > 80);

    if (tilesWithLowRelevance.length > 0 && tilesWithHighRelevance.length > 0) {
      const lowNames = tilesWithLowRelevance.slice(0, 3).map((t: any) => t.topicTitle).join(', ');
      const highNames = tilesWithHighRelevance.slice(0, 3).map((t: any) => t.topicTitle).join(', ');
      
      patterns.push({
        insightType: 'alignment',
        title: 'Imbalanced topic emphasis',
        description: `Some topics like "${highNames}" are getting much more attention than others like "${lowNames}". This might be intentional, or it could indicate a gap.`,
        evidence: [{ 
          type: 'relevance_distribution', 
          data: { 
            lowRelevance: tilesWithLowRelevance.map((t: any) => ({ title: t.topicTitle, score: t.relevanceScore })),
            highRelevance: tilesWithHighRelevance.map((t: any) => ({ title: t.topicTitle, score: t.relevanceScore }))
          }
        }],
        confidence: 'medium',
        relatedNodeIdentifiers: [...tilesWithLowRelevance.map((t: any) => `topic:${t.id}`), ...tilesWithHighRelevance.map((t: any) => `topic:${t.id}`)],
        suggestion: {
          type: 'adjust_emphasis',
          title: 'Review topic balance',
          description: 'Would you like to adjust which topics Orbit emphasizes?',
          actionPrompt: 'Help me review the balance of topics in my orbit'
        }
      });
    }

    return patterns;
  } catch (error) {
    console.error('[insight-detection] Error analyzing node relationships:', error);
    return patterns;
  }
}

export async function generateInsightsForOrbit(businessSlug: string): Promise<void> {
  console.log(`[insight-detection] Generating insights for ${businessSlug}`);
  
  try {
    const [conversationPatterns, engagementPatterns, nodePatterns] = await Promise.all([
      analyzeConversationPatterns(businessSlug),
      analyzeEngagementPatterns(businessSlug),
      analyzeNodeRelationships(businessSlug)
    ]);

    const allPatterns = [...conversationPatterns, ...engagementPatterns, ...nodePatterns]
      .filter(p => p.confidence === 'high' || p.confidence === 'medium');

    const existingInsights = await storage.getOrbitInsights(businessSlug);
    const existingTitles = new Set(existingInsights.map(i => i.title));

    for (const pattern of allPatterns) {
      if (existingTitles.has(pattern.title)) continue;

      const insightData: InsertOrbitInsight = {
        businessSlug,
        insightType: pattern.insightType,
        confidence: pattern.confidence,
        title: pattern.title,
        description: pattern.description,
        evidence: pattern.evidence,
        relatedNodeIdentifiers: pattern.relatedNodeIdentifiers,
        status: 'active',
      };

      const insight = await storage.createOrbitInsight(insightData);
      console.log(`[insight-detection] Created insight: ${pattern.title}`);

      if (pattern.suggestion) {
        const suggestionData: InsertOrbitSuggestion = {
          businessSlug,
          insightId: insight.id,
          suggestionType: pattern.suggestion.type,
          priority: pattern.confidence === 'high' ? 'high' : 'medium',
          title: pattern.suggestion.title,
          description: pattern.suggestion.description,
          actionPrompt: pattern.suggestion.actionPrompt,
          status: 'pending',
        };

        await storage.createOrbitSuggestion(suggestionData);
        console.log(`[insight-detection] Created suggestion: ${pattern.suggestion.title}`);
      }
    }

    console.log(`[insight-detection] Completed insight generation for ${businessSlug}: ${allPatterns.length} patterns found`);
  } catch (error) {
    console.error('[insight-detection] Error generating insights:', error);
  }
}

export async function getInsightsOnRequest(businessSlug: string): Promise<{ insights: any[]; suggestions: any[] }> {
  try {
    const insights = await storage.getHighConfidenceInsights(businessSlug);
    const suggestions = await storage.getPendingOrbitSuggestions(businessSlug);
    
    const filteredSuggestions = suggestions.filter(s => s.repeatCount < 3);
    
    for (const suggestion of filteredSuggestions) {
      await storage.updateOrbitSuggestion(suggestion.id, {
        status: 'shown',
        shownAt: new Date(),
      });
    }

    return { insights, suggestions: filteredSuggestions };
  } catch (error) {
    console.error('[insight-detection] Error getting insights on request:', error);
    return { insights: [], suggestions: [] };
  }
}
