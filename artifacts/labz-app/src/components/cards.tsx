import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import type { Kol, Campaign, Case, Tag } from "@workspace/api-client-react";

/* ─── KOL CARD ─────────────────────────────────────────────────────────────── */

export function KolCard({
  data,
  index = 0,
  compact = false,
}: {
  data: Kol;
  index?: number;
  compact?: boolean;
}) {
  return (
    <div
      className="group relative border border-[#2E2E2E] rounded-none bg-[#0A0A0A] overflow-hidden flex flex-col h-full"
    >
      <div className={`overflow-hidden relative ${compact ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
        <img
          src={data.imageUrl}
          alt={data.name}
          className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {!compact && (
          <div className="absolute top-4 right-4 flex gap-2">
            {data.twitter && (
              <a
                href={data.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 border border-[#333] bg-black text-[#666] hover:border-[#00FF00] hover:text-[#00FF00] flex items-center justify-center transition-colors rounded-none"
              >
                <FaXTwitter size={12} />
              </a>
            )}
            {data.telegram && (
              <a
                href={data.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 border border-[#333] bg-black text-[#666] hover:border-[#00FF00] hover:text-[#00FF00] flex items-center justify-center transition-colors rounded-none"
              >
                <FaTelegram size={12} />
              </a>
            )}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="inline-block mb-2 text-[#00FFFF] text-[10px] font-mono uppercase tracking-wide">
            [{data.niche}]
          </span>
          <h3
            className={`font-mono font-bold text-[#D9D9D9] group-hover:text-[#00FF00] transition-colors ${
              compact ? "text-sm leading-tight" : "text-lg mb-1"
            }`}
          >
            {!compact && "> "}{data.name}
          </h3>
          <div className="flex items-center text-xs text-[#555] font-mono mt-1">
            ● {data.followers}
          </div>
          {compact && (data.twitter || data.telegram) && (
            <div className="flex gap-1.5 mt-2">
              {data.twitter && (
                <a
                  href={data.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 border border-[#333] bg-black text-[#666] hover:border-[#00FF00] hover:text-[#00FF00] flex items-center justify-center transition-colors"
                >
                  <FaXTwitter size={10} />
                </a>
              )}
              {data.telegram && (
                <a
                  href={data.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 border border-[#333] bg-black text-[#666] hover:border-[#00FF00] hover:text-[#00FF00] flex items-center justify-center transition-colors"
                >
                  <FaTelegram size={10} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── CAMPAIGN CARD ─────────────────────────────────────────────────────────── */

const STATUS_STYLE: Record<string, string> = {
  active: "text-[#00FF00] border-[#00FF00]/30 bg-[#00FF00]/10",
  paused: "text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10",
  closed: "text-[#FF4444] border-[#FF4444]/30 bg-[#FF4444]/10",
};

export function CampaignCard({
  data,
  index = 0,
  compact = false,
  allTags = [],
  onApply,
  hasApplied = false,
}: {
  data: Campaign;
  index?: number;
  compact?: boolean;
  allTags?: Tag[];
  onApply?: (campaign: Campaign) => void;
  hasApplied?: boolean;
}) {
  const resolvedTags = allTags.filter((t) => data.tagIds?.includes(t.id));
  const statusStyle = STATUS_STYLE[data.status] ?? STATUS_STYLE.closed;

  const hasCustomForm = (data as any).formFields && (data as any).formFields.length > 0;

  const handleApplyClick = (e: React.MouseEvent) => {
    if (onApply && hasCustomForm) {
      e.preventDefault();
      onApply(data);
    }
  };

  const TagsAndStatus = (
    <div className="flex items-center gap-1.5 flex-wrap">
      {resolvedTags.map((t) => (
        <span
          key={t.id}
          className="text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 border"
          style={{
            color: t.color || "#00FFFF",
            borderColor: `${t.color || "#00FFFF"}55`,
            backgroundColor: `${t.color || "#00FFFF"}18`,
          }}
        >
          {t.name}
        </span>
      ))}
      {resolvedTags.length === 0 && data.tag && (
        <span className="text-[#00FFFF] text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 border border-[#00FFFF]/30 bg-[#00FFFF]/10">
          {data.tag.toUpperCase()}
        </span>
      )}
      {data.status && (
        <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 border ${statusStyle}`}>
          {data.status}
        </span>
      )}
      {hasApplied && (
        <span className="text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 border text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10">
          APPLIED
        </span>
      )}
    </div>
  );

  if (compact) {
    return (
      <div
        className="group console-panel relative flex items-stretch gap-0 border border-[#2E2E2E] rounded-none hover:border-[#00FF00] transition-colors duration-300"
      >
        <div className="w-20 flex-shrink-0 relative overflow-hidden border-r border-[#2E2E2E]">
          <img
            src={data.imageUrl}
            alt={data.title}
            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="mb-1">{TagsAndStatus}</div>
            <h3 className="text-sm font-mono font-bold text-[#D9D9D9] leading-tight line-clamp-1 group-hover:text-[#00FF00] transition-colors">
              {data.title}
            </h3>
            <p className="text-[11px] text-[#555] font-mono line-clamp-2 mt-1 leading-relaxed">
              {data.description}
            </p>
          </div>
          {hasApplied ? (
            <span className="mt-2 self-start flex items-center gap-1 text-[11px] font-bold font-mono text-[#FFB800]">
              ✓ APPLIED
            </span>
          ) : onApply && hasCustomForm ? (
            <button
              onClick={handleApplyClick}
              className="mt-2 self-start flex items-center gap-1 text-[11px] font-bold font-mono text-[#00FF00] hover:text-[#00CC00] transition-colors"
            >
              &gt;&gt; APPLY
            </button>
          ) : (
            <a
              href={data.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 self-start flex items-center gap-1 text-[11px] font-bold font-mono text-[#00FF00] hover:text-[#00CC00] transition-colors"
            >
              &gt;&gt; APPLY
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative console-panel flex flex-col h-full hover:border-[#00FF00] transition-colors duration-300"
    >
      <div className="aspect-video overflow-hidden relative border-b border-[#2E2E2E]">
        <img
          src={data.imageUrl}
          alt={data.title}
          className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
      </div>

      <div className="p-6 flex-grow flex flex-col justify-between relative z-10">
        <div>
          <div className="mb-3">{TagsAndStatus}</div>
          <h3 className="text-lg font-mono font-bold text-[#D9D9D9] mb-2 group-hover:text-[#00FF00] transition-colors">
            {data.title}
          </h3>
          <p className="text-xs font-mono text-[#555] leading-relaxed line-clamp-3 mb-6">
            {data.description}
          </p>
        </div>
        {hasApplied ? (
          <div className="w-full border border-[#FFB800]/30 bg-[#FFB800]/10 text-[#FFB800] text-center text-sm font-mono font-bold py-3">
            ✓ APPLICATION SUBMITTED
          </div>
        ) : onApply && hasCustomForm ? (
          <button
            onClick={handleApplyClick}
            className="w-full console-btn text-center flex items-center justify-center gap-2"
          >
            [ APPLY ]
          </button>
        ) : (
          <a
            href={data.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full console-btn text-center flex items-center justify-center gap-2"
          >
            [ APPLY ] <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── CASE CARD ─────────────────────────────────────────────────────────────── */

export function CaseCard({ data, index = 0 }: { data: Case; index?: number }) {
  return (
    <div
      className="group console-panel relative overflow-hidden hover:border-[#00FF00] transition-all duration-300 flex flex-col h-full"
    >
      <div className="aspect-[16/10] overflow-hidden relative z-10">
        <img
          src={data.imageUrl}
          alt={data.project}
          className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=800&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="inline-block mb-2 text-[#00FFFF] font-mono text-[10px] uppercase tracking-wide">
            [{data.category.toUpperCase()}]
          </span>
          <h3 className="text-xl font-mono font-bold text-[#D9D9D9] mb-2 group-hover:text-[#00FF00] transition-colors">
            {data.project}
          </h3>
          <p className="text-[#00FF00] font-mono text-xs">&gt; {data.result}</p>
        </div>
      </div>
    </div>
  );
}
