import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, User, Users, LogOut, ChevronRight, Rss, Briefcase, Save, Wallet, FileText, Link2, Send, ClipboardList, CheckCircle, XCircle, Clock, ShoppingCart, Plus, Minus, Globe, Twitter } from "lucide-react";
import { KolCard, CampaignCard } from "@/components/cards";
import {
  useListKols,
  useListCampaigns,
  useListSections,
  useListTags,
  useGetUser,
  useUpdateUserProfile,
  useListPosts,
  useListUserSubmissions,
  useSubmitCampaignApplication,
  useListUserProjectRequests,
  useCreateProjectRequest,
  type Campaign,
  type FormField,
  type ProjectRequest,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTelegram } from "@/hooks/use-telegram";
import { BASE_URL } from "@/lib/utils";

/* ══════════════════════════════════════════
   AUTH HELPERS
══════════════════════════════════════════ */

const AUTH_KEY = "labz_user";

interface AuthUser { id: number; login: string; createdAt: string; }
interface AppRecord {
  id: number; type: string; status: string; name: string;
  telegram?: string; socialMedia?: string;
  additionalLink1?: string; additionalLink2?: string;
}

function getStoredUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch { return null; }
}
function storeUser(u: AuthUser | null) {
  if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  else localStorage.removeItem(AUTH_KEY);
}

async function apiPost(path: string, body: object) {
  const r = await fetch(`${BASE_URL}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: r.ok, status: r.status, data: await r.json() };
}

async function apiGet(path: string) {
  const r = await fetch(`${BASE_URL}/api${path}`);
  return { ok: r.ok, data: await r.json() };
}

/* ══════════════════════════════════════════
   BOOT ANIMATION
══════════════════════════════════════════ */

const BOOT_LINES = [
  "LABZ_OS v2.0.1 — INITIALIZING...",
  "Loading kernel modules..........OK",
  "Connecting to InfoFi network....OK",
  "Syncing on-chain data...........OK",
  "Verifying node integrity........OK",
  "SYSTEM READY.",
];

function BootScreen({ onDone }: { onDone: () => void }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const next = () => {
      if (cancelled) return;
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i];
        i++;
        if (line) setVisibleLines((prev) => [...prev, line]);
        setTimeout(next, 320);
      } else {
        setTimeout(() => { if (!cancelled) setDone(true); }, 400);
      }
    };
    const t = setTimeout(next, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  useEffect(() => {
    if (done) {
      setTimeout(onDone, 600);
    }
  }, [done, onDone]);

  return (
    <motion.div
      className="flex flex-col justify-center bg-[#0D0D0D] font-mono px-6"
      style={{ height: "var(--tg-vh, 100dvh)" }}
      animate={done ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#00FF00] flex items-center justify-center">
          <span className="text-[#00FF00] text-xl font-bold">L</span>
        </div>
        <div>
          <div className="text-[#00FF00] font-bold text-lg tracking-widest">LABZ</div>
          <div className="text-[#444] text-[10px] tracking-widest">INFOFI TERMINAL</div>
        </div>
      </div>

      <div className="space-y-1.5">
        {visibleLines.map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-xs ${line.startsWith("SYSTEM") ? "text-[#00FF00] font-bold mt-3" : "text-[#555]"}`}
          >
            <span className="text-[#333] mr-2">&gt;</span>{line}
          </motion.div>
        ))}
        {!done && (
          <span className="inline-block w-2 h-4 bg-[#00FF00] animate-pulse ml-4" />
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   AUTH SCREENS
══════════════════════════════════════════ */

type AuthView = "choose" | "login" | "register";

function AuthScreen({ onAuth }: { onAuth: (user: AuthUser) => void }) {
  const [view, setView] = useState<AuthView>("choose");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => { setLogin(""); setPassword(""); setRepeat(""); setAgreed(false); setError(""); };

  const handleLogin = async () => {
    if (!login || !password) { setError("All fields are required"); return; }
    setLoading(true); setError("");
    const { ok, data } = await apiPost("/auth/login", { login, password });
    setLoading(false);
    if (ok) { storeUser(data); onAuth(data); }
    else setError(data.error || "Login failed");
  };

  const handleRegister = async () => {
    if (!login || !password || !repeat) { setError("All fields are required"); return; }
    if (password !== repeat) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (!agreed) { setError("You must agree to the terms"); return; }
    setLoading(true); setError("");
    const { ok, data } = await apiPost("/auth/register", { login, password });
    setLoading(false);
    if (ok) { storeUser(data); onAuth(data); }
    else setError(data.error || "Registration failed");
  };

  const inputCls = "w-full bg-[#080808] border border-[#2E2E2E] text-[#D9D9D9] text-sm px-3 py-2.5 font-mono placeholder:text-[#333] focus:outline-none focus:border-[#00FF00] transition-colors";

  return (
    <div className="flex flex-col bg-[#0D0D0D] font-mono" style={{ height: "var(--tg-vh, 100dvh)" }}>
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-[#2E2E2E] px-4 h-14 flex items-center gap-2">
        <div className="w-7 h-7 border border-[#00FF00] flex items-center justify-center">
          <span className="text-[#00FF00] text-[11px] font-bold">L</span>
        </div>
        <span className="font-bold text-sm text-[#D9D9D9]">
          LABZ_<span className="text-[#00FF00]">ACCOUNT</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          {/* Choose view */}
          {view === "choose" && (
            <motion.div key="choose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8 mt-4">
                <div className="text-[#00FF00] text-xs tracking-widest mb-1">// ACCESS REQUIRED</div>
                <h2 className="text-[#D9D9D9] text-xl font-bold">Join the LABZ network</h2>
                <p className="text-[#555] text-xs mt-2 leading-relaxed">
                  Create an account or sign in to apply as a KOL or Project partner.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { reset(); setView("register"); }}
                  className="w-full flex items-center justify-between bg-[#00FF00] text-black px-4 py-3.5 font-bold text-sm hover:bg-[#00DD00] transition-colors"
                >
                  <span>REGISTER NEW ACCOUNT</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { reset(); setView("login"); }}
                  className="w-full flex items-center justify-between bg-transparent border border-[#2E2E2E] text-[#D9D9D9] px-4 py-3.5 font-bold text-sm hover:border-[#00FF00] hover:text-[#00FF00] transition-colors"
                >
                  <span>SIGN IN</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 border border-[#1A1A1A] p-4">
                <div className="text-[10px] text-[#444] leading-relaxed">
                  LABZ is an InfoFi/SocialFi influencer platform connecting KOLs with crypto projects. Register to apply for partnership.
                </div>
              </div>
            </motion.div>
          )}

          {/* Login view */}
          {view === "login" && (
            <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <button onClick={() => setView("choose")} className="text-[#555] text-xs mb-6 hover:text-[#00FF00] transition-colors flex items-center gap-1">
                ← BACK
              </button>

              <div className="mb-6">
                <div className="text-[#00FF00] text-xs tracking-widest mb-1">// AUTHENTICATION</div>
                <h2 className="text-[#D9D9D9] text-xl font-bold">Sign in</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">LOGIN_ID</div>
                  <input className={inputCls} placeholder="your_login" value={login} onChange={e => setLogin(e.target.value)} autoCapitalize="none" />
                </div>
                <div>
                  <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">PASSWORD</div>
                  <input className={inputCls} placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                {error && (
                  <div className="text-[#FF4444] text-xs border border-[#FF4444]/30 bg-[#FF4444]/5 px-3 py-2">
                    ERR: {error}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-[#00FF00] text-black px-4 py-3.5 font-bold text-sm hover:bg-[#00DD00] transition-colors disabled:opacity-50 mt-2"
                >
                  {loading ? "CONNECTING..." : "SIGN_IN.EXE"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-[#444] text-xs">No account? </span>
                <button onClick={() => { reset(); setView("register"); }} className="text-[#00FF00] text-xs hover:underline">
                  Register here
                </button>
              </div>
            </motion.div>
          )}

          {/* Register view */}
          {view === "register" && (
            <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <button onClick={() => setView("choose")} className="text-[#555] text-xs mb-6 hover:text-[#00FF00] transition-colors flex items-center gap-1">
                ← BACK
              </button>

              <div className="mb-6">
                <div className="text-[#00FF00] text-xs tracking-widest mb-1">// NEW USER</div>
                <h2 className="text-[#D9D9D9] text-xl font-bold">Create account</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">LOGIN_ID</div>
                  <input className={inputCls} placeholder="choose_a_login" value={login} onChange={e => setLogin(e.target.value)} autoCapitalize="none" />
                </div>
                <div>
                  <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">PASSWORD</div>
                  <input className={inputCls} placeholder="min 6 characters" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div>
                  <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">REPEAT_PASSWORD</div>
                  <input className={inputCls} placeholder="••••••••" type="password" value={repeat} onChange={e => setRepeat(e.target.value)} />
                </div>

                <label className="flex items-start gap-3 cursor-pointer mt-1">
                  <div
                    onClick={() => setAgreed(v => !v)}
                    className={`mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${agreed ? "border-[#00FF00] bg-[#00FF00]" : "border-[#2E2E2E] bg-transparent"}`}
                  >
                    {agreed && <span className="text-black text-[10px] font-bold leading-none">✓</span>}
                  </div>
                  <span className="text-[#555] text-xs leading-relaxed" onClick={() => setAgreed(v => !v)}>
                    I agree to LABZ terms of service and understand that my application will be reviewed before access is granted.
                  </span>
                </label>

                {error && (
                  <div className="text-[#FF4444] text-xs border border-[#FF4444]/30 bg-[#FF4444]/5 px-3 py-2">
                    ERR: {error}
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-[#00FF00] text-black px-4 py-3.5 font-bold text-sm hover:bg-[#00DD00] transition-colors disabled:opacity-50 mt-2"
                >
                  {loading ? "CREATING..." : "CREATE_ACCOUNT.EXE"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-[#444] text-xs">Already registered? </span>
                <button onClick={() => { reset(); setView("login"); }} className="text-[#00FF00] text-xs hover:underline">
                  Sign in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   APPLICATION FORM
══════════════════════════════════════════ */

function ApplicationForm({ user, onSubmitted }: { user: AuthUser; onSubmitted: () => void }) {
  const [appType, setAppType] = useState<"kol" | "project">("kol");
  const [name, setName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [link1, setLink1] = useState("");
  const [link2, setLink2] = useState("");
  const [about, setAbout] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputCls = "w-full bg-[#080808] border border-[#2E2E2E] text-[#D9D9D9] text-sm px-3 py-2.5 font-mono placeholder:text-[#333] focus:outline-none focus:border-[#00FF00] transition-colors";

  const handleSubmit = async () => {
    if (!name || !telegram || !socialMedia || !about) { setError("Please fill in all required fields"); return; }
    setLoading(true); setError("");
    const { ok, data } = await apiPost("/applications", {
      type: appType, name, telegram, socialMedia,
      additionalLink1: link1 || null,
      additionalLink2: link2 || null,
      about,
      userId: user.id,
    });
    setLoading(false);
    if (ok) onSubmitted();
    else setError(data.error || "Submission failed");
  };

  return (
    <div className="flex flex-col bg-[#0D0D0D] font-mono" style={{ height: "var(--tg-vh, 100dvh)" }}>
      <div className="bg-[#0A0A0A] border-b border-[#2E2E2E] px-4 h-14 flex items-center gap-2">
        <div className="w-7 h-7 border border-[#00FF00] flex items-center justify-center">
          <span className="text-[#00FF00] text-[11px] font-bold">L</span>
        </div>
        <span className="font-bold text-sm text-[#D9D9D9]">
          LABZ_<span className="text-[#00FF00]">APPLY</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <div className="text-[#00FF00] text-xs tracking-widest mb-1">// PARTNERSHIP APPLICATION</div>
          <p className="text-[#555] text-xs">Hi, <span className="text-[#D9D9D9]">{user.login}</span>. Select your role and fill in your details.</p>
        </div>

        {/* Type selector */}
        <div>
          <div className="text-[10px] text-[#555] mb-2 tracking-wider">APPLICATION_TYPE</div>
          <div className="grid grid-cols-2 gap-2">
            {(["kol", "project"] as const).map(t => (
              <button key={t} onClick={() => setAppType(t)}
                className={`py-2.5 font-bold text-xs border transition-all uppercase ${appType === t ? "bg-[#00FF00] text-black border-[#00FF00]" : "bg-transparent text-[#555] border-[#2E2E2E] hover:border-[#00FF00] hover:text-[#00FF00]"}`}>
                [{t === "kol" ? "KOL / Influencer" : "Project / Brand"}]
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">NAME / ALIAS *</div>
          <input className={inputCls} placeholder={appType === "kol" ? "Your name or alias" : "Project name"} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">TELEGRAM *</div>
          <input className={inputCls} placeholder="@username" value={telegram} onChange={e => setTelegram(e.target.value)} />
        </div>
        <div>
          <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">MAIN SOCIAL MEDIA *</div>
          <input className={inputCls} placeholder="Twitter / YouTube / etc." value={socialMedia} onChange={e => setSocialMedia(e.target.value)} />
        </div>
        <div>
          <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">ADDITIONAL LINK 1</div>
          <input className={inputCls} placeholder="Optional link" value={link1} onChange={e => setLink1(e.target.value)} />
        </div>
        <div>
          <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">ADDITIONAL LINK 2</div>
          <input className={inputCls} placeholder="Optional link" value={link2} onChange={e => setLink2(e.target.value)} />
        </div>
        <div>
          <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">ABOUT *</div>
          <textarea className={`${inputCls} resize-none`} rows={4}
            placeholder={appType === "kol" ? "Describe your audience, niche, experience..." : "Describe your project, goals, needs..."}
            value={about} onChange={e => setAbout(e.target.value)} />
        </div>

        {error && (
          <div className="text-[#FF4444] text-xs border border-[#FF4444]/30 bg-[#FF4444]/5 px-3 py-2">
            ERR: {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#00FF00] text-black px-4 py-3.5 font-bold text-sm hover:bg-[#00DD00] transition-colors disabled:opacity-50"
        >
          {loading ? "SUBMITTING..." : "SUBMIT_APPLICATION.EXE"}
        </button>
        <div className="h-4" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   RANK SYSTEM
══════════════════════════════════════════ */

const RANK_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  beginner: { label: "BEGINNER", color: "text-[#00CC44]", bg: "bg-[#00CC44]/10", border: "border-[#00CC44]/40" },
  advanced: { label: "ADVANCED", color: "text-[#4488FF]", bg: "bg-[#4488FF]/10", border: "border-[#4488FF]/40" },
  elite:    { label: "ELITE",    color: "text-[#FF4444]", bg: "bg-[#FF4444]/10", border: "border-[#FF4444]/40" },
  early:    { label: "EARLY",    color: "text-[#FFB800]", bg: "bg-[#FFB800]/10", border: "border-[#FFB800]/40" },
};

function RankBadge({ rank }: { rank: string }) {
  const r = RANK_STYLES[rank] ?? RANK_STYLES.beginner;
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold border ${r.color} ${r.bg} ${r.border} tracking-widest`}>
      {r.label}
    </span>
  );
}

/* ══════════════════════════════════════════
   CAMPAIGN APPLY MODAL
══════════════════════════════════════════ */

function CampaignApplyModal({ campaign, user, onClose, onSuccess }: {
  campaign: Campaign;
  user: AuthUser;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const formFields: FormField[] = campaign.formFields ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submitMut = useSubmitCampaignApplication();

  const inputCls = "w-full bg-[#080808] border border-[#2E2E2E] text-[#D9D9D9] text-sm px-3 py-2.5 font-mono placeholder:text-[#333] focus:outline-none focus:border-[#00FF00] transition-colors resize-none";

  const handleSubmit = async () => {
    for (const f of formFields) {
      if (f.required && !answers[f.id]?.trim()) {
        setError(`Field "${f.label}" is required`);
        return;
      }
    }
    setSubmitting(true);
    setError("");
    try {
      await submitMut.mutateAsync({ campaignId: campaign.id, userId: user.id, answers });
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (e: any) {
      const msg = e?.message || "Submission failed";
      setError(msg.includes("Already applied") ? "You have already applied to this campaign" : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "tween", duration: 0.25 }}
        className="w-full max-w-lg bg-[#0D0D0D] border border-[#2E2E2E] border-b-0 font-mono"
        style={{ maxHeight: "85dvh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2E2E2E] bg-[#0A0A0A] flex-shrink-0">
          <div>
            <div className="text-[#00FF00] text-[10px] tracking-widest">// CAMPAIGN_APPLICATION</div>
            <div className="text-[#D9D9D9] text-sm font-bold mt-0.5 truncate max-w-[240px]">{campaign.title}</div>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#FF4444] transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 border-2 border-[#00FF00] flex items-center justify-center mb-3">
              <span className="text-[#00FF00] text-2xl">✓</span>
            </div>
            <div className="text-[#00FF00] text-xs tracking-widest mb-1">// SUBMITTED</div>
            <div className="text-[#D9D9D9] font-bold">Application sent!</div>
          </div>
        ) : (
          <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(85dvh - 100px)" }}>
            <div className="text-[#555] text-xs">
              Applying as <span className="text-[#D9D9D9]">@{user.login}</span>
            </div>

            {formFields.length === 0 ? (
              <div className="text-[#555] text-xs py-4 text-center">This campaign has no custom form. Just confirm to apply.</div>
            ) : formFields.map((field) => (
              <div key={field.id}>
                <div className="text-[10px] text-[#555] mb-1.5 tracking-wider">
                  {field.label.toUpperCase()}{field.required && " *"}
                </div>
                {field.type === "textarea" ? (
                  <textarea
                    className={`${inputCls} h-24`}
                    placeholder={field.placeholder}
                    value={answers[field.id] ?? ""}
                    onChange={e => setAnswers(a => ({ ...a, [field.id]: e.target.value }))}
                  />
                ) : field.type === "select" && field.options?.length ? (
                  <select
                    className={inputCls}
                    value={answers[field.id] ?? ""}
                    onChange={e => setAnswers(a => ({ ...a, [field.id]: e.target.value }))}
                  >
                    <option value="">— Select —</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
                    className={inputCls}
                    placeholder={field.placeholder}
                    value={answers[field.id] ?? ""}
                    onChange={e => setAnswers(a => ({ ...a, [field.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="text-[#FF4444] text-xs border border-[#FF4444]/30 bg-[#FF4444]/5 px-3 py-2">
                ERR: {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[#00FF00] text-black px-4 py-3.5 font-bold text-sm hover:bg-[#00DD00] transition-colors disabled:opacity-50"
            >
              {submitting ? "SUBMITTING..." : "SUBMIT_APPLICATION.EXE"}
            </button>
            <div className="h-2" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════
   KOL CONTENT PANELS (shared by dashboard & main app)
══════════════════════════════════════════ */

type KolTab = "profile" | "feed" | "campaigns" | "my-applications";

const CAMPAIGN_CATEGORIES = [
  { id: "socialfi",   label: "SocialFi",   desc: "Social media & content campaigns" },
  { id: "infofi",     label: "InfoFi",     desc: "Information & analytics campaigns" },
  { id: "affiliate",  label: "Affiliate",  desc: "Referral & affiliate programs" },
  { id: "ambassador", label: "Ambassador", desc: "Brand ambassador opportunities" },
  { id: "other",      label: "Other",      desc: "Miscellaneous campaigns" },
];

function KolContent({ user, appRecord, activeTab }: {
  user: AuthUser; appRecord: AppRecord; activeTab: KolTab;
}) {
  const qc = useQueryClient();
  const [openedCategory, setOpenedCategory] = useState<string | null>(null);

  // Apply modal state
  const [applyingCampaign, setApplyingCampaign] = useState<Campaign | null>(null);

  // Profile state
  const { data: userProfile } = useGetUser(user.id);
  const { mutateAsync: updateProfile } = useUpdateUserProfile();

  const [evmWallet, setEvmWallet] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);

  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);

  // Feed state
  const { data: posts = [] } = useListPosts();

  // Campaigns state
  const { data: allCampaigns = [] } = useListCampaigns();
  const { data: allTags = [] } = useListTags({});
  const { data: userSubmissions = [] } = useListUserSubmissions(user.id);
  const appliedCampaignIds = new Set(userSubmissions.map((s: any) => s.campaignId));
  const categoryCount = (id: string) => allCampaigns.filter((c) => c.type === id).length;
  const categoryCampaigns = openedCategory ? allCampaigns.filter((c) => c.type === openedCategory) : [];

  const inputCls = "w-full bg-[#080808] border border-[#2E2E2E] text-[#D9D9D9] text-sm px-3 py-2.5 font-mono placeholder:text-[#333] focus:outline-none focus:border-[#00FF00] transition-colors resize-none";

  // Sync wallet field when profile loads
  useEffect(() => {
    if (userProfile?.evmWallet !== undefined) setEvmWallet(userProfile.evmWallet ?? "");
  }, [userProfile?.evmWallet]);

  const saveWallet = async () => {
    setSavingWallet(true);
    await updateProfile({ id: user.id, data: { evmWallet: evmWallet || null, bio: userProfile?.bio ?? null } });
    qc.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
    setSavingWallet(false);
    setWalletSaved(true);
    setTimeout(() => setWalletSaved(false), 2000);
  };

  const startBioEdit = () => {
    setBio(userProfile?.bio ?? "");
    setEditingBio(true);
  };

  const saveBio = async () => {
    setSavingBio(true);
    await updateProfile({ id: user.id, data: { evmWallet: userProfile?.evmWallet ?? null, bio: bio || null } });
    qc.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
    setSavingBio(false);
    setEditingBio(false);
  };

  const rank = userProfile?.rank ?? "beginner";

  return (
    <>
    <AnimatePresence mode="wait">

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 space-y-4">

              {/* Identity */}
              <div className="border border-[#1A1A1A] p-4 space-y-3">
                <div className="text-[10px] text-[#555] tracking-widest">// IDENTITY</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#444] mb-0.5">NICKNAME</div>
                    <div className="text-[#D9D9D9] text-base font-bold">{user.login}</div>
                  </div>
                  <RankBadge rank={rank} />
                </div>
                <div className="flex items-center gap-3 pt-1 text-[10px]">
                  <span className="text-[#444]">ROLE</span>
                  <span className="text-[#D9D9D9] uppercase">{appRecord.type}</span>
                  <span className="ml-auto text-[#444]">STATUS</span>
                  <span className="text-[#00FF00]">VERIFIED</span>
                </div>
              </div>

              {/* Social Networks */}
              <div className="border border-[#1A1A1A] p-4 space-y-2.5">
                <div className="text-[10px] text-[#555] tracking-widest mb-1">// SOCIAL_NETWORKS</div>
                {appRecord.telegram && (
                  <div className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-[#229ED9] flex-shrink-0" />
                    <span className="text-[10px] text-[#444] w-16 flex-shrink-0">TELEGRAM</span>
                    <a
                      href={`https://t.me/${appRecord.telegram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#229ED9] hover:underline truncate"
                    >
                      {appRecord.telegram.startsWith("@") ? appRecord.telegram : `@${appRecord.telegram}`}
                    </a>
                  </div>
                )}
                {appRecord.socialMedia && (
                  <div className="flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-[#00FF00] flex-shrink-0" />
                    <span className="text-[10px] text-[#444] w-16 flex-shrink-0">MAIN</span>
                    <a
                      href={appRecord.socialMedia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#D9D9D9] hover:text-[#00FF00] hover:underline truncate"
                    >
                      {appRecord.socialMedia}
                    </a>
                  </div>
                )}
                {appRecord.additionalLink1 && (
                  <div className="flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
                    <span className="text-[10px] text-[#444] w-16 flex-shrink-0">LINK 1</span>
                    <a
                      href={appRecord.additionalLink1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#D9D9D9] hover:text-[#00FF00] hover:underline truncate"
                    >
                      {appRecord.additionalLink1}
                    </a>
                  </div>
                )}
                {appRecord.additionalLink2 && (
                  <div className="flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
                    <span className="text-[10px] text-[#444] w-16 flex-shrink-0">LINK 2</span>
                    <a
                      href={appRecord.additionalLink2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#D9D9D9] hover:text-[#00FF00] hover:underline truncate"
                    >
                      {appRecord.additionalLink2}
                    </a>
                  </div>
                )}
                {!appRecord.telegram && !appRecord.socialMedia && !appRecord.additionalLink1 && (
                  <div className="text-xs text-[#333]">No social networks linked</div>
                )}
              </div>

              {/* EVM Wallet */}
              <div className="border border-[#1A1A1A] p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-[#555] tracking-widest">
                  <Wallet className="w-3 h-3" />// EVM_WALLET
                </div>
                <input
                  className={inputCls}
                  placeholder="0x..."
                  value={evmWallet}
                  onChange={e => setEvmWallet(e.target.value)}
                />
                <button
                  onClick={saveWallet}
                  disabled={savingWallet}
                  className={`w-full flex items-center justify-center gap-1.5 py-2.5 font-bold text-xs border transition-all disabled:opacity-50 ${
                    walletSaved
                      ? "bg-[#00FF00]/10 border-[#00FF00] text-[#00FF00]"
                      : "bg-transparent border-[#2E2E2E] text-[#555] hover:border-[#00FF00] hover:text-[#00FF00]"
                  }`}
                >
                  <Save className="w-3 h-3" />
                  {savingWallet ? "SAVING..." : walletSaved ? "SAVED ✓" : "SAVE_WALLET.EXE"}
                </button>
              </div>

              {/* Bio */}
              <div className="border border-[#1A1A1A] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#555] tracking-widest">
                    <FileText className="w-3 h-3" />// BIO
                  </div>
                  {!editingBio && (
                    <button
                      onClick={startBioEdit}
                      className="text-[10px] text-[#555] hover:text-[#00FF00] transition-colors"
                    >
                      [EDIT]
                    </button>
                  )}
                </div>
                {editingBio ? (
                  <>
                    <textarea
                      className={`${inputCls} h-24`}
                      placeholder="Tell us about yourself..."
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveBio}
                        disabled={savingBio}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold text-xs bg-[#00FF00] text-black hover:bg-[#00DD00] transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />{savingBio ? "SAVING..." : "SAVE_BIO.EXE"}
                      </button>
                      <button
                        onClick={() => setEditingBio(false)}
                        className="px-4 py-2.5 font-bold text-xs border border-[#2E2E2E] text-[#555] hover:border-[#FF4444] hover:text-[#FF4444] transition-colors"
                      >
                        [X]
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-[#D9D9D9] leading-relaxed whitespace-pre-wrap min-h-[2rem]">
                    {userProfile?.bio ?? <span className="text-[#333]">Not set</span>}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── FEED TAB ── */}
          {activeTab === "feed" && (
            <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
              <div className="text-[10px] text-[#555] tracking-widest mb-2">// INFOFI_FEED</div>
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Rss className="w-8 h-8 text-[#333] mb-4" />
                  <div className="text-[#333] text-xs">No posts yet</div>
                </div>
              ) : posts.map((post) => (
                <div key={post.id} className="border border-[#1A1A1A] p-4 bg-[#080808] space-y-2">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="w-full max-h-48 object-cover border border-[#1A1A1A]" />
                  )}
                  <div className="text-[#00FF00] text-xs font-bold">{post.title}</div>
                  <div className="text-[#D9D9D9] text-xs leading-relaxed whitespace-pre-wrap">{post.content}</div>
                  <div className="text-[#333] text-[10px]">
                    {new Date(post.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── CAMPAIGNS TAB ── */}
          {activeTab === "campaigns" && (
            <motion.div key="campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              {/* Category blocks */}
              <div className="p-4 space-y-3">
                <div className="text-[10px] text-[#555] tracking-widest mb-3">// SELECT_CAMPAIGN_TYPE</div>
                {CAMPAIGN_CATEGORIES.map((cat) => {
                  const count = categoryCount(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setOpenedCategory(cat.id)}
                      className="w-full flex items-center justify-between border border-[#2E2E2E] bg-[#080808] hover:border-[#00FF00] hover:bg-[#0D0D0D] transition-all group px-4 py-4"
                    >
                      <div className="text-left">
                        <div className="text-[#D9D9D9] font-bold text-sm group-hover:text-[#00FF00] transition-colors">
                          {cat.label}
                        </div>
                        <div className="text-[#444] text-[10px] mt-0.5">{cat.desc}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {count > 0 && (
                          <span className="text-[10px] font-bold text-[#00FF00] border border-[#00FF00]/30 bg-[#00FF00]/10 px-2 py-0.5">
                            {count}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-[#444] group-hover:text-[#00FF00] transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Overlay: campaign list */}
              <AnimatePresence>
                {openedCategory && (
                  <motion.div
                    key={openedCategory}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.22 }}
                    className="absolute inset-0 bg-[#0D0D0D] z-10 flex flex-col"
                    style={{ minHeight: "100%" }}
                  >
                    {/* Overlay header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2E2E2E] bg-[#0A0A0A] flex-shrink-0">
                      <button
                        onClick={() => setOpenedCategory(null)}
                        className="flex items-center gap-1.5 text-[#555] text-xs hover:text-[#00FF00] transition-colors font-bold"
                      >
                        <span className="text-base leading-none">←</span> BACK
                      </button>
                      <div className="h-4 w-px bg-[#2E2E2E]" />
                      <span className="text-[#D9D9D9] text-xs font-bold uppercase tracking-widest">
                        {CAMPAIGN_CATEGORIES.find(c => c.id === openedCategory)?.label}
                      </span>
                    </div>

                    {/* Overlay content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {categoryCampaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Briefcase className="w-8 h-8 text-[#333] mb-4" />
                          <div className="text-[#333] text-xs">
                            No {CAMPAIGN_CATEGORIES.find(c => c.id === openedCategory)?.label} campaigns yet
                          </div>
                        </div>
                      ) : (
                        categoryCampaigns.map((c, idx) => (
                          <CampaignCard
                            key={c.id}
                            data={c}
                            index={idx}
                            compact
                            allTags={allTags}
                            onApply={setApplyingCampaign}
                            hasApplied={appliedCampaignIds.has(c.id)}
                          />
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── MY APPLICATIONS TAB ── */}
          {activeTab === "my-applications" && (
            <motion.div key="my-applications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
              <div className="text-[10px] text-[#555] tracking-widest mb-3">// MY_CAMPAIGN_APPLICATIONS</div>
              {userSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ClipboardList className="w-8 h-8 text-[#333] mb-4" />
                  <div className="text-[#333] text-xs">No applications yet</div>
                  <div className="text-[#222] text-[10px] mt-1">Apply to campaigns to see them here</div>
                </div>
              ) : (
                (userSubmissions as any[]).map((sub) => {
                  const statusColors: Record<string, { icon: any; color: string; label: string }> = {
                    pending:  { icon: Clock,        color: "text-[#FFB800]", label: "PENDING" },
                    approved: { icon: CheckCircle,  color: "text-[#00FF00]", label: "APPROVED" },
                    rejected: { icon: XCircle,      color: "text-[#FF4444]", label: "REJECTED" },
                  };
                  const s = statusColors[sub.status] ?? statusColors.pending;
                  const StatusIcon = s.icon;
                  return (
                    <div key={sub.id} className="border border-[#2E2E2E] bg-[#080808] p-3 flex items-start gap-3">
                      {sub.campaignImageUrl && (
                        <img src={sub.campaignImageUrl} alt="" className="w-14 h-14 object-cover flex-shrink-0 border border-[#1A1A1A] grayscale opacity-70" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[#D9D9D9] text-sm font-bold font-mono leading-tight line-clamp-1">
                          {sub.campaignTitle ?? "Campaign"}
                        </div>
                        <div className="text-[#444] text-[10px] font-mono mt-0.5 uppercase">{sub.campaignType}</div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <StatusIcon className={`w-3.5 h-3.5 ${s.color}`} />
                          <span className={`text-[10px] font-bold font-mono ${s.color}`}>{s.label}</span>
                        </div>
                        <div className="text-[#333] text-[10px] font-mono mt-1">
                          {new Date(sub.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}

    </AnimatePresence>

    {/* Apply Modal */}
    <AnimatePresence>
      {applyingCampaign && (
        <CampaignApplyModal
          campaign={applyingCampaign}
          user={user}
          onClose={() => setApplyingCampaign(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ["/api/submissions/user", user.id] });
          }}
        />
      )}
    </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════
   PROJECT CONTENT PANELS
══════════════════════════════════════════ */

type ProjectTab = "profile" | "feed" | "kols" | "cart";

const OFFER_OPTIONS = [
  { id: "equity",  label: "EQUITY",  desc: "Stake in the project" },
  { id: "tokens",  label: "TOKENS",  desc: "Token allocation" },
  { id: "usdt",    label: "USDT",    desc: "Stablecoin payment" },
  { id: "other",   label: "OTHER",   desc: "Custom arrangement" },
];

interface SubmitFormData {
  projectName: string;
  twitterLink: string;
  websiteLink: string;
  projectInfo: string;
  campaignInfo: string;
  offer: string;
}

function ProjectContent({ user, appRecord, activeTab }: {
  user: AuthUser; appRecord: AppRecord; activeTab: ProjectTab;
}) {
  const qc = useQueryClient();

  // Cart state — KOL ids in cart
  const [cart, setCart] = useState<Set<number>>(new Set());

  // Profile state
  const { data: userProfile } = useGetUser(user.id);
  const { mutateAsync: updateProfile } = useUpdateUserProfile();
  const [evmWallet, setEvmWallet] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);

  // Feed state
  const { data: posts = [] } = useListPosts();

  // KOLs state
  const { data: allKols = [] } = useListKols();

  // My project requests
  const { data: myRequests = [] } = useListUserProjectRequests(user.id);
  const { mutateAsync: createRequest, isPending: submitting } = useCreateProjectRequest();

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [form, setForm] = useState<SubmitFormData>({
    projectName: "", twitterLink: "", websiteLink: "", projectInfo: "", campaignInfo: "", offer: "tokens",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const inputCls = "w-full bg-[#080808] border border-[#2E2E2E] text-[#D9D9D9] text-sm px-3 py-2.5 font-mono placeholder:text-[#333] focus:outline-none focus:border-[#00FF00] transition-colors resize-none";

  useEffect(() => {
    if (userProfile?.evmWallet !== undefined) setEvmWallet(userProfile.evmWallet ?? "");
  }, [userProfile?.evmWallet]);

  const saveWallet = async () => {
    setSavingWallet(true);
    await updateProfile({ id: user.id, data: { evmWallet: evmWallet || null, bio: userProfile?.bio ?? null } });
    qc.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
    setSavingWallet(false);
    setWalletSaved(true);
    setTimeout(() => setWalletSaved(false), 2000);
  };

  const startBioEdit = () => { setBio(userProfile?.bio ?? ""); setEditingBio(true); };
  const saveBio = async () => {
    setSavingBio(true);
    await updateProfile({ id: user.id, data: { evmWallet: userProfile?.evmWallet ?? null, bio: bio || null } });
    qc.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
    setSavingBio(false);
    setEditingBio(false);
  };

  const toggleCart = (kolId: number) => {
    setCart((prev) => {
      const next = new Set(prev);
      if (next.has(kolId)) next.delete(kolId);
      else next.add(kolId);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!form.projectName || !form.twitterLink || !form.websiteLink || !form.projectInfo || !form.campaignInfo) {
      setSubmitError("Please fill in all required fields.");
      return;
    }
    try {
      await createRequest({
        userId: user.id,
        projectName: form.projectName,
        twitterLink: form.twitterLink,
        websiteLink: form.websiteLink,
        projectInfo: form.projectInfo,
        campaignInfo: form.campaignInfo,
        offer: form.offer,
        selectedKolIds: Array.from(cart),
      });
      setSubmitSuccess(true);
      setCart(new Set());
      setForm({ projectName: "", twitterLink: "", websiteLink: "", projectInfo: "", campaignInfo: "", offer: "tokens" });
      setTimeout(() => { setSubmitSuccess(false); setShowSubmitModal(false); }, 2200);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Submission failed");
    }
  };

  const rank = userProfile?.rank ?? "beginner";
  const cartKols = allKols.filter((k) => cart.has(k.id));

  const statusColors: Record<string, { color: string; label: string; icon: any }> = {
    pending:  { color: "text-[#FFB800]", label: "PENDING",  icon: Clock },
    approved: { color: "text-[#00FF00]", label: "APPROVED", icon: CheckCircle },
    rejected: { color: "text-[#FF4444]", label: "REJECTED", icon: XCircle },
  };

  return (
    <>
    <AnimatePresence mode="wait">

      {/* ── PROFILE TAB ── */}
      {activeTab === "profile" && (
        <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 space-y-4">

          {/* Identity */}
          <div className="border border-[#1A1A1A] p-4 space-y-3">
            <div className="text-[10px] text-[#555] tracking-widest">// IDENTITY</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#444] mb-0.5">NICKNAME</div>
                <div className="text-[#D9D9D9] text-base font-bold">{user.login}</div>
              </div>
              <RankBadge rank={rank} />
            </div>
            <div className="flex items-center gap-3 pt-1 text-[10px]">
              <span className="text-[#444]">ROLE</span>
              <span className="text-[#00BFFF] uppercase">{appRecord.type}</span>
              <span className="ml-auto text-[#444]">STATUS</span>
              <span className="text-[#00FF00]">VERIFIED</span>
            </div>
          </div>

          {/* Social Networks */}
          <div className="border border-[#1A1A1A] p-4 space-y-2.5">
            <div className="text-[10px] text-[#555] tracking-widest mb-1">// SOCIAL_NETWORKS</div>
            {appRecord.telegram && (
              <div className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-[#229ED9] flex-shrink-0" />
                <span className="text-[10px] text-[#444] w-16 flex-shrink-0">TELEGRAM</span>
                <a href={`https://t.me/${appRecord.telegram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-[#229ED9] hover:underline truncate">
                  {appRecord.telegram.startsWith("@") ? appRecord.telegram : `@${appRecord.telegram}`}
                </a>
              </div>
            )}
            {appRecord.socialMedia && (
              <div className="flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-[#00FF00] flex-shrink-0" />
                <span className="text-[10px] text-[#444] w-16 flex-shrink-0">WEBSITE</span>
                <a href={appRecord.socialMedia} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-[#D9D9D9] hover:text-[#00FF00] hover:underline truncate">
                  {appRecord.socialMedia}
                </a>
              </div>
            )}
            {!appRecord.telegram && !appRecord.socialMedia && (
              <div className="text-xs text-[#333]">No social networks linked</div>
            )}
          </div>

          {/* EVM Wallet */}
          <div className="border border-[#1A1A1A] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] text-[#555] tracking-widest">
              <Wallet className="w-3 h-3" />// EVM_WALLET
            </div>
            <input className={inputCls} placeholder="0x..." value={evmWallet} onChange={e => setEvmWallet(e.target.value)} />
            <button onClick={saveWallet} disabled={savingWallet}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 font-bold text-xs border transition-all disabled:opacity-50 ${
                walletSaved ? "bg-[#00FF00]/10 border-[#00FF00] text-[#00FF00]" : "bg-transparent border-[#2E2E2E] text-[#555] hover:border-[#00FF00] hover:text-[#00FF00]"
              }`}>
              <Save className="w-3 h-3" />{savingWallet ? "SAVING..." : walletSaved ? "SAVED ✓" : "SAVE_WALLET.EXE"}
            </button>
          </div>

          {/* Bio */}
          <div className="border border-[#1A1A1A] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-[#555] tracking-widest">
                <FileText className="w-3 h-3" />// BIO
              </div>
              {!editingBio && (
                <button onClick={startBioEdit} className="text-[10px] text-[#555] hover:text-[#00FF00] transition-colors">[EDIT]</button>
              )}
            </div>
            {editingBio ? (
              <>
                <textarea className={`${inputCls} h-24`} placeholder="Tell us about your project..." value={bio} onChange={e => setBio(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={saveBio} disabled={savingBio}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold text-xs bg-[#00FF00] text-black hover:bg-[#00DD00] transition-colors disabled:opacity-50">
                    <Save className="w-3 h-3" />{savingBio ? "SAVING..." : "SAVE_BIO.EXE"}
                  </button>
                  <button onClick={() => setEditingBio(false)}
                    className="px-4 py-2.5 font-bold text-xs border border-[#2E2E2E] text-[#555] hover:border-[#FF4444] hover:text-[#FF4444] transition-colors">
                    [X]
                  </button>
                </div>
              </>
            ) : (
              <div className="text-xs text-[#D9D9D9] leading-relaxed whitespace-pre-wrap min-h-[2rem]">
                {userProfile?.bio ?? <span className="text-[#333]">Not set</span>}
              </div>
            )}
          </div>

          {/* My Project Requests */}
          <div className="border border-[#1A1A1A] p-4 space-y-3">
            <div className="text-[10px] text-[#555] tracking-widest">// MY_CAMPAIGN_REQUESTS</div>
            {myRequests.length === 0 ? (
              <div className="text-xs text-[#333] py-4 text-center">No requests submitted yet</div>
            ) : (
              (myRequests as ProjectRequest[]).map((req) => {
                const s = statusColors[req.status] ?? statusColors.pending;
                const StatusIcon = s.icon;
                return (
                  <div key={req.id} className="border border-[#2E2E2E] bg-[#080808] p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[#D9D9D9] text-sm font-bold font-mono leading-tight">{req.projectName}</div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <StatusIcon className={`w-3.5 h-3.5 ${s.color}`} />
                        <span className={`text-[10px] font-bold font-mono ${s.color}`}>{s.label}</span>
                      </div>
                    </div>
                    <div className="text-[#444] text-[10px] font-mono uppercase">OFFER: {req.offer}</div>
                    <div className="text-[#444] text-[10px] font-mono">
                      KOLs selected: <span className="text-[#D9D9D9]">{(req.selectedKolIds ?? []).length}</span>
                    </div>
                    <div className="text-[#333] text-[10px] font-mono">
                      {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </motion.div>
      )}

      {/* ── FEED TAB ── */}
      {activeTab === "feed" && (
        <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
          <div className="text-[10px] text-[#555] tracking-widest mb-2">// INFOFI_FEED</div>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Rss className="w-8 h-8 text-[#333] mb-4" />
              <div className="text-[#333] text-xs">No posts yet</div>
            </div>
          ) : posts.map((post) => (
            <div key={post.id} className="border border-[#1A1A1A] p-4 bg-[#080808] space-y-2">
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full max-h-48 object-cover border border-[#1A1A1A]" />
              )}
              <div className="text-[#00FF00] text-xs font-bold">{post.title}</div>
              <div className="text-[#D9D9D9] text-xs leading-relaxed whitespace-pre-wrap">{post.content}</div>
              <div className="text-[#333] text-[10px]">
                {new Date(post.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── KOL TAB ── */}
      {activeTab === "kols" && (
        <motion.div key="kols" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-[#555] tracking-widest">// SELECT_INFLUENCERS</div>
            {cart.size > 0 && (
              <span className="text-[10px] font-bold text-[#00FF00] border border-[#00FF00]/30 bg-[#00FF00]/10 px-2 py-0.5">
                {cart.size} SELECTED
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {allKols.map((kol) => {
              const inCart = cart.has(kol.id);
              return (
                <div key={kol.id} className="relative border border-[#1A1A1A] bg-[#080808] p-3 space-y-2">
                  {kol.imageUrl && (
                    <img src={kol.imageUrl} alt={kol.name} className="w-full aspect-square object-cover border border-[#1A1A1A] grayscale" />
                  )}
                  <div className="text-[#D9D9D9] text-xs font-bold font-mono leading-tight line-clamp-1">{kol.name}</div>
                  <div className="text-[#444] text-[10px] font-mono uppercase truncate">{kol.niche}</div>
                  <div className="text-[#555] text-[10px] font-mono">{kol.followers} followers</div>
                  <button
                    onClick={() => toggleCart(kol.id)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 font-bold text-xs border transition-all ${
                      inCart
                        ? "bg-[#00FF00]/10 border-[#00FF00] text-[#00FF00]"
                        : "bg-transparent border-[#2E2E2E] text-[#555] hover:border-[#00FF00] hover:text-[#00FF00]"
                    }`}
                  >
                    {inCart ? <><Minus className="w-3 h-3" /> REMOVE</> : <><Plus className="w-3 h-3" /> ADD</>}
                  </button>
                </div>
              );
            })}
            {allKols.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-8 h-8 text-[#333] mb-4" />
                <div className="text-[#333] text-xs">No KOLs available yet</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── CART TAB ── */}
      {activeTab === "cart" && (
        <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
          <div className="text-[10px] text-[#555] tracking-widest">// CAMPAIGN_CART</div>

          {cartKols.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="w-8 h-8 text-[#333] mb-4" />
              <div className="text-[#333] text-xs">Cart is empty</div>
              <div className="text-[#222] text-[10px] mt-1">Add KOLs from the KOL tab</div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {cartKols.map((kol) => (
                  <div key={kol.id} className="flex items-center gap-3 border border-[#2E2E2E] bg-[#080808] p-3">
                    {kol.imageUrl && (
                      <img src={kol.imageUrl} alt={kol.name} className="w-10 h-10 object-cover flex-shrink-0 border border-[#1A1A1A] grayscale" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[#D9D9D9] text-xs font-bold font-mono leading-tight">{kol.name}</div>
                      <div className="text-[#444] text-[10px] font-mono uppercase">{kol.niche}</div>
                    </div>
                    <button
                      onClick={() => toggleCart(kol.id)}
                      className="w-7 h-7 border border-[#2E2E2E] flex items-center justify-center text-[#555] hover:border-[#FF4444] hover:text-[#FF4444] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setSubmitError(""); setShowSubmitModal(true); }}
                className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-sm bg-[#00FF00] text-black hover:bg-[#00DD00] transition-colors"
              >
                <Send className="w-4 h-4" /> SUBMIT_CAMPAIGN.EXE
              </button>
            </>
          )}
        </motion.div>
      )}

    </AnimatePresence>

    {/* ── SUBMIT FORM MODAL ── */}
    <AnimatePresence>
      {showSubmitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSubmitModal(false); }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="w-full max-w-sm bg-[#0A0A0A] border border-[#2E2E2E] max-h-[85dvh] flex flex-col"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A] flex-shrink-0">
              <div className="text-[10px] text-[#555] tracking-widest">// SUBMIT_CAMPAIGN_REQUEST</div>
              <button onClick={() => setShowSubmitModal(false)} className="text-[#555] hover:text-[#FF4444] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {submitSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 border-2 border-[#00FF00] flex items-center justify-center mb-4">
                    <span className="text-[#00FF00] text-2xl">✓</span>
                  </div>
                  <div className="text-[#00FF00] text-xs tracking-widest mb-1">// REQUEST_SUBMITTED</div>
                  <p className="text-[#555] text-xs">We'll review your campaign request and get back to you.</p>
                </div>
              ) : (
                <>
                  {submitError && (
                    <div className="border border-[#FF4444]/30 bg-[#FF4444]/10 px-3 py-2 text-[#FF4444] text-xs font-mono">{submitError}</div>
                  )}

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#444] tracking-widest">PROJECT_NAME *</div>
                    <input
                      className={inputCls}
                      placeholder="My Awesome Project"
                      value={form.projectName}
                      onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#444] tracking-widest flex items-center gap-1"><Twitter className="w-3 h-3" /> TWITTER_LINK *</div>
                    <input
                      className={inputCls}
                      placeholder="https://twitter.com/yourproject"
                      value={form.twitterLink}
                      onChange={e => setForm(f => ({ ...f, twitterLink: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#444] tracking-widest flex items-center gap-1"><Globe className="w-3 h-3" /> WEBSITE_LINK *</div>
                    <input
                      className={inputCls}
                      placeholder="https://yourproject.com"
                      value={form.websiteLink}
                      onChange={e => setForm(f => ({ ...f, websiteLink: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#444] tracking-widest">PROJECT_INFO *</div>
                    <textarea
                      className={`${inputCls} h-20`}
                      placeholder="Brief description of your project..."
                      value={form.projectInfo}
                      onChange={e => setForm(f => ({ ...f, projectInfo: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-[#444] tracking-widest">CAMPAIGN_INFO *</div>
                    <textarea
                      className={`${inputCls} h-20`}
                      placeholder="What do you want KOLs to promote? Goals, timeline, requirements..."
                      value={form.campaignInfo}
                      onChange={e => setForm(f => ({ ...f, campaignInfo: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] text-[#444] tracking-widest">COMPENSATION_TYPE *</div>
                    <div className="grid grid-cols-2 gap-2">
                      {OFFER_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setForm(f => ({ ...f, offer: opt.id }))}
                          className={`p-3 border text-left transition-all ${
                            form.offer === opt.id
                              ? "border-[#00FF00] bg-[#00FF00]/10"
                              : "border-[#2E2E2E] bg-[#080808] hover:border-[#00FF00]/50"
                          }`}
                        >
                          <div className={`text-xs font-bold font-mono ${form.offer === opt.id ? "text-[#00FF00]" : "text-[#D9D9D9]"}`}>{opt.label}</div>
                          <div className="text-[10px] text-[#444] mt-0.5">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-[#1A1A1A] bg-[#080808] p-3">
                    <div className="text-[10px] text-[#444] mb-2">SELECTED_KOLS ({cartKols.length})</div>
                    {cartKols.length === 0 ? (
                      <div className="text-[#333] text-[10px]">No KOLs selected — you can still submit</div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {cartKols.map(k => (
                          <span key={k.id} className="text-[10px] font-mono border border-[#2E2E2E] px-2 py-0.5 text-[#D9D9D9]">{k.name}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-sm bg-[#00FF00] text-black hover:bg-[#00DD00] transition-colors disabled:opacity-60 mt-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "SUBMITTING..." : "SEND_REQUEST.EXE"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════
   ACCOUNT PANEL (logged-in states)
══════════════════════════════════════════ */

function WaitingScreen({ user, appRecord, onLogout }: { user: AuthUser; appRecord: AppRecord | null; onLogout: () => void }) {
  const isVerified = appRecord?.status === "verified";
  const isRejected = appRecord?.status === "rejected";

  return (
    <div className="flex flex-col bg-[#0D0D0D] font-mono" style={{ height: "var(--tg-vh, 100dvh)" }}>
      <div className="bg-[#0A0A0A] border-b border-[#2E2E2E] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border border-[#00FF00] flex items-center justify-center">
            <span className="text-[#00FF00] text-[11px] font-bold">L</span>
          </div>
          <span className="font-bold text-sm text-[#D9D9D9]">
            LABZ_<span className="text-[#00FF00]">ACCOUNT</span>
          </span>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-[#555] text-xs hover:text-[#FF4444] transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          <span>LOGOUT</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {isVerified ? (
          <>
            <div className="w-16 h-16 border-2 border-[#00FF00] flex items-center justify-center mb-4">
              <span className="text-[#00FF00] text-3xl">✓</span>
            </div>
            <div className="text-[#00FF00] text-xs tracking-widest mb-2">// ACCESS GRANTED</div>
            <h2 className="text-[#D9D9D9] text-xl font-bold mb-2">Verified</h2>
            <p className="text-[#555] text-xs leading-relaxed max-w-xs">
              Your account <span className="text-[#D9D9D9]">@{user.login}</span> has been verified. Welcome to the LABZ network.
            </p>
            <div className="mt-6 border border-[#1A1A1A] p-4 w-full max-w-xs">
              <div className="text-[10px] text-[#444] space-y-1">
                <div className="flex justify-between"><span>STATUS</span><span className="text-[#00FF00]">VERIFIED</span></div>
                <div className="flex justify-between"><span>ROLE</span><span className="text-[#D9D9D9] uppercase">{appRecord?.type}</span></div>
                <div className="flex justify-between"><span>LOGIN</span><span className="text-[#D9D9D9]">{user.login}</span></div>
              </div>
            </div>
          </>
        ) : isRejected ? (
          <>
            <div className="w-16 h-16 border-2 border-[#FF4444] flex items-center justify-center mb-4">
              <span className="text-[#FF4444] text-3xl">✕</span>
            </div>
            <div className="text-[#FF4444] text-xs tracking-widest mb-2">// ACCESS DENIED</div>
            <h2 className="text-[#D9D9D9] text-xl font-bold mb-2">Not Approved</h2>
            <p className="text-[#555] text-xs leading-relaxed max-w-xs">
              Your application was not approved at this time. Please contact the LABZ team for more information.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-2 border-[#FFB800] flex items-center justify-center mb-4">
              <span className="text-[#FFB800] animate-pulse text-2xl font-bold">⋯</span>
            </div>
            <div className="text-[#FFB800] text-xs tracking-widest mb-2">// PENDING REVIEW</div>
            <h2 className="text-[#D9D9D9] text-xl font-bold mb-2">Waiting for verification</h2>
            <p className="text-[#555] text-xs leading-relaxed max-w-xs">
              Your application has been submitted and is currently under review. We'll notify you via Telegram once it's processed.
            </p>
            <div className="mt-6 border border-[#1A1A1A] p-4 w-full max-w-xs">
              <div className="text-[10px] text-[#444] space-y-1">
                <div className="flex justify-between"><span>STATUS</span><span className="text-[#FFB800]">PENDING</span></div>
                <div className="flex justify-between"><span>ROLE</span><span className="text-[#D9D9D9] uppercase">{appRecord?.type}</span></div>
                <div className="flex justify-between"><span>LOGIN</span><span className="text-[#D9D9D9]">{user.login}</span></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP PAGE
══════════════════════════════════════════ */

type MainView = "boot" | "main" | "account";

export default function AppPage() {
  const { isReady } = useTelegram();

  // Boot animation — show once per session
  const [mainView, setMainView] = useState<MainView>(() => {
    if (sessionStorage.getItem("labz_booted")) {
      return getStoredUser() ? "main" : "account";
    }
    return "boot";
  });

  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredUser());
  const [userApp, setUserApp] = useState<AppRecord | null>(null);
  const [appLoading, setAppLoading] = useState(false);

  // KOL tab state (for verified KOL users in main app)
  const [kolTab, setKolTab] = useState<KolTab>("profile");

  // Project tab state (for verified project users)
  const [projectTab, setProjectTab] = useState<ProjectTab>("profile");

  // Main content state
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<number | "All">("All");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: sections = [], isLoading: sectionsLoading } = useListSections();
  const { data: tags = [] } = useListTags(activeSectionId ? { sectionId: activeSectionId } : {});
  const { data: kols = [], isLoading: kolsLoading } = useListKols();
  const { data: campaigns = [], isLoading: campaignsLoading } = useListCampaigns();

  const isVerifiedKol = authUser && userApp?.status === "verified" && userApp?.type === "kol";
  const isVerifiedProject = authUser && userApp?.status === "verified" && userApp?.type === "project";
  const isVerifiedDashboard = isVerifiedKol || isVerifiedProject;

  const activeSections = sections
    .filter((s) => s.isActive)
    .filter((s) => !(isVerifiedKol && s.slug?.toLowerCase() === "kols"))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    if (!activeSectionId && activeSections.length > 0) setActiveSectionId(activeSections[0].id);
  }, [activeSections.length]);

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  // Auto-redirect verified users from account view → main view
  useEffect(() => {
    if (isVerifiedDashboard && mainView === "account") {
      setMainView("main");
    }
  }, [isVerifiedDashboard, mainView]);

  // Fetch user's application when logged in
  useEffect(() => {
    if (!authUser) { setUserApp(null); return; }
    setAppLoading(true);
    apiGet(`/applications/user/${authUser.id}`)
      .then(({ data }) => {
        const rawApps: any[] = Array.isArray(data) ? data : [];
        const apps: AppRecord[] = rawApps.map((a) => ({
          id: a.id, type: a.type, status: a.status, name: a.name,
          telegram: a.telegram, socialMedia: a.socialMedia,
          additionalLink1: a.additionalLink1, additionalLink2: a.additionalLink2,
        }));
        setUserApp(apps.length > 0 ? apps[apps.length - 1] : null);
      })
      .finally(() => setAppLoading(false));
  }, [authUser?.id]);

  const handleBoot = () => {
    sessionStorage.setItem("labz_booted", "1");
    setMainView(authUser ? "main" : "account");
  };

  const handleAuth = (user: AuthUser) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    storeUser(null);
    setAuthUser(null);
    setUserApp(null);
  };

  const handleAppSubmitted = () => {
    if (!authUser) return;
    apiGet(`/applications/user/${authUser.id}`).then(({ data }) => {
      const rawApps: any[] = Array.isArray(data) ? data : [];
      const apps: AppRecord[] = rawApps.map((a) => ({
        id: a.id, type: a.type, status: a.status, name: a.name,
        telegram: a.telegram, socialMedia: a.socialMedia,
        additionalLink1: a.additionalLink1, additionalLink2: a.additionalLink2,
      }));
      setUserApp(apps.length > 0 ? apps[apps.length - 1] : null);
    });
  };

  const activeSection = sections.find((s) => s.id === activeSectionId);
  const isKolSection = activeSection?.slug?.toLowerCase() === "kols";
  const hasActiveFilters = search || tagFilter !== "All";

  const getFilteredData = () => {
    if (!activeSection) return [];
    if (isKolSection) {
      return kols.filter(
        (k) => k.name.toLowerCase().includes(search.toLowerCase()) || k.niche.toLowerCase().includes(search.toLowerCase())
      );
    }
    const sectionCampaigns = campaigns.filter((c) => c.type === activeSection.slug);
    return sectionCampaigns.filter((c) => {
      const activeTagObj = tagFilter !== "All" ? tags.find((t) => t.id === tagFilter) : null;
      const matchesTag = tagFilter === "All" || (activeTagObj && c.tag === activeTagObj.name);
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      return matchesTag && matchesSearch;
    });
  };

  const currentData = getFilteredData();
  const isLoading = sectionsLoading || kolsLoading || campaignsLoading;

  const switchSection = (id: number) => {
    setActiveSectionId(id);
    setSearch("");
    setTagFilter("All");
    setShowSearch(false);
    setMainView("main");
  };

  // ── BOOT SCREEN ──────────────────────────
  if (!isReady && mainView === "boot") {
    return (
      <div className="flex items-center justify-center bg-[#0D0D0D] font-mono text-[#00FF00]"
           style={{ height: "var(--tg-vh, 100dvh)" }}>
        <span>C:\&gt; LOADING...<span className="cursor-blink" /></span>
      </div>
    );
  }

  if (mainView === "boot") {
    return <BootScreen onDone={handleBoot} />;
  }

  // ── ACCOUNT VIEW ─────────────────────────
  if (mainView === "account") {
    if (!authUser) {
      return <AuthScreen onAuth={handleAuth} />;
    }
    if (appLoading) {
      return (
        <div className="flex items-center justify-center bg-[#0D0D0D] font-mono text-[#00FF00]"
             style={{ height: "var(--tg-vh, 100dvh)" }}>
          <span>C:\&gt; LOADING PROFILE...<span className="cursor-blink" /></span>
        </div>
      );
    }
    if (!userApp) {
      return <ApplicationForm user={authUser} onSubmitted={handleAppSubmitted} />;
    }
    if (userApp.status === "verified") {
      return null; // redirected to main by useEffect
    }
    return <WaitingScreen user={authUser} appRecord={userApp} onLogout={handleLogout} />;
  }

  // ── MAIN APP ──────────────────────────────
  return (
    <div className="tma-root bg-[#0D0D0D] font-mono">

      {/* ── HEADER ────────────────────────────────── */}
      <header className="bg-[#0A0A0A] border-b border-[#2E2E2E]">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 border border-[#00FF00] flex items-center justify-center flex-shrink-0">
              <span className="text-[#00FF00] text-[11px] font-bold">L</span>
            </div>
            <span className="font-bold text-sm text-[#D9D9D9]">
              LABZ_<span className="text-[#00FF00]">{isVerifiedDashboard ? "DASHBOARD" : "APP"}</span>
            </span>
          </div>

          {isVerifiedDashboard ? (
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-[#555] text-xs hover:text-[#FF4444] transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          ) : (
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(""); setTagFilter("All"); }}
                className="text-[10px] text-[#555] border border-[#333] px-2 py-1 hover:border-[#FF4444] hover:text-[#FF4444] transition-colors"
              >
                [CLR]
              </button>
            )}
            <button
              onClick={() => setShowSearch((v) => !v)}
              className="w-9 h-9 border border-[#2E2E2E] bg-[#0A0A0A] flex items-center justify-center text-[#555] hover:text-[#00FF00] hover:border-[#00FF00] transition-colors"
            >
              {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
          )}
        </div>

        <AnimatePresence>
          {!isVerifiedDashboard && showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden border-t border-[#1A1A1A]"
            >
              <div className="px-4 py-3 bg-[#080808]">
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#00FF00] text-xs select-none">C:\&gt;</span>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder={`Search ${activeSection?.name ?? ""}…`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="console-input pl-12 w-full"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 text-[#555] hover:text-[#FF4444]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {!isKolSection && tags.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5 custom-scrollbar">
                    <button
                      onClick={() => setTagFilter("All")}
                      className={`flex-shrink-0 px-3 py-1 text-xs font-bold border transition-all ${
                        tagFilter === "All"
                          ? "bg-[#00FF00] text-black border-[#00FF00]"
                          : "bg-transparent text-[#555] border-[#333] hover:border-[#00FF00] hover:text-[#00FF00]"
                      }`}
                    >
                      [ALL]
                    </button>
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setTagFilter(tag.id)}
                        className={`flex-shrink-0 px-3 py-1 text-xs font-bold uppercase border transition-all ${
                          tagFilter === tag.id
                            ? "bg-[#00FF00] text-black border-[#00FF00]"
                            : "bg-transparent text-[#555] border-[#333] hover:border-[#00FF00] hover:text-[#00FF00]"
                        }`}
                      >
                        [{tag.name}]
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasActiveFilters && !showSearch && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#080808] border-t border-[#1A1A1A]">
            <SlidersHorizontal className="w-3 h-3 text-[#00FF00]" />
            <span className="text-[10px] text-[#00FF00]">FILTERS_ACTIVE</span>
          </div>
        )}
      </header>

      {/* ── CONTENT ─────────────────────────── */}
      <main className="tma-scroll bg-[#0D0D0D]">
        {isVerifiedKol && authUser && userApp ? (
          <KolContent user={authUser} appRecord={userApp} activeTab={kolTab} />
        ) : isVerifiedProject && authUser && userApp ? (
          <ProjectContent user={authUser} appRecord={userApp} activeTab={projectTab} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSectionId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4"
            >
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-[#2E2E2E] bg-[#0A0A0A] animate-pulse aspect-[3/4]" />
                  ))}
                </div>
              ) : currentData.length > 0 ? (
                isKolSection ? (
                  <div className="grid grid-cols-2 gap-3">
                    {(currentData as any[]).map((item, idx) => (
                      <KolCard key={item.id} data={item} index={idx} compact />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(currentData as any[]).map((item, idx) => (
                      <CampaignCard key={item.id} data={item} index={idx} compact allTags={tags} />
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-4xl text-[#333] mb-4 font-mono tracking-widest">[ 404 ]</div>
                  <h3 className="font-bold text-base text-[#00FF00] mb-2">// NO RESULTS FOUND</h3>
                  <p className="text-xs text-[#555] mb-6">Try adjusting search parameters</p>
                  <button
                    onClick={() => { setSearch(""); setTagFilter("All"); }}
                    className="console-btn text-sm"
                  >
                    CLEAR_FILTERS
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* ── BOTTOM NAV ─────────────────────── */}
      <nav
        className="bg-[#0A0A0A] border-t-2 border-[#2E2E2E]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 6px)" }}
      >
        <div className="flex">
          {isVerifiedKol ? (
            /* KOL tabs */
            <>
              {([ 
                { id: "profile"         as KolTab, label: "PROFILE",   icon: <User className="w-4 h-4" /> },
                { id: "feed"            as KolTab, label: "FEED",       icon: <Rss  className="w-4 h-4" /> },
                { id: "campaigns"       as KolTab, label: "CAMPAIGNS",  icon: <Briefcase className="w-4 h-4" /> },
                { id: "my-applications" as KolTab, label: "MY APPS",    icon: <ClipboardList className="w-4 h-4" /> },
              ]).map((t) => {
                const isActive = kolTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setKolTab(t.id)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 relative border-r border-[#1A1A1A] transition-colors last:border-r-0 ${
                      isActive
                        ? "bg-[#0D0D0D] border-t-2 border-t-[#00FF00] -mt-0.5"
                        : "bg-[#0A0A0A] border-t-2 border-t-transparent -mt-0.5 hover:bg-[#111]"
                    }`}
                    style={{ minHeight: 56 }}
                  >
                    <span className={isActive ? "text-[#00FF00]" : "text-[#444]"}>{t.icon}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? "text-[#00FF00]" : "text-[#444]"}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </>
          ) : isVerifiedProject ? (
            /* PROJECT tabs */
            <>
              {([
                { id: "profile" as ProjectTab, label: "PROFILE",  icon: <User className="w-4 h-4" /> },
                { id: "feed"    as ProjectTab, label: "FEED",     icon: <Rss  className="w-4 h-4" /> },
                { id: "kols"    as ProjectTab, label: "KOLs",     icon: <Briefcase className="w-4 h-4" /> },
                { id: "cart"    as ProjectTab, label: "CART",     icon: <ShoppingCart className="w-4 h-4" /> },
              ]).map((t) => {
                const isActive = projectTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setProjectTab(t.id)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 relative border-r border-[#1A1A1A] transition-colors last:border-r-0 ${
                      isActive
                        ? "bg-[#0D0D0D] border-t-2 border-t-[#00FF00] -mt-0.5"
                        : "bg-[#0A0A0A] border-t-2 border-t-transparent -mt-0.5 hover:bg-[#111]"
                    }`}
                    style={{ minHeight: 56 }}
                  >
                    <span className={isActive ? "text-[#00FF00]" : "text-[#444]"}>{t.icon}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? "text-[#00FF00]" : "text-[#444]"}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </>
          ) : sectionsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex-1 h-14 bg-[#111] animate-pulse border-r border-[#2E2E2E] last:border-r-0" />
            ))
          ) : (
            <>
              {activeSections.map((section) => {
                const isActive = activeSectionId === section.id && mainView === "main";
                return (
                  <button
                    key={section.id}
                    onClick={() => switchSection(section.id)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 relative border-r border-[#1A1A1A] transition-colors ${
                      isActive
                        ? "bg-[#0D0D0D] border-t-2 border-t-[#00FF00] -mt-0.5"
                        : "bg-[#0A0A0A] border-t-2 border-t-transparent -mt-0.5 hover:bg-[#111]"
                    }`}
                    style={{ minHeight: 56 }}
                  >
                    <span className={`text-base leading-none ${isActive ? "text-[#00FF00]" : "text-[#444]"}`}>
                      {isActive ? "◆" : "◇"}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide truncate max-w-[72px] ${isActive ? "text-[#00FF00]" : "text-[#444]"}`}>
                      {section.name}
                    </span>
                  </button>
                );
              })}

              {/* Account tab */}
              <button
                onClick={() => setMainView("account")}
                className={`flex-shrink-0 w-14 flex flex-col items-center justify-center gap-1 py-3 relative border-l border-[#1A1A1A] transition-colors ${
                  mainView === "account"
                    ? "bg-[#0D0D0D] border-t-2 border-t-[#00FF00] -mt-0.5"
                    : "bg-[#0A0A0A] border-t-2 border-t-transparent -mt-0.5 hover:bg-[#111]"
                }`}
                style={{ minHeight: 56 }}
              >
                <User className={`w-4 h-4 ${mainView === "account" ? "text-[#00FF00]" : "text-[#444]"}`} />
                {authUser && (
                  <div className={`w-1.5 h-1.5 rounded-full absolute top-2 right-2.5 ${userApp?.status === "verified" ? "bg-[#00FF00]" : userApp?.status === "rejected" ? "bg-[#FF4444]" : authUser ? "bg-[#FFB800]" : "bg-transparent"}`} />
                )}
              </button>
            </>
          )}
        </div>
      </nav>

    </div>
  );
}
