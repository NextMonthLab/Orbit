import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_CARDS } from "@/lib/mockData";
import { BarChart3, Calendar, Plus, Users, Video } from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
        
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold">Showrunner Dashboard</h1>
            <Link href="/admin/create">
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> New Card
                </Button>
            </Link>
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
