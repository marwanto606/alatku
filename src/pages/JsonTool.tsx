import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Braces, Copy, Check, AlertCircle, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";

// Custom JSON Tree View component with array count display
interface JsonTreeProps {
  data: any;
  level?: number;
  fieldName?: string;
  isLast?: boolean;
}

function JsonTree({ data, level = 0, fieldName, isLast = true }: JsonTreeProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const { theme } = useTheme();
  
  const isDark = theme === "dark";
  const indent = level * 16;
  
  const styles = {
    key: isDark ? "text-purple-400" : "text-purple-600",
    string: isDark ? "text-green-400" : "text-green-600",
    number: isDark ? "text-blue-400" : "text-blue-600",
    boolean: isDark ? "text-yellow-400" : "text-yellow-600",
    null: isDark ? "text-gray-500" : "text-gray-500",
    punctuation: isDark ? "text-gray-400" : "text-gray-500",
    count: isDark ? "text-gray-500" : "text-gray-400",
  };

  const renderValue = (value: any): JSX.Element => {
    if (value === null) return <span className={styles.null}>null</span>;
    if (value === undefined) return <span className={styles.null}>undefined</span>;
    
    switch (typeof value) {
      case "string":
        return <span className={styles.string}>"{value}"</span>;
      case "number":
        return <span className={styles.number}>{value}</span>;
      case "boolean":
        return <span className={styles.boolean}>{value.toString()}</span>;
      default:
        return <span>{String(value)}</span>;
    }
  };

  const isObject = data !== null && typeof data === "object";
  const isArray = Array.isArray(data);
  const hasChildren = isObject && Object.keys(data).length > 0;
  const count = isObject ? Object.keys(data).length : 0;
  const comma = isLast ? "" : ",";

  if (!isObject) {
    return (
      <div style={{ marginLeft: indent }} className="font-mono text-sm leading-6">
        {fieldName !== undefined && (
          <>
            <span className={styles.key}>"{fieldName}"</span>
            <span className={styles.punctuation}>: </span>
          </>
        )}
        {renderValue(data)}
        <span className={styles.punctuation}>{comma}</span>
      </div>
    );
  }

  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const entries = Object.entries(data);

  return (
    <div style={{ marginLeft: indent }} className="font-mono text-sm">
      <div 
        className="flex items-center cursor-pointer hover:opacity-80 leading-6"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className={`${styles.punctuation} mr-1`}>
            {expanded ? <ChevronDown className="h-3 w-3 inline" /> : <ChevronRight className="h-3 w-3 inline" />}
          </span>
        )}
        {fieldName !== undefined && (
          <>
            <span className={styles.key}>"{fieldName}"</span>
            <span className={styles.punctuation}>: </span>
          </>
        )}
        {isArray && <span className={styles.count}>[{count}]</span>}
        <span className={styles.punctuation}>{openBracket}</span>
        {!expanded && hasChildren && (
          <>
            <span className={styles.count}>...</span>
            <span className={styles.punctuation}>{closeBracket}{comma}</span>
          </>
        )}
        {!hasChildren && (
          <span className={styles.punctuation}>{closeBracket}{comma}</span>
        )}
      </div>
      {expanded && hasChildren && (
        <>
          {entries.map(([key, value], index) => (
            <JsonTree
              key={key}
              data={value}
              level={level + 1}
              fieldName={isArray ? undefined : key}
              isLast={index === entries.length - 1}
            />
          ))}
          <div style={{ marginLeft: 16 }} className="leading-6">
            <span className={styles.punctuation}>{closeBracket}{comma}</span>
          </div>
        </>
      )}
    </div>
  );
}

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
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/033cc045-9987-46b8-8f47-899754264144/id-preview-9a1da771--cbe93006-7f07-4f36-bc50-4ae411efea33.lovable.app-1765417392799.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@marwanto606" />
        <meta name="twitter:title" content="JSON Viewer Parser Online - Format & Validate JSON" />
        <meta name="twitter:description" content="Parse, format, dan visualisasi JSON data secara online dengan syntax highlighting dan tree view." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/033cc045-9987-46b8-8f47-899754264144/id-preview-9a1da771--cbe93006-7f07-4f36-bc50-4ae411efea33.lovable.app-1765417392799.png" />
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

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between h-5">
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
          <div className="h-5 flex items-center">
            <label className="text-sm font-medium">Tree View</label>
          </div>
          <div className={`min-h-[300px] lg:min-h-[400px] rounded-lg border border-border p-4 overflow-auto ${theme === "dark" ? "bg-[#0c1322]" : "bg-white"}`}>
            {parseResult.valid && parseResult.data ? (
              <JsonTree data={parseResult.data} />
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
