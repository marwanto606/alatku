import { Link, useLocation } from "react-router-dom";
import { FileCode, Binary, Braces, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
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
            "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r border-border bg-sidebar transition-all duration-300 md:sticky md:top-16 flex-shrink-0",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            isCollapsed ? "w-16" : "w-64"
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

            {/* Collapse toggle - desktop only */}
            <div className="hidden md:flex items-center justify-end p-2 border-b border-sidebar-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-8 w-8"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Tool links */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {!isCollapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2 hidden md:block">
                  Tools
                </p>
              )}
              {tools.map((tool) => {
                const isActive = location.pathname === tool.path;
                const linkContent = (
                  <Link key={tool.path} to={tool.path} onClick={onClose}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg transition-all duration-200 group",
                        isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-3",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted group-hover:bg-primary/20"
                        )}
                      >
                        <tool.icon className="h-4 w-4" />
                      </div>
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {tool.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {tool.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={tool.path}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="flex flex-col">
                        <span className="font-medium">{tool.label}</span>
                        <span className="text-xs text-muted-foreground">{tool.description}</span>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border">
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground text-center">❤️</p>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Made with ❤️ by Alatku606
                  </TooltipContent>
                </Tooltip>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  Made with ❤️ by Alatku606
                </p>
              )}
            </div>
          </div>
        </aside>
      </>
    </TooltipProvider>
  );
}
