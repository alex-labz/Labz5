import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { CaseCard } from "@/components/cards";
import { useListCases } from "@workspace/api-client-react";

export default function CasesPage() {
  const { data: cases = [], isLoading } = useListCases();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black font-display tracking-tight mb-6"
          >
            Cases & <span className="text-gradient-gold">Partners</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Explore our track record of scaling top Web3 projects through strategic marketing.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl animate-pulse aspect-[16/10] bg-white/5" />
            ))}
          </div>
        ) : cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c, idx) => (
              <CaseCard key={c.id} data={c} index={idx} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-white/10 rounded-2xl glass-panel">
            <h3 className="text-2xl font-bold text-foreground mb-2">No cases available</h3>
            <p className="text-muted-foreground">We are currently updating our portfolio.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
