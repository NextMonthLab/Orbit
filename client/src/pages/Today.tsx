import Layout from "@/components/Layout";
import CardPlayer from "@/components/CardPlayer";
import { Button } from "@/components/ui/button";
import { Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppContext } from "@/lib/app-context";
import { useState, useMemo } from "react";

export default function Today() {
  const { universe } = useAppContext();
  const params = useParams<{ id?: string }>();
  const cardIdFromUrl = params.id ? parseInt(params.id) : null;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ["cards", universe?.id],
    queryFn: () => api.getCards(universe!.id),
    enabled: !!universe,
  });

  const availableCards = useMemo(() => {
    if (!cards) return [];
    const now = new Date();
    return cards
      .filter(c => c.status === 'published' && (!c.publishAt || new Date(c.publishAt) <= now))
      .sort((a, b) => a.dayIndex - b.dayIndex);
  }, [cards]);

  const cardIndex = useMemo(() => {
    if (selectedIndex !== null) return selectedIndex;
    if (cardIdFromUrl) {
      const idx = availableCards.findIndex(c => c.id === cardIdFromUrl);
      if (idx !== -1) return idx;
    }
    return availableCards.length > 0 ? availableCards.length - 1 : 0;
  }, [selectedIndex, cardIdFromUrl, availableCards]);

  const currentCard = availableCards[cardIndex];

  const { data: cardCharacters } = useQuery({
    queryKey: ["card-characters", currentCard?.id],
    queryFn: () => api.getCardCharacters(currentCard!.id),
    enabled: !!currentCard,
  });

  if (!universe || cardsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <h2 className="text-2xl font-display font-bold mb-4">No Cards Available</h2>
          <p className="text-muted-foreground">There are no story cards for this universe yet.</p>
        </div>
      </Layout>
    );
  }

  if (availableCards.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <h2 className="text-2xl font-display font-bold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground">The first story drop hasn't been released yet. Check back soon!</p>
        </div>
      </Layout>
    );
  }

  const card = currentCard;
  const hasPrev = cardIndex > 0;
  const hasNext = cardIndex < availableCards.length - 1;

  return (
    <Layout>
      <div className="p-4 pb-24 md:p-8 max-w-md mx-auto space-y-4 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Navigation */}
        {availableCards.length > 1 && (
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedIndex(cardIndex - 1)}
              disabled={!hasPrev}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              {cardIndex + 1} of {availableCards.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedIndex(cardIndex + 1)}
              disabled={!hasNext}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* The Card Player with two-phase experience */}
        <CardPlayer 
          card={{
            id: card.id.toString(),
            dayIndex: card.dayIndex,
            title: card.title,
            image: card.generatedImageUrl || card.imagePath || "",
            captions: card.captionsJson || [],
            sceneText: card.sceneText,
            recapText: card.recapText,
            publishDate: card.publishAt ? String(card.publishAt) : new Date().toISOString(),
          }} 
          characters={cardCharacters || []}
        />

        {/* Actions below card */}
        <div className="pt-2">
          <Button variant="outline" className="w-full gap-2 border-white/10 hover:bg-white/5" data-testid="button-save">
            <Download className="w-4 h-4" />
            Save Video Clip
          </Button>
        </div>

      </div>
    </Layout>
  );
}
