import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, LogIn, LogOut, Menu, Sparkles } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { isAuthenticated, shortPrincipal, login, logout, isLoading } =
    useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b shadow-md border-border bg-card px-4">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0 hover:bg-primary/10 hover:text-primary transition-smooth"
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
        data-ocid="header.menu_toggle_button"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25 shrink-0">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="hidden sm:flex flex-col min-w-0">
          <span className="font-display font-bold text-sm text-foreground leading-tight truncate">
            AI Doubt Solver
          </span>
          <span className="text-[10px] text-muted-foreground leading-none">
            Ask anything, anytime
          </span>
        </div>
        <span className="font-display font-bold text-sm text-foreground sm:hidden">
          ADS
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status pill */}
      <div
        className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs text-primary"
        aria-label="AI-powered"
      >
        <Sparkles className="h-3 w-3" />
        <span className="font-medium">AI Powered</span>
      </div>

      {isAuthenticated && shortPrincipal && (
        <>
          <Separator orientation="vertical" className="h-5" />
          <span
            className="font-mono text-xs text-muted-foreground hidden md:block truncate max-w-[120px]"
            title="Your Internet Identity principal"
          >
            {shortPrincipal}
          </span>
        </>
      )}

      <Separator orientation="vertical" className="h-5" />

      {isAuthenticated ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-smooth"
          aria-label="Sign out"
          data-ocid="header.logout_button"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:block">Sign out</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={login}
          disabled={isLoading}
          className="gap-1.5 hover:bg-primary/10 hover:text-primary transition-smooth"
          aria-label="Sign in with Internet Identity"
          data-ocid="header.login_button"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:block">
            {isLoading ? "Signing in…" : "Sign in"}
          </span>
        </Button>
      )}
    </header>
  );
}
