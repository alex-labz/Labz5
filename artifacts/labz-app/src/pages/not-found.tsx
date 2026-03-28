import { Link } from "wouter";
import { Layout } from "@/components/layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center glass-panel p-16 rounded-[3rem] border-primary/20 shadow-[0_0_50px_rgba(255,215,0,0.1)]">
          <h1 className="text-9xl font-black font-display text-gradient-gold mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            The coordinate you entered doesn't exist on our network map. Let's get you back to safety.
          </p>
          <Link href="/" className="px-8 py-3 rounded-full bg-primary text-background font-bold hover:bg-[#FDB931] transition-all">
            Return Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
