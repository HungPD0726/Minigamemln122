import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MusicToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function MusicToggle({ enabled, onToggle }: MusicToggleProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        type="button"
        onClick={onToggle}
        variant="outline"
        className="h-11 rounded-full border-primary/60 bg-card/95 px-4 shadow-lg backdrop-blur"
      >
        {enabled ? (
          <>
            <Volume2 className="mr-2 h-4 w-4" />
            Tat nhac
          </>
        ) : (
          <>
            <VolumeX className="mr-2 h-4 w-4" />
            Bat nhac
          </>
        )}
      </Button>
    </div>
  );
}
