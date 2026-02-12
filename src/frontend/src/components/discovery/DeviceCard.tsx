import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone } from 'lucide-react';
import type { Device } from '@/state/localNexusStore';

interface DeviceCardProps {
  device: Device;
  onConnect: (deviceId: string) => void;
}

export default function DeviceCard({ device, onConnect }: DeviceCardProps) {
  const timeSinceLastSeen = Date.now() - device.lastSeen;
  const isRecent = timeSinceLastSeen < 5000;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          {isRecent && <Badge variant="secondary">Active</Badge>}
        </div>
        <h3 className="mb-1 font-semibold">{device.name}</h3>
        <p className="text-sm text-muted-foreground">
          Last seen: {timeSinceLastSeen < 1000 ? 'just now' : `${Math.floor(timeSinceLastSeen / 1000)}s ago`}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onConnect(device.id)} className="w-full">
          Connect
        </Button>
      </CardFooter>
    </Card>
  );
}
