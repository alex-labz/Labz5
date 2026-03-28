import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Layout } from "@/components/layout";
import { KolCard } from "@/components/cards";
import { useListKols } from "@workspace/api-client-react";

export default function InfluencersPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { data: kols = [], isLoading } = useListKols();

  const niches = ["All", ...Array.from(new Set(kols.map(k => k.niche)))].filter(Boolean);

  const filteredData = kols.filter(k => {
    const matchesFilter = filter === "All" || k.niche === filter;
    const matchesSearch = k.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black font-display tracking-tight mb-6"
          >
            Our <span className="text-gradient-gold">Network</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            We manage and collaborate with the highest converting voices in the crypto space.
          </motion.p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {niches.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  filter === cat
                    ? "bg-gradient-to-r from-[#C8972A] to-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search influencers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-full pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl animate-pulse aspect-[4/5] bg-white/5" />
            ))}
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map((inf, idx) => (
              <KolCard key={inf.id} data={inf} index={idx} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-white/10 rounded-2xl glass-panel">
            <h3 className="text-2xl font-bold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
            <button
              onClick={() => { setFilter("All"); setSearch(""); }}
              className="mt-6 px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors font-bold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
