import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: {
    id: string;
    text?: string;
    imagePayload?: Uint8Array;
    timestamp: number;
    isSelf: boolean;
  };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { text, imagePayload, timestamp, isSelf } = message;
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (imagePayload) {
      const blob = new Blob([new Uint8Array(imagePayload)], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [imagePayload]);

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isSelf
            ? 'bg-primary text-primary-foreground'
            : 'border border-border bg-card/80 backdrop-blur-sm'
        }`}
      >
        {text && <p className="break-words">{text}</p>}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Shared image"
            className="mt-2 max-h-64 rounded-lg object-contain"
          />
        )}
        <p
          className={`mt-1 text-xs ${
            isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          {format(timestamp, 'HH:mm')}
        </p>
      </div>
    </div>
  );
}
