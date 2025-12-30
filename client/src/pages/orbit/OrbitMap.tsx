import { Map, Plus, Search, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrbitLayout from "@/components/OrbitLayout";

export default function OrbitMap() {
  return (
    <OrbitLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" data-testid="text-map-title">
              Knowledge Map
            </h1>
            <p className="text-white/60 text-sm">
              Visualize and manage your brand's knowledge graph
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-white/10 text-white/60" data-testid="button-zoom-out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-white/10 text-white/60" data-testid="button-zoom-in">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 gap-2" data-testid="button-add-node">
              <Plus className="w-4 h-4" />
              Add Node
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/20 rounded-xl bg-white/5">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
            <Map className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2" data-testid="text-empty-map">
            Your knowledge map is empty
          </h3>
          <p className="text-sm text-white/50 max-w-sm mb-6">
            Start building your brand's knowledge graph by adding nodes that represent key concepts, products, and information.
          </p>
          <Button className="bg-blue-500 hover:bg-blue-600 gap-2" data-testid="button-start-mapping">
            <Plus className="w-4 h-4" />
            Start Mapping
          </Button>
        </div>
      </div>
    </OrbitLayout>
  );
}
