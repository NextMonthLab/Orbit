import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_CARDS, MOCK_UNIVERSE } from "@/lib/mockData";
import { BarChart3, Calendar, Plus, Users, Video, Upload, ChevronDown, PenSquare } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Admin() {
  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-display font-bold tracking-tight">Showrunner Dashboard</h1>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent font-normal text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                <span className="uppercase tracking-widest text-xs">Universe:</span>
                                <span className="font-bold text-foreground">{MOCK_UNIVERSE.name}</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Active Universe</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer font-bold bg-accent/50">
                                Neon Rain
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                Create New Universe...
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Season 1</span>
                </div>
            </div>

            <div className="flex gap-2">
                <Link href="/admin/create">
                    <Button className="gap-2" variant="outline">
                        <Plus className="w-4 h-4" /> Create Card
                    </Button>
                </Link>
                <Link href="/admin/import">
                    <Button className="gap-2 bg-white text-black hover:bg-white/90">
                        <Upload className="w-4 h-4" /> Import Season Pack
                    </Button>
                </Link>
            </div>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-center justify-between text-sm text-primary/80">
            <p>💡 <strong>Tip:</strong> Manual is best for editing one card. Import is best for uploading an entire season.</p>
             <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 hover:text-primary hover:bg-primary/10">
                <PenSquare className="w-3 h-3" /> Edit Universe Details
             </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,204</div>
                    <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Card Views</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">3,892</div>
                </CardContent>
            </Card>
        </div>

        {/* Content Calendar */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Scheduled Drops
                </h3>
            </div>
            <div className="divide-y divide-border">
                {MOCK_CARDS.map((card) => (
                    <div key={card.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                                <img src={card.image} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-bold">Day {card.dayIndex}: {card.title}</p>
                                <p className="text-xs text-muted-foreground">Scheduled: {new Date(card.publishDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="px-2 py-1 text-xs bg-green-500/10 text-green-500 rounded border border-green-500/20">Published</span>
                             <Button variant="outline" size="sm" className="h-8">Edit</Button>
                        </div>
                    </div>
                ))}
                {/* Mock Future Slots */}
                 <div className="p-4 flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded border border-dashed border-white/20 flex items-center justify-center text-xs">
                                +
                            </div>
                            <div>
                                <p className="font-bold">Day 4: Empty Slot</p>
                                <p className="text-xs text-muted-foreground">Scheduled: Oct 27, 2023</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                             <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20">Draft</span>
                             <Button variant="outline" size="sm" className="h-8">Edit</Button>
                        </div>
                 </div>
            </div>
        </div>

      </div>
    </Layout>
  );
}
