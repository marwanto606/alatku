import { Link, useLocation } from "react-router-dom";
import { FileCode, Binary, Braces, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const tools = [
  {
    path: "/minifier",
    label: "Code Minifier",
    icon: FileCode,
    description: "HTML, CSS, JS",
  },
  {
    path: "/base64",
    label: "Base64",
    icon: Binary,
    description: "Encode & Decode",
  },
  {
    path: "/json",
    label: "JSON Viewer",
    icon: Braces,
    description: "Parse & Format",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar transition-transform duration-300 md:translate-x-0 md:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 md:hidden">
            <span className="font-semibold text-sm text-muted-foreground">
              Tools
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tool links */}
          <nav className="flex-1 p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 hidden md:block">
              Tools
            </p>
            {tools.map((tool) => {
              const isActive = location.pathname === tool.path;
              return (
                <Link key={tool.path} to={tool.path} onClick={onClose}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted group-hover:bg-primary/20"
                      )}
                    >
                      <tool.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {tool.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground text-center">
              Made with ❤️ by Alatku606
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
