import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Install() {
  return (
    <div className="space-y-4 animate-fade-in max-w-xl">
      <h1 className="font-display text-2xl text-primary glow">// Install on your phone</h1>
      <Card className="bg-card/40 border-primary/30 p-4 space-y-2 text-sm">
        <h2 className="font-display text-primary text-sm uppercase">iPhone (Safari)</h2>
        <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
          <li>Tap the <span className="text-primary">Share</span> button.</li>
          <li>Choose <span className="text-primary">Add to Home Screen</span>.</li>
          <li>Confirm — the app will appear like a native icon.</li>
        </ol>
      </Card>
      <Card className="bg-card/40 border-primary/30 p-4 space-y-2 text-sm">
        <h2 className="font-display text-primary text-sm uppercase">Android (Chrome)</h2>
        <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
          <li>Open the browser menu (⋮).</li>
          <li>Tap <span className="text-primary">Install app</span> or <span className="text-primary">Add to Home screen</span>.</li>
        </ol>
      </Card>
      <Button asChild className="bg-primary text-primary-foreground"><Link to="/">▸ Back to Dashboard</Link></Button>
    </div>
  );
}
