import { Package, ExternalLink, Sparkles, Cpu } from "lucide-react";
import type { FrontPageProduct, FrontPageSection } from "@/lib/types/industryOrbitFrontPage";

interface FeaturedProductsGridProps {
  products: FrontPageSection<FrontPageProduct>;
}

const statusColors: Record<string, string> = {
  shipping: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  announced: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  rumored: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  discontinued: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
};

const categoryLabels: Record<string, string> = {
  consumer: "Consumer",
  enterprise: "Enterprise",
  developer: "Developer",
};

export function FeaturedProductsGrid({ products }: FeaturedProductsGridProps) {
  if (!products.visible || products.count === 0) return null;

  return (
    <section className="py-12 px-4 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-5 h-5 text-pink-400" />
          <h2 className="text-xl font-semibold text-white">Featured Products</h2>
          <span className="text-sm text-zinc-500">({products.count})</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.items.map((product) => (
            <div
              key={product.id}
              className="group relative p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-pink-500/30 transition-colors"
              data-testid={`product-card-${product.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    by {product.manufacturerName}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-xs font-bold text-white/80">
                    {product.manufacturerInitials}
                  </span>
                </div>
              </div>

              {product.summary && (
                <p className="text-sm text-zinc-300 mb-3 line-clamp-2">
                  {product.summary}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    statusColors[product.status] || statusColors.announced
                  }`}
                >
                  {product.status}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-zinc-400 bg-zinc-800 border border-zinc-700">
                  {categoryLabels[product.category] || product.category}
                </span>
              </div>

              {product.primarySpec && (
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-zinc-300">{product.primarySpec.key}:</span>
                  <span>{product.primarySpec.value}</span>
                </div>
              )}

              {product.specCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-zinc-500 mb-3">
                  <Sparkles className="w-3 h-3" />
                  <span>{product.specCount} spec{product.specCount !== 1 ? 's' : ''} documented</span>
                </div>
              )}

              {product.intentTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {product.intentTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {product.referenceUrls.length > 0 && (
                <a
                  href={product.referenceUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-opacity"
                  data-testid={`product-link-${product.id}`}
                >
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
