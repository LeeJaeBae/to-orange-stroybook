interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <div className="px-5 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="flex-shrink-0 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-2xl text-sm text-foreground transition-colors border border-border/50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
