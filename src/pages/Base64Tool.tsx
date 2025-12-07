import { useState } from "react";
import { Binary, Copy, Check, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    if (!input.trim()) {
      toast({
        title: "No input",
        description: "Please enter some text to encode.",
        variant: "destructive",
      });
      return;
    }

    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
      setMode("encode");
      toast({ title: "Encoded successfully!" });
    } catch (error) {
      toast({
        title: "Encoding failed",
        description: "Could not encode the input text.",
        variant: "destructive",
      });
    }
  };

  const handleDecode = () => {
    if (!input.trim()) {
      toast({
        title: "No input",
        description: "Please enter a Base64 string to decode.",
        variant: "destructive",
      });
      return;
    }

    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
      setMode("decode");
      toast({ title: "Decoded successfully!" });
    } catch (error) {
      toast({
        title: "Decoding failed",
        description: "Invalid Base64 string. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput("");
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Binary className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Base64 Encoder/Decoder</h1>
          <p className="text-sm text-muted-foreground">
            Encode text to Base64 or decode Base64 strings
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Input {mode === "encode" ? "(Plain Text)" : "(Base64 String)"}
        </label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "Enter text to encode..."
              : "Enter Base64 string to decode..."
          }
          className="min-h-[180px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={handleEncode} variant="default" className="gap-2">
          Encode to Base64
        </Button>
        <Button onClick={handleDecode} variant="secondary" className="gap-2">
          Decode from Base64
        </Button>
        <Button
          onClick={handleSwap}
          variant="outline"
          size="icon"
          disabled={!output}
          title="Use output as input"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleClear}
          variant="ghost"
          disabled={!input && !output}
        >
          Clear
        </Button>
      </div>

      {/* Output */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center justify-between">
          <span>
            Output {mode === "encode" ? "(Base64)" : "(Plain Text)"}
          </span>
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
          placeholder="Result will appear here..."
          className="min-h-[180px] bg-muted/50"
        />
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h3 className="font-medium mb-2">About Base64</h3>
        <p className="text-sm text-muted-foreground">
          Base64 is a binary-to-text encoding scheme that represents binary data
          in an ASCII string format. It's commonly used to embed images in HTML/CSS,
          encode data in URLs, and transmit data that might otherwise be misinterpreted.
        </p>
      </div>
    </div>
  );
}
