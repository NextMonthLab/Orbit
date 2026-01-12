import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronRight, ExternalLink, Sparkles, Users, Package, BookOpen, HelpCircle, Compass, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Brand {
  id: number;
  name: string;
  initials: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  productCount: number;
  trustLevel: string;
}

interface Product {
  id: number;
  name: string;
  summary: string | null;
  status: string;
  category: string;
  manufacturerName: string | null;
  manufacturerInitials: string;
  referenceUrls: string[];
  intentTags: string[];
  specCount: number;
  primarySpec: { key: string; value: string } | null;
}

interface Tile {
  id: number;
  label: string;
  sublabel: string | null;
  intentTags: string[];
  priority: number;
}

interface Concept {
  id: number;
  label: string;
  whyItMatters: string | null;
  starterQuestions: string[];
}

interface Community {
  id: number;
  name: string;
  url: string;
  communityType: string;
  regionTags: string[];
}

interface IndustryFrontPage {
  orbitId: number;
  slug: string;
  type: 'industry';
  hero: {
    title: string;
    subtitle: string;
    entityCount: number;
    productCount: number;
    heroImageUrl?: string;
  };
  brands: {
    visible: boolean;
    count: number;
    items: Brand[];
  };
  featuredProducts: {
    visible: boolean;
    count: number;
    items: Product[];
  };
  latestTiles: {
    visible: boolean;
    count: number;
    items: Tile[];
  };
  startHere: {
    visible: boolean;
    count: number;
    items: Concept[];
  };
  communities: {
    visible: boolean;
    count: number;
    items: Community[];
  };
}

interface IndustryOrbitLandingProps {
  frontPage: IndustryFrontPage;
  onOpenChat: () => void;
  onExploreMap: () => void;
  onSelectBrand?: (brand: Brand) => void;
  onSelectProduct?: (product: Product) => void;
  className?: string;
}

const statusColors: Record<string, string> = {
  shipping: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  announced: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  rumored: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  discontinued: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const categoryColors: Record<string, string> = {
  consumer: "from-pink-500/20 to-rose-500/20",
  enterprise: "from-blue-500/20 to-indigo-500/20",
  developer: "from-green-500/20 to-emerald-500/20",
  medical: "from-cyan-500/20 to-teal-500/20",
};

function BrandCard({ brand, featured = false, onClick }: { brand: Brand; featured?: boolean; onClick?: () => void }) {
  const [imageError, setImageError] = useState(false);
  const hasImage = brand.logoUrl && !imageError;
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/10",
        featured 
          ? "border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10" 
          : "border-white/10 bg-white/5 hover:border-white/20",
        featured ? "min-h-[200px]" : "min-h-[120px]"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      data-testid={`brand-card-${brand.id}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className={cn("relative p-4 h-full flex flex-col", featured && "p-6")}>
        {hasImage ? (
          <div className={cn(
            "flex-1 flex items-center justify-center mb-3",
            featured ? "min-h-[80px]" : "min-h-[40px]"
          )}>
            <img 
              src={brand.logoUrl!}
              alt={`${brand.name} logo`}
              className={cn(
                "object-contain max-w-full",
                featured ? "max-h-[80px]" : "max-h-[40px]"
              )}
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className={cn(
            "flex-1 flex items-center justify-center mb-3",
            featured ? "min-h-[80px]" : "min-h-[40px]"
          )}>
            <div className={cn(
              "rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center font-bold text-white/80",
              featured ? "w-16 h-16 text-2xl" : "w-10 h-10 text-lg"
            )}>
              {brand.initials}
            </div>
          </div>
        )}
        
        <div className="text-left">
          <h3 className={cn(
            "font-semibold text-white truncate",
            featured ? "text-lg" : "text-sm"
          )}>
            {brand.name}
          </h3>
          <p className="text-xs text-white/50 mt-1">
            {brand.productCount} {brand.productCount === 1 ? 'product' : 'products'}
          </p>
        </div>
        
        {brand.trustLevel === 'official' && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
              Official
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick?: () => void }) {
  const statusClass = statusColors[product.status] || statusColors.shipping;
  const categoryGradient = categoryColors[product.category] || categoryColors.consumer;
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-300",
        "hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10 text-left",
        "bg-gradient-to-br", categoryGradient
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      data-testid={`product-card-${product.id}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base truncate">
              {product.name}
            </h3>
            <p className="text-sm text-white/50 mt-0.5">
              by {product.manufacturerName || 'Unknown'}
            </p>
          </div>
          <span className={cn(
            "shrink-0 text-xs px-2 py-1 rounded-full border capitalize",
            statusClass
          )}>
            {product.status}
          </span>
        </div>
        
        {product.summary && (
          <p className="text-sm text-white/70 line-clamp-2 mb-3">
            {product.summary}
          </p>
        )}
        
        {product.primarySpec && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="text-white/30">{product.primarySpec.key}:</span>
            <span className="text-white/70">{product.primarySpec.value}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-pink-400" />
          <span className="text-xs text-pink-400">Learn more</span>
        </div>
      </div>
    </motion.button>
  );
}

function ConceptCard({ concept }: { concept: Concept }) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 backdrop-blur-sm p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      data-testid={`concept-card-${concept.id}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-indigo-500/20">
          <BookOpen className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="font-semibold text-white text-sm">{concept.label}</h3>
      </div>
      
      {concept.whyItMatters && (
        <p className="text-xs text-white/60 mb-3 line-clamp-2">
          {concept.whyItMatters}
        </p>
      )}
      
      {concept.starterQuestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-white/40">Ask about:</p>
          <p className="text-xs text-pink-400/80 line-clamp-1">
            "{concept.starterQuestions[0]}"
          </p>
        </div>
      )}
    </motion.div>
  );
}

function CommunityCard({ community }: { community: Community }) {
  const typeIcons: Record<string, string> = {
    subreddit: '🔴',
    discord: '💬',
    forum: '📋',
    community_site: '🌐',
    event_series: '📅',
  };
  
  return (
    <motion.a
      href={community.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:border-white/20 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      data-testid={`community-card-${community.id}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{typeIcons[community.communityType] || '👥'}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm truncate">{community.name}</h3>
          <p className="text-xs text-white/50 capitalize">{community.communityType.replace('_', ' ')}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
      </div>
    </motion.a>
  );
}

export function IndustryOrbitLanding({ 
  frontPage, 
  onOpenChat, 
  onExploreMap,
  onSelectBrand,
  onSelectProduct,
  className 
}: IndustryOrbitLandingProps) {
  const { hero, brands, featuredProducts, startHere, communities } = frontPage;
  
  const featuredBrands = useMemo(() => {
    return brands.items.filter(b => b.logoUrl).slice(0, 6);
  }, [brands.items]);
  
  const otherBrands = useMemo(() => {
    return brands.items.filter(b => !b.logoUrl).slice(0, 6);
  }, [brands.items]);

  return (
    <div className={cn("min-h-screen bg-[#0a0a0f] text-white", className)}>
      {/* Hero Section - Cinematic */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Orbit badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-white/70">Industry Orbit</span>
            </motion.div>
            
            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                {hero.title}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-white/60 mb-4 max-w-2xl mx-auto">
              The living map of the companies, products, and ideas shaping wearable computing.
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-white/50 mb-10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{hero.entityCount} brands</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{hero.productCount} products</span>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onOpenChat}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 px-8 py-6 text-lg rounded-xl shadow-lg shadow-pink-500/25"
                data-testid="hero-chat-button"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Ask {hero.title}
              </Button>
              
              <Button
                onClick={onExploreMap}
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
                data-testid="hero-explore-button"
              >
                <Compass className="w-5 h-5 mr-2" />
                Explore the Map
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-5 h-5 text-white/30" />
        </motion.div>
      </section>

      {/* Featured Brands with Images */}
      {featuredBrands.length > 0 && (
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Featured Brands</h2>
                <p className="text-white/50 mt-1">Leading companies in smart glasses</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredBrands.map((brand, i) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <BrandCard 
                    brand={brand} 
                    featured={true}
                    onClick={() => onSelectBrand?.(brand)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Brands Grid */}
      {brands.items.length > 0 && (
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">All Brands</h2>
                <p className="text-white/50 mt-1">{brands.count} companies building the future</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {brands.items.map((brand, i) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BrandCard 
                    brand={brand}
                    featured={!!brand.logoUrl}
                    onClick={() => onSelectBrand?.(brand)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.visible && featuredProducts.items.length > 0 && (
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Products</h2>
                <p className="text-white/50 mt-1">Smart glasses and AR devices</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.items.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard 
                    product={product}
                    onClick={() => onSelectProduct?.(product)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Start Here - Concepts */}
      {startHere?.visible && startHere.items.length > 0 && (
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-indigo-500/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Start Here</h2>
                <p className="text-white/50 mt-1">Key concepts to understand</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {startHere.items.map((concept, i) => (
                <motion.div
                  key={concept.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ConceptCard concept={concept} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Communities */}
      {communities?.visible && communities.items.length > 0 && (
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Communities</h2>
                <p className="text-white/50 mt-1">Connect with enthusiasts</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.items.map((community, i) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CommunityCard community={community} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Explore CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-white/10"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to explore?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Dive into the interactive orbit map to discover connections between brands, products, and concepts.
            </p>
            <Button
              onClick={onExploreMap}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 px-8 py-6 text-lg rounded-xl shadow-lg shadow-pink-500/25"
              data-testid="explore-map-cta"
            >
              <Compass className="w-5 h-5 mr-2" />
              Open Intelligent Map
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
