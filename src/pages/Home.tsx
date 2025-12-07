import { Link } from "react-router-dom";
import { FileCode, Binary, Braces, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  {
    path: "/minifier",
    title: "Code Minifier",
    description: "Compress HTML, CSS, and JavaScript code to reduce file sizes and improve load times.",
    icon: FileCode,
    features: ["HTML minification", "CSS compression", "JS uglification"],
  },
  {
    path: "/base64",
    title: "Base64 Encoder/Decoder",
    description: "Convert text to Base64 encoding or decode Base64 strings back to plain text.",
    icon: Binary,
    features: ["Encode text", "Decode Base64", "Copy results"],
  },
  {
    path: "/json",
    title: "JSON Viewer & Parser",
    description: "Parse, format, and visualize JSON data with syntax highlighting and error detection.",
    icon: Braces,
    features: ["Pretty print", "Error detection", "Tree view"],
  },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-16 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Developer Tools</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Welcome to{" "}
          <span className="gradient-text">Alatku606</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A collection of essential developer tools for minifying code, encoding data, and parsing JSON. Fast, simple, and always free.
        </p>
        <Link to="/minifier">
          <Button size="lg" className="gap-2">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Tools Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="h-full p-6 rounded-xl bg-card border border-border card-shadow transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 animate-slide-up">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <tool.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {tool.description}
              </p>
              <ul className="space-y-1">
                {tool.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-3 gap-4 py-8">
        {[
          { label: "Tools Available", value: "3" },
          { label: "100% Free", value: "✓" },
          { label: "No Signup", value: "✓" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-4 rounded-lg bg-muted/50"
          >
            <p className="text-2xl md:text-3xl font-bold gradient-text">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
