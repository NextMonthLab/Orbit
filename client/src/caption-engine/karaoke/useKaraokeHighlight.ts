import { useMemo } from "react";
import type { TimedWord } from "../grouping/types";
import type { WordHighlightState, KaraokeState } from "./types";

export interface UseKaraokeHighlightProps {
  words: TimedWord[];
  currentTimeMs: number;
  transitionMs?: number;
}

export function useKaraokeHighlight({
  words,
  currentTimeMs,
  transitionMs = 80,
}: UseKaraokeHighlightProps): KaraokeState {
  return useMemo(() => {
    if (words.length === 0) {
      return {
        activeWordIndex: -1,
        wordProgress: 0,
        highlightedWords: [],
      };
    }
    
    let activeWordIndex = -1;
    let wordProgress = 0;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (currentTimeMs >= word.startMs && currentTimeMs <= word.endMs) {
        activeWordIndex = i;
        const wordDuration = word.endMs - word.startMs;
        wordProgress = wordDuration > 0 
          ? (currentTimeMs - word.startMs) / wordDuration 
          : 1;
        break;
      }
    }
    
    if (activeWordIndex === -1) {
      for (let i = 0; i < words.length; i++) {
        if (currentTimeMs < words[i].startMs) {
          activeWordIndex = i > 0 ? i - 1 : -1;
          break;
        }
      }
      if (activeWordIndex === -1 && words.length > 0 && currentTimeMs >= words[words.length - 1].endMs) {
        activeWordIndex = words.length - 1;
        wordProgress = 1;
      }
    }
    
    const highlightedWords: WordHighlightState[] = words.map((word, index) => {
      const isPast = currentTimeMs > word.endMs;
      const isActive = index === activeWordIndex && currentTimeMs >= word.startMs && currentTimeMs <= word.endMs;
      
      let progress = 0;
      if (isPast) {
        progress = 1;
      } else if (isActive) {
        const wordDuration = word.endMs - word.startMs;
        progress = wordDuration > 0 
          ? (currentTimeMs - word.startMs) / wordDuration 
          : 1;
      } else if (currentTimeMs > word.startMs - transitionMs && currentTimeMs < word.startMs) {
        progress = (currentTimeMs - (word.startMs - transitionMs)) / transitionMs;
      }
      
      return {
        wordIndex: index,
        progress: Math.max(0, Math.min(1, progress)),
        isActive,
        isPast,
      };
    });
    
    return {
      activeWordIndex,
      wordProgress,
      highlightedWords,
    };
  }, [words, currentTimeMs, transitionMs]);
}

export function getWordHighlightAtTime(
  words: TimedWord[],
  currentTimeMs: number
): { activeIndex: number; progress: number } {
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (currentTimeMs >= word.startMs && currentTimeMs <= word.endMs) {
      const wordDuration = word.endMs - word.startMs;
      const progress = wordDuration > 0 
        ? (currentTimeMs - word.startMs) / wordDuration 
        : 1;
      return { activeIndex: i, progress };
    }
  }
  
  for (let i = 0; i < words.length; i++) {
    if (currentTimeMs < words[i].startMs) {
      return { activeIndex: i > 0 ? i - 1 : -1, progress: 1 };
    }
  }
  
  return { activeIndex: words.length - 1, progress: 1 };
}
