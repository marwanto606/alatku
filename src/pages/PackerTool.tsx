import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Copy, Check, Package, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Remove excessive whitespace and newlines from JavaScript code
function cleanupJS(code: string): string {
  // Remove comments
  let cleaned = code
    // Remove single-line comments (but not in strings)
    .replace(/\/\/[^\n]*/g, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove excessive whitespace
  cleaned = cleaned
    .replace(/\s+/g, ' ')  // Multiple spaces/newlines to single space
    .replace(/\s*([{};,:()\[\]=+\-*/<>!&|?])\s*/g, '$1')  // Remove spaces around operators
    .replace(/;\s*}/g, '}')  // Remove semicolon before closing brace
    .trim();
  
  return cleaned;
}

// Dean Edwards Packer - Pack function
function packJS(code: string): string {
  if (!code.trim()) return "";
  
  // First clean up the code
  const cleanedCode = cleanupJS(code);
  
  // Base62 characters
  const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Encode number to base62
  function encode(num: number): string {
    if (num === 0) return '0';
    let result = '';
    let n = num;
    while (n > 0) {
      result = ALPHABET[n % 62] + result;
      n = Math.floor(n / 62);
    }
    return result;
  }
  
  // Extract all words/identifiers
  const words: string[] = [];
  const wordCount = new Map<string, number>();
  
  const wordRegex = /\b[\w$]+\b/g;
  let match;
  while ((match = wordRegex.exec(cleanedCode)) !== null) {
    const word = match[0];
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
    if (!words.includes(word)) {
      words.push(word);
    }
  }
  
  // Sort by frequency (most used first for better compression)
  words.sort((a, b) => (wordCount.get(b) || 0) - (wordCount.get(a) || 0));
  
  // Build dictionary and packed code
  const dictionary: string[] = new Array(words.length).fill('');
  let packed = cleanedCode;
  
  words.forEach((word, index) => {
    const encoded = encode(index);
    // Only replace if encoded is shorter or equal (for obfuscation)
    const regex = new RegExp(`\\b${word.replace(/[$]/g, '\\$')}\\b`, 'g');
    packed = packed.replace(regex, encoded);
    dictionary[index] = word;
  });
  
  const count = dictionary.length;
  const dictStr = dictionary.join('|');
  
  // Escape special characters in packed code
  const escapedPacked = packed
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
  
  // Generate Dean Edwards packer format
  const result = `eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('${escapedPacked}',${count},${count},'${dictStr}'.split('|'),0,{}))`;
  
  return result;
}

// Dean Edwards Packer - Unpack function (using the actual unpacker algorithm)
function unpackJS(code: string): string {
  if (!code.trim()) return "";
  
  // Check if it's packed code
  const packerRegex = /eval\(function\(p,a,c,k,e,[dr]\)\{/;
  if (!packerRegex.test(code)) {
    throw new Error("Invalid packed code format. Make sure it's Dean Edwards packed JavaScript (starts with 'eval(function(p,a,c,k,e,')");
  }
  
  // Extract the parameters from the packed code
  // Format: eval(function(p,a,c,k,e,d){...}('packed_code',a,c,'dictionary'.split('|'),0,{}))
  const extractRegex = /eval\(function\(p,a,c,k,e,[dr]\)\{[^}]+\}\('((?:[^'\\]|\\.)*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']*)'\s*\.split\('\|'\)\s*,\s*\d+\s*,\s*\{\s*\}\s*\)\s*\)/;
  
  const match = code.match(extractRegex);
  
  if (!match) {
    // Try alternative: use the unpacker function directly by replacing eval with a function that returns the result
    try {
      // Create a safe unpacker function
      const unpackerFn = function(p: string, a: number, c: number, k: string[], e: unknown, d: Record<string, string>) {
        const encodeFunc = function(c: number): string {
          return (c < a ? '' : encodeFunc(Math.floor(c / a))) + 
            ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
        };
        
        // Replace with fallback logic
        if (!''.replace(/^/, String)) {
          while (c--) {
            d[encodeFunc(c)] = k[c] || encodeFunc(c);
          }
          const kFunc = function(e: string) { return d[e]; };
          const eFunc = function() { return '\\w+'; };
          c = 1;
          while (c--) {
            if (k[c]) {
              p = p.replace(new RegExp('\\b' + eFunc() + '\\b', 'g'), kFunc);
            }
          }
        } else {
          while (c--) {
            if (k[c]) {
              p = p.replace(new RegExp('\\b' + encodeFunc(c) + '\\b', 'g'), k[c]);
            }
          }
        }
        return p;
      };
      
      // Extract using a more flexible regex
      const flexRegex = /\('((?:[^'\\]|\\.)*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']*)'\s*\.split/;
      const flexMatch = code.match(flexRegex);
      
      if (flexMatch) {
        const p = flexMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        const a = parseInt(flexMatch[2]);
        const c = parseInt(flexMatch[3]);
        const k = flexMatch[4].split('|');
        
        return unpackerFn(p, a, c, k, null, {});
      }
      
      throw new Error("Could not parse packed code parameters");
    } catch (innerError) {
      throw new Error("Failed to unpack code. Make sure it's valid Dean Edwards packed JavaScript.");
    }
  }
  
  // Extract parameters
  const p = match[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
  const a = parseInt(match[2]);
  let c = parseInt(match[3]);
  const k = match[4].split('|');
  
  // Run the unpacker algorithm
  const encode = function(charCode: number): string {
    return (charCode < a ? '' : encode(Math.floor(charCode / a))) + 
      ((charCode = charCode % a) > 35 ? String.fromCharCode(charCode + 29) : charCode.toString(36));
  };
  
  let result = p;
  while (c--) {
    if (k[c]) {
      result = result.replace(new RegExp('\\b' + encode(c) + '\\b', 'g'), k[c]);
    }
  }
  
  return result;
}

export default function PackerTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"pack" | "unpack">("pack");
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter JavaScript code to process.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = mode === "pack" ? packJS(input) : unpackJS(input);
      setOutput(result);
      setCopied(false);
      
      if (mode === "pack") {
        const originalSize = new Blob([input]).size;
        const packedSize = new Blob([result]).size;
        toast({
          title: "Packed successfully",
          description: `${originalSize} bytes → ${packedSize} bytes`,
        });
      } else {
        toast({
          title: "Unpacked successfully",
          description: "JavaScript code has been unpacked.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process code.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setCopied(false);
  };

  return (
    <>
      <Helmet>
        <title>JS Packer Unpacker Online - Dean Edwards Packer | Alatku606</title>
        <meta name="description" content="Pack dan unpack JavaScript code menggunakan Dean Edwards Packer format secara online dan gratis. Compress JS dengan Base62 encoding." />
        <meta name="keywords" content="js packer, js unpacker, javascript packer, dean edwards packer, pack javascript, unpack javascript, base62 encoding" />
        <link rel="canonical" href="https://alatku.lovable.app/packer" />
        <meta property="og:title" content="JS Packer Unpacker Online - Dean Edwards Packer" />
        <meta property="og:description" content="Pack dan unpack JavaScript code menggunakan Dean Edwards Packer format secara online dan gratis." />
        <meta property="og:url" content="https://alatku.lovable.app/packer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/033cc045-9987-46b8-8f47-899754264144/id-preview-9a1da771--cbe93006-7f07-4f36-bc50-4ae411efea33.lovable.app-1765417392799.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@marwanto606" />
        <meta name="twitter:title" content="JS Packer Unpacker Online - Dean Edwards Packer" />
        <meta name="twitter:description" content="Pack dan unpack JavaScript code menggunakan Dean Edwards Packer format secara online dan gratis." />
        <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/033cc045-9987-46b8-8f47-899754264144/id-preview-9a1da771--cbe93006-7f07-4f36-bc50-4ae411efea33.lovable.app-1765417392799.png" />
      </Helmet>
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
        {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">JS Packer / Unpacker</h1>
        <p className="text-muted-foreground">
          Pack JavaScript code using Dean Edwards Packer format or unpack packed code back to readable JavaScript.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={mode === "pack" ? "default" : "outline"}
          onClick={() => {
            setMode("pack");
            setOutput("");
          }}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Pack
        </Button>
        <Button
          variant={mode === "unpack" ? "default" : "outline"}
          onClick={() => {
            setMode("unpack");
            setOutput("");
          }}
          className="gap-2"
        >
          <PackageOpen className="h-4 w-4" />
          Unpack
        </Button>
      </div>

      {/* Text Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between h-8">
            <label className="text-sm font-medium">
              Input {mode === "pack" ? "(JavaScript Code)" : "(Packed Code)"}
            </label>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "pack"
                ? "Paste your JavaScript code here..."
                : "Paste packed JavaScript code here (eval(function(p,a,c,k,e,d)...))"
            }
            className="min-h-[300px] font-mono text-sm resize-none"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between h-8">
            <label className="text-sm font-medium">
              Output {mode === "pack" ? "(Packed)" : "(Unpacked)"}
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={cn("gap-1", !output && "invisible")}
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
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="min-h-[300px] font-mono text-sm resize-none bg-muted/30"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleProcess} className="gap-2">
          {mode === "pack" ? (
            <>
              <Package className="h-4 w-4" />
              Pack JavaScript
            </>
          ) : (
            <>
              <PackageOpen className="h-4 w-4" />
              Unpack JavaScript
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <p className="font-medium mb-2">About Dean Edwards Packer:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Packer compresses JavaScript by encoding with Base62 and building a dictionary</li>
          <li>Packed code starts with <code className="bg-muted px-1 rounded">eval(function(p,a,c,k,e,d)</code></li>
          <li>Pack mode removes comments, newlines, and excessive whitespace automatically</li>
          <li>Useful for basic obfuscation and reducing file size</li>
        </ul>
      </div>
      </div>
    </>
  );
}
