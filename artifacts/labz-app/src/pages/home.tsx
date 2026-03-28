import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Users, Globe, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout";
import { CaseCard } from "@/components/cards";
import { JoinLabzModal } from "@/components/join-modal";
import { useListCases } from "@workspace/api-client-react";
import { BASE_URL } from "@/lib/utils";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: cases = [], isLoading: casesLoading } = useListCases();

  // Show only top 3 cases on home
  const featuredCases = cases.slice(0, 3);

  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center pt-10 overflow-hidden bg-[#0D0D0D]">
        <div className="absolute inset-0 z-[-2] hidden">
          {/* using generated hero background */}
          <img 
            src={`${BASE_URL}/images/hero-bg.png`}
            alt="Hero abstract background" 
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full z-10">
          <div className="max-w-4xl mx-auto text-left md:text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex md:justify-center"
            >
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00FF00] tracking-widest uppercase mb-8 text-console">
                <span className="text-[#555]">[</span> POWERING WEB3 GROWTH <span className="text-[#555]">]</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tight leading-[1.15] mb-6 text-[#D9D9D9]"
            >
              The #1 InfoFi <br className="hidden md:block" />
              <span className="text-[#00FF00]">LAYER</span> Agency.<span className="cursor-blink" />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-[#666] mb-10 max-w-2xl md:mx-auto leading-relaxed font-mono"
            >
              We build an AI-powered crypto marketing intelligence layer that helps projects identify, analyze, and optimize KOL-driven campaigns using on-chain and social media data.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 md:justify-center"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="console-btn-primary flex items-center justify-center"
              >
                Join Labz Media <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <a
                href={`${BASE_URL}/app`}
                target="_blank"
                rel="noopener noreferrer"
                className="console-btn flex items-center justify-center"
              >
                Explore App <ChevronRight className="ml-1 w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-24 relative border-t border-[#2E2E2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-mono text-[#D9D9D9] mb-2">┌─ SERVICES ────────────────────────────────────┐</h2>
          <p className="text-left text-[#666] mb-12 max-w-2xl font-mono text-sm">A full-spectrum Web3 marketing intelligence suite built for projects that demand excellence.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "> KOL_NETWORK", icon: Users, desc: "Exclusive access to the most powerful voices in crypto with combined reach of 100M+." },
              { num: "02", title: "> SOCIALFI_CAMPAIGNS", icon: Zap, desc: "Drive engagement and community growth through cutting-edge SocialFi mechanics." },
              { num: "03", title: "> INFOFI_CAMPAIGNS", icon: Globe, desc: "Data-driven information campaigns that establish authority and drive adoption." }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="console-panel p-8 relative min-h-[220px]"
              >
                <div className="absolute bottom-4 right-4 text-7xl font-black text-[#1A1A1A] select-none pointer-events-none z-0">
                  {feature.num}
                </div>
                <div className="w-8 h-8 flex items-center justify-center mb-6 relative z-10 border border-[#2E2E2E] text-[#00FF00]">
                  <span className="text-xs">[◆]</span>
                </div>
                <h3 className="text-lg font-bold font-mono mb-3 text-[#D9D9D9] relative z-10 tracking-wider uppercase">{feature.title}</h3>
                <p className="text-[#555] text-sm font-mono leading-relaxed relative z-10">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASES & PARTNERS SECTION */}
      <section className="py-24 relative bg-[#0A0A0A] border-t border-[#2E2E2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-xl font-mono text-white mb-4">
                ┌─ CASES & PARTNERS ─────────────────────────────┐
              </h2>
              <p className="text-[#666] max-w-xl text-sm font-mono">
                We've partnered with top tier projects to deliver massive growth and visibility across the ecosystem.
              </p>
            </div>
            <a href="/cases" className="console-btn !py-2 !px-4 !text-xs flex items-center gap-2">
              [ VIEW_ALL ] <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {casesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="console-panel aspect-[16/10] animate-pulse" />)}
            </div>
          ) : featuredCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCases.map((c, i) => <CaseCard key={c.id} data={c} index={i} />)}
            </div>
          ) : (
            <div className="py-20 text-center console-panel">
              <p className="text-[#666] font-mono">// CASES_UPDATING...</p>
            </div>
          )}
        </div>
      </section>

      {/* JOIN LABZ CTA SECTION */}
      <section className="py-32 relative border-t border-[#2E2E2E] bg-[#0D0D0D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="console-panel p-12 md:p-16 relative">
            <h2 className="text-3xl md:text-5xl font-mono font-bold mb-6 text-[#00FF00]">
              &gt; READY_TO_SCALE?
            </h2>
            <p className="text-[#666] mb-10 max-w-2xl mx-auto font-mono">
              Whether you're a high-impact KOL looking for exclusive campaigns, or a Web3 project aiming for exponential growth.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="console-btn-primary flex items-center justify-center mx-auto"
            >
              [ CONNECT_NOW ] <ArrowRight className="ml-3 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <JoinLabzModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  );
}