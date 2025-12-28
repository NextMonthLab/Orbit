import { OrbitBox } from "./OrbitBox";

interface OrbitBoxData {
  id: string;
  type: "page" | "service" | "faq" | "testimonial" | "blog" | "document" | "custom";
  title: string;
  summary: string;
  themes: string[];
}

interface OrbitGridProps {
  boxes: OrbitBoxData[];
  isUnclaimed?: boolean;
}

export function OrbitGrid({ boxes, isUnclaimed = false }: OrbitGridProps) {
  if (boxes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No content boxes available yet.</p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      data-testid="orbit-grid"
    >
      {boxes.map((box) => (
        <OrbitBox
          key={box.id}
          id={box.id}
          type={box.type}
          title={box.title}
          summary={box.summary}
          themes={box.themes}
          isUnclaimed={isUnclaimed}
        />
      ))}
    </div>
  );
}
