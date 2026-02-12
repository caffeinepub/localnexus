import { useState, useRef, ChangeEvent } from 'react';
import { useLocalNexus } from '@/state/localNexusStore';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useSendMessage } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image as ImageIcon } from 'lucide-react';
import { useTypingIdle } from '@/hooks/useTypingIdle';
import TypingIndicator from './TypingIndicator';
import { fileToUint8Array } from '@/lib/fileToUint8Array';
import { MAX_TEXT_SIZE, MAX_IMAGE_SIZE } from '@/lib/chatLimits';
import { toast } from 'sonner';

interface ChatComposerProps {
  disabled?: boolean;
}

export default function ChatComposer({ disabled = false }: ChatComposerProps) {
  const [text, setText] = useState('');
  const { selectedPeer } = useLocalNexus();
  const { identity } = useInternetIdentity();
  const sendMessage = useSendMessage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isTyping, handleTyping } = useTypingIdle();

  const handleSend = async () => {
    if (!text.trim() || !selectedPeer || !identity) return;
    
    if (text.length > MAX_TEXT_SIZE) {
      toast.error(`Message too long. Maximum ${MAX_TEXT_SIZE} characters.`);
      return;
    }

    try {
      await sendMessage.mutateAsync({
        receiver: selectedPeer.principal,
        message: {
          sender: identity.getPrincipal(),
          text: text.trim(),
        },
      });
      setText('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    }
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPeer || !identity) return;

    try {
      const imageBytes = await fileToUint8Array(file);
      
      if (imageBytes.length > MAX_IMAGE_SIZE) {
        toast.error(`Image too large. Maximum size is ${Math.round(MAX_IMAGE_SIZE / 1024)}KB.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      await sendMessage.mutateAsync({
        receiver: selectedPeer.principal,
        message: {
          sender: identity.getPrincipal(),
          text: '',
          image_payload: imageBytes,
        },
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Image sent');
    } catch (error: any) {
      console.error('Error sending image:', error);
      toast.error(error.message || 'Failed to send image');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {isTyping && <TypingIndicator />}
      
      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Connect to a peer to send messages' : 'Type a message...'}
          disabled={disabled || sendMessage.isPending}
          className="min-h-[60px] resize-none"
        />
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sendMessage.isPending}
            size="icon"
            variant="outline"
            aria-label="Attach image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={disabled || !text.trim() || sendMessage.isPending}
            size="icon"
            aria-label="Send message"
          >
            {sendMessage.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
}
