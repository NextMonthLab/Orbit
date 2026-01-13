import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Database, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  FileText,
  Package,
  HelpCircle,
  Users,
  Sparkles,
  Lightbulb
} from "lucide-react";

interface OrbitBox {
  id: number;
  boxType: string;
  title: string;
  description: string | null;
  category?: string | null;
}

interface OrbitDocument {
  id: number;
  title: string;
  category: string;
  status: string;
}

interface DemoIntelligenceViewProps {
  businessName: string;
  businessSlug: string;
  boxes: OrbitBox[];
  documents: OrbitDocument[];
  lastUpdated?: string;
}

interface KnowledgeArea {
  name: string;
  type: string;
  count: number;
  coverage: number;
  icon: typeof Package;
}

interface Gap {
  area: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

function analyzeKnowledge(boxes: OrbitBox[], documents: OrbitDocument[]): {
  areas: KnowledgeArea[];
  groundingSources: { type: string; count: number }[];
  gaps: Gap[];
  overallCoverage: number;
} {
  const boxTypes: Record<string, { count: number; icon: typeof Package }> = {};
  
  boxes.forEach(box => {
    if (!boxTypes[box.boxType]) {
      boxTypes[box.boxType] = { count: 0, icon: Package };
    }
    boxTypes[box.boxType].count++;
  });

  const typeIcons: Record<string, typeof Package> = {
    'menu_item': Package,
    'product': Package,
    'faq': HelpCircle,
    'team_member': Users,
    'business_profile': Database,
    'contact': Users,
    'opening_hours': Clock,
  };

  const typeLabels: Record<string, string> = {
    'menu_item': 'Menu Items',
    'product': 'Products',
    'faq': 'FAQ Entries',
    'team_member': 'Team Members',
    'business_profile': 'Business Info',
    'contact': 'Contact Details',
    'opening_hours': 'Operating Hours',
  };

  const areas: KnowledgeArea[] = Object.entries(boxTypes).map(([type, data]) => ({
    name: typeLabels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type,
    count: data.count,
    coverage: Math.min(100, data.count * 10 + 50),
    icon: typeIcons[type] || Package,
  }));

  const groundingSources = [
    { type: 'Knowledge Boxes', count: boxes.length },
    { type: 'Documents', count: documents.length },
    { type: 'FAQ Entries', count: boxes.filter(b => b.boxType === 'faq').length },
    { type: 'Product Data', count: boxes.filter(b => b.boxType === 'product' || b.boxType === 'menu_item').length },
  ];

  const overallCoverage = Math.min(95, 60 + boxes.length * 0.5 + documents.length * 3);

  return { areas, groundingSources, gaps: [], overallCoverage };
}

function getGapsForSlug(slug: string): Gap[] {
  const gapsBySlug: Record<string, Gap[]> = {
    'slice-and-stone-pizza': [
      { area: 'Parking Information', description: 'Customers ask about parking but no information is available', priority: 'medium' },
      { area: 'Group Booking Process', description: 'Large party reservations process not documented', priority: 'low' },
      { area: 'Loyalty Program', description: 'No information about repeat customer rewards', priority: 'low' },
    ],
    'clarity-chartered-accountants': [
      { area: 'Cryptocurrency Tax', description: 'Growing area with no documented guidance', priority: 'high' },
      { area: 'International Clients', description: 'No information for non-UK resident clients', priority: 'medium' },
      { area: 'Emergency Tax Advice', description: 'Out-of-hours support not documented', priority: 'low' },
    ],
    'techvault-uk': [
      { area: 'Repair Services', description: 'Customers asking about screen repairs - not offered', priority: 'medium' },
      { area: 'Business Bulk Orders', description: 'B2B purchasing process not documented', priority: 'high' },
      { area: 'International Shipping', description: 'EU delivery available but details sparse', priority: 'medium' },
    ],
  };

  return gapsBySlug[slug] || [];
}

export function DemoIntelligenceView({ 
  businessName, 
  businessSlug, 
  boxes, 
  documents,
  lastUpdated 
}: DemoIntelligenceViewProps) {
  const analysis = analyzeKnowledge(boxes, documents);
  const gaps = getGapsForSlug(businessSlug);
  
  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Brain className="w-3 h-3 mr-1" />
            Orbit Intelligence
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Inside {businessName}'s Orbit
          </h1>
          <p className="text-zinc-400">
            The knowledge engine powering this conversational experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(analysis.overallCoverage)}%</div>
                  <div className="text-sm text-zinc-400">Knowledge Coverage</div>
                </div>
              </div>
              <Progress value={analysis.overallCoverage} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{boxes.length + documents.length}</div>
                  <div className="text-sm text-zinc-400">Grounding Sources</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-zinc-800">{boxes.length} nodes</Badge>
                <Badge variant="secondary" className="bg-zinc-800">{documents.length} docs</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Fresh</div>
                  <div className="text-sm text-zinc-400">Data Status</div>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Last updated: {lastUpdated || 'Recently'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Knowledge Areas
              </CardTitle>
              <CardDescription>What the assistant knows about</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-3">
                  {analysis.areas.map((area, i) => {
                    const Icon = area.icon;
                    return (
                      <div key={i} className="p-3 rounded-lg bg-zinc-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-zinc-400" />
                            <span className="text-sm font-medium text-white">{area.name}</span>
                          </div>
                          <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                            {area.count}
                          </Badge>
                        </div>
                        <Progress value={area.coverage} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-green-400" />
                Grounding Integrity
              </CardTitle>
              <CardDescription>Sources the assistant can cite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.groundingSources.map((source, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-zinc-300">{source.type}</span>
                    </div>
                    <span className="text-lg font-semibold text-white">{source.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>All responses grounded in verified data</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Gaps & Opportunities
            </CardTitle>
            <CardDescription>Areas where knowledge could be improved</CardDescription>
          </CardHeader>
          <CardContent>
            {gaps.length > 0 ? (
              <div className="space-y-3">
                {gaps.map((gap, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      gap.priority === 'high' ? 'text-red-400' :
                      gap.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{gap.area}</span>
                        <Badge className={priorityColors[gap.priority]}>
                          {gap.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400">{gap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p>No significant knowledge gaps detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-blue-400" />
              Knowledge Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {documents.map((doc, i) => (
                <div key={i} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-zinc-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">{doc.title}</p>
                      <p className="text-xs text-zinc-500 capitalize">{doc.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-6">
          <p className="text-sm text-zinc-500">
            This is a read-only intelligence view showing the Orbit's knowledge structure
          </p>
        </div>
      </div>
    </div>
  );
}
