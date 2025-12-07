import { useState } from "react";
import { FileCode, Copy, Check, Loader2, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

type CodeType = "html" | "css" | "js";

// Simple browser-compatible minifiers
const minifyHTML = (html: string): string => {
  return html
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove leading/trailing whitespace
    .trim()
    // Collapse multiple spaces to single
    .replace(/\s{2,}/g, ' ');
};

const minifyCSS = (css: string): string => {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove whitespace around selectors and braces
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*,\s*/g, ',')
    // Remove last semicolon before closing brace
    .replace(/;}/g, '}')
    // Collapse whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const minifyJS = (js: string): string => {
  return js
    // Remove single-line comments (but not URLs)
    .replace(/(?<!:)\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('')
    // Collapse multiple spaces
    .replace(/\s{2,}/g, ' ')
    // Remove spaces around operators
    .replace(/\s*([{};,=+\-*/<>!&|?:])\s*/g, '$1')
    .trim();
};

export default function MinifierTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [codeType, setCodeType] = useState<CodeType>("html");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ before: number; after: number } | null>(null);

  const handleMinify = async () => {
    if (!input.trim()) {
      toast({
        title: "No input",
        description: "Please enter some code to minify.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setStats(null);

    try {
      let result = "";
      const beforeSize = new Blob([input]).size;

      // Add small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 100));

      switch (codeType) {
        case "html":
          result = minifyHTML(input);
          break;
        case "css":
          result = minifyCSS(input);
          break;
        case "js":
          result = minifyJS(input);
          break;
      }

      const afterSize = new Blob([result]).size;
      setOutput(result);
      setStats({ before: beforeSize, after: afterSize });
      
      toast({
        title: "Minification complete!",
        description: `Reduced from ${formatBytes(beforeSize)} to ${formatBytes(afterSize)}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Minification failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getSavingsPercent = () => {
    if (!stats) return 0;
    return Math.round((1 - stats.after / stats.before) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileCode className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Code Minifier</h1>
          <p className="text-sm text-muted-foreground">
            Compress HTML, CSS, or JavaScript code
          </p>
        </div>
      </div>

      {/* Code Type Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Code Type:</label>
        <Select value={codeType} onValueChange={(v) => setCodeType(v as CodeType)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
            <SelectItem value="js">JavaScript</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center justify-between">
          <span>Input Code</span>
          {input && (
            <span className="text-muted-foreground">
              {formatBytes(new Blob([input]).size)}
            </span>
          )}
        </label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Paste your ${codeType.toUpperCase()} code here...`}
          className="min-h-[200px]"
        />
      </div>

      {/* Minify Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleMinify}
          disabled={isLoading || !input.trim()}
          size="lg"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Minifying...
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4" />
              Minify Code
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex items-center justify-center gap-6 p-4 rounded-lg bg-muted/50 animate-scale-in">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Before</p>
            <p className="font-mono font-semibold">{formatBytes(stats.before)}</p>
          </div>
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">After</p>
            <p className="font-mono font-semibold">{formatBytes(stats.after)}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-primary/10">
            <p className="text-sm text-muted-foreground">Saved</p>
            <p className="font-mono font-bold text-primary">{getSavingsPercent()}%</p>
          </div>
        </div>
      )}

      {/* Output */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center justify-between">
          <span>Minified Output</span>
          {output && (
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          )}
        </label>
        <Textarea
          value={output}
          readOnly
          placeholder="Minified code will appear here..."
          className="min-h-[200px] bg-muted/50"
        />
      </div>
    </div>
  );
}
