import { ReactNode } from 'react';
import { Moon, Sun, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTheme } from 'next-themes';
import { useLocalNexus } from '@/state/localNexusStore';
import { useQueryClient } from '@tanstack/react-query';
import ConnectionHealth from '@/components/connection/ConnectionHealth';
import LoginButton from '@/components/auth/LoginButton';
import ProfileSetupDialog from '@/components/auth/ProfileSetupDialog';

type Screen = 'discovery' | 'chat' | 'games';

interface AppShellProps {
  children: ReactNode;
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function AppShell({ children, activeScreen, onScreenChange }: AppShellProps) {
  const { theme, setTheme } = useTheme();
  const { clearAllData } = useLocalNexus();
  const queryClient = useQueryClient();

  const handleClearData = () => {
    clearAllData();
    queryClient.clear();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ProfileSetupDialog />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/localnexus-logo.dim_512x512.png"
              alt="LocalNexus Logo"
              className="h-10 w-10"
            />
            <h1 className="text-xl font-bold tracking-tight">LocalNexus</h1>
          </div>

          <div className="flex items-center gap-2">
            <LoginButton />
            <ConnectionHealth />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Clear all data">
                  <Trash2 className="h-5 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your local connection state and clear the React Query cache. Backend data (messages, games, profiles) will remain intact.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>Clear Data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="container border-t border-border/40">
          <nav className="flex h-12 items-center gap-1 px-4">
            <Button
              variant={activeScreen === 'discovery' ? 'secondary' : 'ghost'}
              onClick={() => onScreenChange('discovery')}
              className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
              data-active={activeScreen === 'discovery'}
            >
              Discovery
            </Button>
            <Button
              variant={activeScreen === 'chat' ? 'secondary' : 'ghost'}
              onClick={() => onScreenChange('chat')}
              className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
              data-active={activeScreen === 'chat'}
            >
              Chat
            </Button>
            <Button
              variant={activeScreen === 'games' ? 'secondary' : 'ghost'}
              onClick={() => onScreenChange('games')}
              className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
              data-active={activeScreen === 'games'}
            >
              Games
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} LocalNexus. Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'localnexus'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
