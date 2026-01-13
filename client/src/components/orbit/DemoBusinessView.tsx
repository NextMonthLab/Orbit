import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, MessageCircle, Package, HelpCircle, Users, Clock } from "lucide-react";

interface OrbitBox {
  id: number;
  boxType: string;
  title: string;
  description: string | null;
  category?: string | null;
}

interface DemoBusinessViewProps {
  businessName: string;
  businessSlug: string;
  boxes: OrbitBox[];
  documentCount: number;
}

interface DemoAnalytics {
  topCategories: { name: string; count: number }[];
  popularItems: { title: string; views: number }[];
  commonQuestions: { question: string; count: number }[];
  insights: string[];
}

function generateDemoAnalytics(boxes: OrbitBox[], slug: string): DemoAnalytics {
  const categories: Record<string, number> = {};
  const items: { title: string; views: number }[] = [];
  
  boxes.forEach(box => {
    if (box.category) {
      categories[box.category] = (categories[box.category] || 0) + 1;
    }
    if (box.boxType === 'menu_item' || box.boxType === 'product') {
      items.push({ title: box.title, views: Math.floor(Math.random() * 500) + 100 });
    }
  });

  const topCategories = Object.entries(categories)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const popularItems = items
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const questionsBySlug: Record<string, { question: string; count: number }[]> = {
    'slice-and-stone-pizza': [
      { question: "Do you deliver to my area?", count: 847 },
      { question: "What vegan options do you have?", count: 623 },
      { question: "What are your opening hours?", count: 512 },
      { question: "Can I customize my pizza?", count: 389 },
      { question: "My order is late, what do I do?", count: 234 },
    ],
    'clarity-chartered-accountants': [
      { question: "How much does it cost for a limited company?", count: 1203 },
      { question: "When is my tax return due?", count: 892 },
      { question: "Should I incorporate?", count: 756 },
      { question: "How do I switch accountants?", count: 534 },
      { question: "What's included in your packages?", count: 467 },
    ],
    'techvault-uk': [
      { question: "What's the difference between Good and Excellent?", count: 1567 },
      { question: "What's your returns policy?", count: 1234 },
      { question: "How long does battery last?", count: 987 },
      { question: "Do you offer finance?", count: 756 },
      { question: "Can I trade in my old phone?", count: 623 },
    ],
  };

  const insightsBySlug: Record<string, string[]> = {
    'slice-and-stone-pizza': [
      "Delivery zone questions are your #1 topic - consider adding a postcode checker",
      "Vegan options driving 15% of engagement - highlight in marketing",
      "Late delivery complaints spiked on Friday evenings - review driver capacity",
    ],
    'clarity-chartered-accountants': [
      "Pricing transparency is working - 73% of visitors check packages first",
      "IR35 content getting high engagement from contractor segment",
      "Most leads come after deadline reminder questions",
    ],
    'techvault-uk': [
      "Grade comparison is top content - buyers want confidence in condition",
      "iPhone comparisons drive 3x more conversions than Samsung",
      "Battery health questions correlate with Grade B purchases",
    ],
  };

  return {
    topCategories,
    popularItems,
    commonQuestions: questionsBySlug[slug] || [],
    insights: insightsBySlug[slug] || [],
  };
}

export function DemoBusinessView({ businessName, businessSlug, boxes, documentCount }: DemoBusinessViewProps) {
  const analytics = generateDemoAnalytics(boxes, businessSlug);
  const faqCount = boxes.filter(b => b.boxType === 'faq').length;
  const productCount = boxes.filter(b => b.boxType === 'menu_item' || b.boxType === 'product').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Briefcase className="w-3 h-3 mr-1" />
            Business View
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {businessName} Dashboard
          </h1>
          <p className="text-zinc-400">
            How Orbit understands your business and what customers are asking
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white">{boxes.length}</div>
              <div className="text-sm text-zinc-400">Knowledge Nodes</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white">{documentCount}</div>
              <div className="text-sm text-zinc-400">Documents</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white">{productCount}</div>
              <div className="text-sm text-zinc-400">Products/Items</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-white">{faqCount}</div>
              <div className="text-sm text-zinc-400">FAQs Ready</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Top Customer Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {analytics.commonQuestions.map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                      <span className="text-sm text-zinc-300 flex-1">{q.question}</span>
                      <Badge variant="secondary" className="ml-2 bg-zinc-700 text-zinc-300">
                        {q.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Popular Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {analytics.popularItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                      <span className="text-sm text-zinc-300 flex-1 truncate">{item.title}</span>
                      <Badge variant="secondary" className="ml-2 bg-zinc-700 text-zinc-300">
                        {item.views} views
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              Orbit Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Package className="w-5 h-5 text-orange-400" />
              Knowledge Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.topCategories.map((cat, i) => (
                <Badge 
                  key={i} 
                  className="bg-zinc-800 text-zinc-300 border-zinc-700 px-3 py-1"
                >
                  {cat.name} ({cat.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-6">
          <p className="text-sm text-zinc-500">
            This is a read-only demo view showing sample analytics data
          </p>
        </div>
      </div>
    </div>
  );
}
