import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GameStateDebugPanelProps {
  state: unknown;
}

export default function GameStateDebugPanel({ state }: GameStateDebugPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Game State (JSON)</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-lg border border-border bg-muted/30 p-4">
          <pre className="text-xs">
            <code>{JSON.stringify(state, null, 2)}</code>
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
