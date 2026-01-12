import { Building2, ExternalLink, Shield, Eye } from "lucide-react";
import type { FrontPageBrand, FrontPageSection } from "@/lib/types/industryOrbitFrontPage";

interface BrandsGridProps {
  brands: FrontPageSection<FrontPageBrand>;
}

export function BrandsGrid({ brands }: BrandsGridProps) {
  if (!brands.visible || brands.count === 0) return null;

  return (
    <section className="py-12 px-4 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">
            Brands in this space
          </h2>
          <span className="text-sm text-zinc-500">({brands.count})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {brands.items.map((brand) => (
            <div
              key={brand.id}
              className="group relative p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/30 transition-colors"
              data-testid={`brand-card-${brand.id}`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-12 h-12 rounded-lg object-contain bg-white/5"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-white/80">
                      {brand.initials}
                    </span>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-white text-sm truncate max-w-full">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {brand.productCount} product{brand.productCount !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {brand.trustLevel === 'official' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <Shield className="w-3 h-3" />
                      Official
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                      <Eye className="w-3 h-3" />
                      Independent
                    </span>
                  )}
                </div>
              </div>

              {brand.websiteUrl && (
                <a
                  href={brand.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-opacity"
                  data-testid={`brand-link-${brand.id}`}
                >
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
