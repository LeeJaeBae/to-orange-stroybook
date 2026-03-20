import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Loader2 className="animate-spin text-orange-400" size={32} />
    </div>
  );
}
