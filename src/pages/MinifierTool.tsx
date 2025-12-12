import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { FileCode, Copy, Check, Loader2, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { minify as terserMinify } from "terser";

type CodeType = "html" | "css" | "js";

// Simple browser-compatible minifiers
const minifyHTML = (html: string): string => {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .trim()
    .replace(/\s{2,}/g, ' ');
};

const minifyCSS = (css: string): string => {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*,\s*/g, ',')
    .replace(/;}/g, '}')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

// Post-process to clean up excess whitespace (including in template literals)
const cleanupWhitespace = (code: string): string => {
  return code
    .replace(/\s{2,}/g, ' ')  // multiple spaces → single space
    .replace(/\s*\n\s*/g, '') // remove newlines and surrounding spaces
    .trim();
};

export default function MinifierTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [codeType, setCodeType] = useState<CodeType>("html");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ before: number; after: number } | null>(null);
  const [mangleEnabled, setMangleEnabled] = useState(false);

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

      switch (codeType) {
        case "html":
          result = minifyHTML(input);
          break;
        case "css":
          result = minifyCSS(input);
          break;
        case "js":
          // Always use Terser for accurate JS parsing
          const terserResult = await terserMinify(input, {
            mangle: mangleEnabled,
            compress: true,
          });
          let jsResult = terserResult.code || "";
          // Post-process: clean up excess whitespace (including in template literals)
          result = cleanupWhitespace(jsResult);
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
    <>
      <Helmet>
        <title>Code Minifier - Compress HTML, CSS, JavaScript | Alatku606</title>
        <meta name="description" content="Minify dan compress code HTML, CSS, dan JavaScript secara gratis. Kurangi ukuran file dan tingkatkan kecepatan loading website Anda." />
        <meta name="keywords" content="code minifier, html minifier, css minifier, javascript minifier, compress code, minify online, reduce file size" />
        <link rel="canonical" href="https://alatku.lovable.app/minifier" />
        <meta property="og:title" content="Code Minifier - Compress HTML, CSS, JavaScript" />
        <meta property="og:description" content="Minify dan compress code HTML, CSS, dan JavaScript secara gratis." />
        <meta property="og:url" content="https://alatku.lovable.app/minifier" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://alatku.lovable.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@marwanto606" />
        <meta name="twitter:title" content="Code Minifier - Compress HTML, CSS, JavaScript" />
        <meta name="twitter:description" content="Minify dan compress code HTML, CSS, dan JavaScript secara gratis." />
        <meta name="twitter:image" content="https://alatku.lovable.app/og-image.png" />
      </Helmet>
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
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

      {/* Code Type Selector & Options */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
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

        {/* Mangle option - only for JS */}
        {codeType === "js" && (
          <div className="flex items-center gap-2">
            <Switch
              id="mangle"
              checked={mangleEnabled}
              onCheckedChange={setMangleEnabled}
            />
            <Label htmlFor="mangle" className="text-sm cursor-pointer">
              Mangle (rename variables)
            </Label>
          </div>
        )}
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between h-[36px]">
            <span>Input Code</span>
            <span className={`text-muted-foreground ${!input ? 'invisible' : ''}`}>
              {input ? formatBytes(new Blob([input]).size) : '0 B'}
            </span>
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${codeType.toUpperCase()} code here...`}
            className="min-h-[300px] lg:min-h-[400px] font-mono text-sm"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between h-[36px]">
            <span>Minified Output</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy} 
              className={`gap-1 ${!output ? 'invisible' : ''}`}
            >
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
          </label>
          <Textarea
            value={output}
            readOnly
            placeholder="Minified code will appear here..."
            className="min-h-[300px] lg:min-h-[400px] bg-muted/50 font-mono text-sm"
          />
        </div>
      </div>
      </div>
    </>
  );
}
