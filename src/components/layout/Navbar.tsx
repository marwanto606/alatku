import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X, Wrench, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

interface NavbarProps {
  isOpen: boolean;
  onMenuClick: () => void;
}

export function Navbar({ isOpen, onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass-effect">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Hamburger menu button - toggles between Menu and X icon */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={onMenuClick}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-4">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center glow-effect">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg gradient-text">
            Alatku606
          </span>
        </Link>

        {/* Nav items - always visible */}
        <nav className="flex items-center gap-1">
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
        <div className="flex-1" />

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
