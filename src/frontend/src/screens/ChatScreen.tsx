import { useEffect, useRef } from 'react';
import { useLocalNexus } from '@/state/localNexusStore';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetMessages } from '@/hooks/useQueries';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatComposer from '@/components/chat/ChatComposer';
import ChallengeBar from '@/components/chat/ChallengeBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatScreen() {
  const { identity } = useInternetIdentity();
  const { connectionState, selectedPeer } = useLocalNexus();
  const { data: messages = [], isLoading, error } = useGetMessages(selectedPeer?.principal || null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!identity;
  const isConnected = connectionState === 'connected' && selectedPeer;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl px-4 py-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please log in to send and receive messages.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container flex h-[calc(100vh-14rem)] max-w-4xl flex-col px-4 py-6">
      {!isConnected && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {connectionState === 'disconnected'
              ? 'Connection lost. Please reconnect from the Discovery screen.'
              : 'Not connected. Go to Discovery to connect with a peer.'}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load messages. The connection may be unstable.
          </AlertDescription>
        </Alert>
      )}

      {isConnected && selectedPeer && (
        <div className="mb-4 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Connected to</p>
              <p className="font-semibold">{selectedPeer.name}</p>
            </div>
            <ChallengeBar />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 rounded-lg border border-border bg-muted/20 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="ml-auto h-16 w-3/4" />
              <Skeleton className="h-16 w-3/4" />
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="flex h-full items-center justify-center py-12 text-center text-muted-foreground">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
          {!isLoading && messages.map((message, index) => {
            const isSelf = identity && message.sender.toString() === identity.getPrincipal().toString();
            return (
              <MessageBubble
                key={index}
                message={{
                  id: `msg-${index}`,
                  text: message.text,
                  imagePayload: message.image_payload,
                  timestamp: Date.now(),
                  isSelf,
                }}
              />
            );
          })}
        </div>
      </ScrollArea>

      <div className="mt-4">
        <ChatComposer disabled={!isConnected} />
      </div>
    </div>
  );
}
