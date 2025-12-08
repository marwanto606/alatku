import { Link } from "react-router-dom";
import { Sun, Moon, Menu, Wrench, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass-effect">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Hamburger menu button - always visible */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo - centered on mobile */}
        <Link to="/" className="flex items-center gap-2 flex-1 md:flex-none md:mr-8 justify-center md:justify-start">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center glow-effect">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg gradient-text">
            Alatku606
          </span>
        </Link>

        {/* Nav items */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm">
              Home
            </Button>
          </Link>
          <a href="https://www.marwanto606.com" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-1">
              Blog
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </nav>

        {/* Spacer */}
        <div className="flex-1 md:flex-initial" />

        {/* Theme toggle icon button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
