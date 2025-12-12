import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Braces, Copy, Check, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { JsonView, darkStyles, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { useTheme } from "@/hooks/useTheme";

export default function JsonTool() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const parseResult = useMemo(() => {
    if (!input.trim()) {
      return { valid: null, data: null, error: null };
    }
    try {
      const parsed = JSON.parse(input);
      return { valid: true, data: parsed, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      return { valid: false, data: null, error: message };
    }
  }, [input]);

  const handleFormat = () => {
    if (!input.trim()) {
      toast({
        title: "No input",
        description: "Please enter JSON to format.",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setInput(formatted);
      toast({ title: "JSON formatted!" });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please fix the errors before formatting.",
        variant: "destructive",
      });
    }
  };

  const handleMinify = () => {
    if (!input.trim()) {
      toast({
        title: "No input",
        description: "Please enter JSON to minify.",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
      toast({ title: "JSON minified!" });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please fix the errors before minifying.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
  };

  const loadSample = () => {
    const sample = {
      name: "Alatku606",
      version: "1.0.0",
      tools: ["minifier", "base64", "json"],
      features: {
        darkMode: true,
        responsive: true,
      },
      stats: {
        users: 1000,
        rating: 4.9,
      },
    };
    setInput(JSON.stringify(sample, null, 2));
  };

  return (
    <>
      <Helmet>
        <title>JSON Viewer Parser Online - Format & Validate JSON | Alatku606</title>
        <meta name="description" content="Parse, format, dan visualisasi JSON data secara online. JSON viewer dengan syntax highlighting, error detection, dan tree view gratis." />
        <meta name="keywords" content="json viewer, json parser, json formatter, json validator, json online, format json, pretty print json, json tree view" />
        <link rel="canonical" href="https://alatku.lovable.app/json" />
        <meta property="og:title" content="JSON Viewer Parser Online - Format & Validate JSON" />
        <meta property="og:description" content="Parse, format, dan visualisasi JSON data secara online dengan syntax highlighting dan tree view." />
        <meta property="og:url" content="https://alatku.lovable.app/json" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://alatku.lovable.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@marwanto606" />
        <meta name="twitter:title" content="JSON Viewer Parser Online - Format & Validate JSON" />
        <meta name="twitter:description" content="Parse, format, dan visualisasi JSON data secara online dengan syntax highlighting dan tree view." />
        <meta name="twitter:image" content="https://alatku.lovable.app/og-image.png" />
      </Helmet>
      <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
        {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Braces className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">JSON Viewer & Parser</h1>
          <p className="text-sm text-muted-foreground">
            Parse, format, and visualize JSON data
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">JSON Input</label>
            <div className="flex items-center gap-2">
              {parseResult.valid !== null && (
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${
                    parseResult.valid ? "text-green-500" : "text-destructive"
                  }`}
                >
                  {parseResult.valid ? (
                    <>
                      <CheckCircle className="h-3 w-3" /> Valid
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" /> Invalid
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            className="min-h-[300px] lg:min-h-[400px]"
          />

          {/* Error Message */}
          {parseResult.error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive animate-scale-in">
              <p className="font-medium">Parse Error</p>
              <p className="font-mono text-xs mt-1">{parseResult.error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleFormat} variant="default" size="sm">
              Format
            </Button>
            <Button onClick={handleMinify} variant="secondary" size="sm">
              Minify
            </Button>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              disabled={!input}
              className="gap-1"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </Button>
            <Button onClick={handleClear} variant="ghost" size="sm" disabled={!input}>
              Clear
            </Button>
            <Button onClick={loadSample} variant="ghost" size="sm">
              Load Sample
            </Button>
          </div>
        </div>

        {/* Viewer Section */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Tree View</label>
          <div className="min-h-[300px] lg:min-h-[400px] rounded-lg border border-border bg-card p-4 overflow-auto">
            {parseResult.valid && parseResult.data ? (
              <JsonView
                data={parseResult.data}
                style={theme === "dark" ? darkStyles : defaultStyles}
                shouldExpandNode={(level) => level < 2}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {input.trim()
                  ? "Fix JSON errors to see tree view"
                  : "Enter valid JSON to see tree view"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h3 className="font-medium mb-2">Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Paste or type your JSON in the input area</li>
          <li>• Use "Format" to pretty-print with proper indentation</li>
          <li>• Use "Minify" to compress into a single line</li>
          <li>• Click on nodes in the tree view to expand/collapse</li>
        </ul>
      </div>
      </div>
    </>
  );
}
