import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import { BASE_URL } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "INFLUENCERS", path: "/influencers" },
    { name: "CASES", path: "/cases" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0D0D0D]">
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#0D0D0D]/95 border-b border-[#2E2E2E]" : "bg-[#141414] border-b border-[#2E2E2E]"
      }`}>
        <div className="console-header hidden md:flex">
           C:\LABZ\MEDIA&gt; SYSTEM_ONLINE
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="group flex flex-col">
              <span className="font-display font-bold text-lg tracking-tighter text-[#D9D9D9] flex items-center">
                <span className="text-[#555] mr-2 hidden md:inline">●●●</span> 
                <span className="text-[#666] mr-2">C:\LABZ\MEDIA&gt;</span>
                <span className="text-[#00FF00] font-bold">LABZ_MEDIA.exe</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                C:\&gt; INFOFI_AI_LAYER_AGENCY
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-bold font-mono transition-colors ${
                    location === link.path ? "text-[#00FF00]" : "text-[#666] hover:text-[#D9D9D9]"
                  }`}
                >
                  [{link.name}]
                </Link>
              ))}
              <a
                href={`${BASE_URL}/app`}
                target="_blank"
                rel="noopener noreferrer"
                className="console-btn ml-4"
              >
                Launch App
              </a>
            </nav>

            <button
              className="md:hidden text-[#00FF00] p-2 hover:text-[#00CC00] transition-colors font-mono"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? "[X]" : "[=]"}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0D0D0D] pt-24 px-6 flex flex-col border-b border-[#2E2E2E]"
          >
            <nav className="flex flex-col space-y-6 mt-10 text-left font-mono">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-xl font-bold transition-colors ${
                    location === link.path ? "text-[#00FF00]" : "text-[#666] hover:text-[#D9D9D9]"
                  }`}
                >
                  &gt; {link.name}
                </Link>
              ))}
              <a
                href={`${BASE_URL}/app`}
                target="_blank"
                rel="noopener noreferrer"
                className="console-btn w-fit mt-8"
              >
                Launch App
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-28">
        {children}
      </main>

      <footer className="border-t border-[#2E2E2E] bg-[#0A0A0A] mt-24 py-8 relative z-10 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col text-[#555] text-xs">
            <pre className="leading-tight">
{`┌─ LABZ_MEDIA ─┐
└─ © 2025 InfoFi Labz ─────────────────────┘`}
            </pre>
          </div>
          
          <div className="flex gap-4">
            <a href="https://t.me/infofilabz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-[#333] bg-[#000] flex items-center justify-center text-[#666] hover:border-[#00FF00] hover:text-[#00FF00] transition-colors rounded-none">
              <FaTelegram size={18} />
            </a>
            <a href="https://twitter.com/infofilabz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-[#333] bg-[#000] flex items-center justify-center text-[#666] hover:border-[#00FF00] hover:text-[#00FF00] transition-colors rounded-none">
              <FaXTwitter size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}