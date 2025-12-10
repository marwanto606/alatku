import { useState } from "react";
import { Copy, Check, Package, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Dean Edwards Packer - Pack function
function packJS(code: string): string {
  if (!code.trim()) return "";
  
  // Simple base62 encoding
  const base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  function encode62(num: number): string {
    if (num === 0) return "0";
    let result = "";
    while (num > 0) {
      result = base62[num % 62] + result;
      num = Math.floor(num / 62);
    }
    return result;
  }
  
  // Extract words/tokens from code
  const wordRegex = /\b\w+\b/g;
  const words: string[] = [];
  const wordCount: Map<string, number> = new Map();
  
  let match;
  while ((match = wordRegex.exec(code)) !== null) {
    const word = match[0];
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
    if (!words.includes(word)) {
      words.push(word);
    }
  }
  
  // Sort words by frequency (most frequent first for better compression)
  words.sort((a, b) => (wordCount.get(b) || 0) - (wordCount.get(a) || 0));
  
  // Create packed string
  let packed = code;
  const dictionary: string[] = [];
  
  words.forEach((word, index) => {
    const encoded = encode62(index);
    if (encoded.length < word.length) {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      packed = packed.replace(regex, encoded);
      dictionary[index] = word;
    } else {
      dictionary[index] = word;
    }
  });
  
  // Fill empty slots
  for (let i = 0; i < dictionary.length; i++) {
    if (!dictionary[i]) dictionary[i] = "";
  }
  
  const count = dictionary.length;
  const dictionaryStr = dictionary.join("|");
  
  // Generate the packed output
  const result = `eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('${packed.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',${count},${count},'${dictionaryStr}'.split('|'),0,{}))`;
  
  return result;
}

// Dean Edwards Packer - Unpack function
function unpackJS(code: string): string {
  if (!code.trim()) return "";
  
  // Check if it's a packed code (starts with eval(function(p,a,c,k,e,d) or eval(function(p,a,c,k,e,r))
  const packedRegex = /eval\(function\(p,a,c,k,e,[dr]\)\{.*?\}?\('(.*?)',(\d+),(\d+),'(.*?)'\.split\('\|'\),\d+,\{\}\)\)/s;
  const match = code.match(packedRegex);
  
  if (!match) {
    // Try alternative format
    const altRegex = /eval\(function\(p,a,c,k,e,[dr]\)\{[^}]+\}\('([^']+)',\s*(\d+),\s*(\d+),\s*'([^']+)'\.split\('\|'\)/s;
    const altMatch = code.match(altRegex);
    
    if (!altMatch) {
      throw new Error("Invalid packed code format. Make sure it's Dean Edwards packed JavaScript.");
    }
    
    return unpackWithParams(altMatch[1], parseInt(altMatch[2]), parseInt(altMatch[3]), altMatch[4].split("|"));
  }
  
  return unpackWithParams(match[1], parseInt(match[2]), parseInt(match[3]), match[4].split("|"));
}

function unpackWithParams(p: string, a: number, c: number, k: string[]): string {
  // Decode function
  function decode(charCode: number): string {
    const base36 = "0123456789abcdefghijklmnopqrstuvwxyz";
    if (charCode < a) {
      return charCode < 36 ? base36[charCode] : String.fromCharCode(charCode + 29);
    }
    return decode(Math.floor(charCode / a)) + decode(charCode % a);
  }
  
  // Replace encoded words with dictionary values
  let result = p.replace(/\\'/g, "'").replace(/\\\\/g, "\\");
  
  while (c--) {
    if (k[c]) {
      const encoded = decode(c);
      const regex = new RegExp(`\\b${encoded}\\b`, 'g');
      result = result.replace(regex, k[c]);
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
          <li>Packer compresses JavaScript by encoding it with Base62</li>
          <li>Packed code starts with <code className="bg-muted px-1 rounded">eval(function(p,a,c,k,e,d)</code></li>
          <li>Useful for basic obfuscation and reducing file size</li>
          <li>Note: Modern minifiers (like Terser) often provide better compression</li>
        </ul>
      </div>
    </div>
  );
}
