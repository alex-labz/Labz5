import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, Upload, Save, Settings, Users, Zap, Briefcase, Tag as TagIcon, Inbox, ChevronRight, CheckCircle, XCircle, Clock, Rss, Crown, ClipboardList, GripVertical, FolderKanban } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListKols, useCreateKol, useUpdateKol, useDeleteKol,
  useListCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign,
  useListCases, useCreateCase, useUpdateCase, useDeleteCase,
  useListSections, useCreateSection, useUpdateSection, useDeleteSection,
  useListTags, useCreateTag, useUpdateTag, useDeleteTag,
  useListApplications, useUpdateApplicationStatus,
  useListUsers, useUpdateUserRank,
  useListPosts, useCreatePost, useDeletePost,
  useListSubmissions, useUpdateSubmissionStatus, useDeleteSubmission,
  useListProjectRequests, useUpdateProjectRequestStatus,
  type KolInput, type CampaignInput, type CaseInput, type SectionInput, type TagInput
} from "@workspace/api-client-react";
import { BASE_URL } from "@/lib/utils";

type AdminTab = "kols" | "campaigns" | "cases" | "sections" | "tags" | "applications" | "users" | "posts" | "submissions" | "project-requests" | `section:${string}`;

/* ── FormField types ─────────────────────────────────────────────────────── */
type FormFieldType = "text" | "textarea" | "url" | "number" | "select";
interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}
const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "text",     label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "url",      label: "URL / Link" },
  { value: "number",   label: "Number" },
  { value: "select",   label: "Dropdown" },
];
function newField(): FormField {
  return { id: Math.random().toString(36).slice(2), type: "text", label: "", placeholder: "", required: false };
}

const CAMPAIGN_TYPES = [
  { id: "socialfi",   label: "SocialFi" },
  { id: "infofi",     label: "InfoFi" },
  { id: "affiliate",  label: "Affiliate" },
  { id: "ambassador", label: "Ambassador" },
  { id: "other",      label: "Other" },
];

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${BASE_URL}/api/upload`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-green-500/20 text-green-400" },
  { value: "pending", label: "Pending", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "closed", label: "Closed", color: "bg-red-500/20 text-red-400" },
];

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find(o => o.value === status) ?? STATUS_OPTIONS[0];
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${opt.color}`}>{opt.label}</span>;
}

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("kols");
  const qc = useQueryClient();

  const { data: kols = [] } = useListKols();
  const { data: campaigns = [] } = useListCampaigns();
  const { data: cases = [] } = useListCases();
  const { data: sections = [] } = useListSections();
  const { data: tags = [] } = useListTags();
  const { data: apps = [] } = useListApplications();
  const { data: users = [] } = useListUsers();
  const { data: posts = [] } = useListPosts();
  const { data: submissions = [] } = useListSubmissions();
  const { data: projectRequests = [] } = useListProjectRequests();

  const refreshCampaigns = () => qc.invalidateQueries({ queryKey: ["/api/campaigns"] });

  const staticNavItems = [
    { id: "kols" as AdminTab, label: "KOLs", icon: Users },
    { id: "campaigns" as AdminTab, label: "Campaigns", icon: Briefcase },
    { id: "cases" as AdminTab, label: "Cases", icon: Briefcase },
    { id: "sections" as AdminTab, label: "Sections", icon: Settings },
    { id: "tags" as AdminTab, label: "Tags", icon: TagIcon },
    { id: "applications" as AdminTab, label: "Inbox", icon: Inbox },
    { id: "submissions" as AdminTab, label: "Submissions", icon: ClipboardList },
    { id: "project-requests" as AdminTab, label: "Projects", icon: FolderKanban },
    { id: "users" as AdminTab, label: "Members", icon: Crown },
    { id: "posts" as AdminTab, label: "Feed", icon: Rss },
  ];

  const sectionNavItems = [...sections].sort((a, b) => a.sortOrder - b.sortOrder).map(s => ({
    id: `section:${s.slug}` as AdminTab,
    label: s.name,
    icon: Zap,
    sectionData: s,
  }));

  const activeSection = tab.startsWith("section:") ? sections.find(s => `section:${s.slug}` === tab) : null;
  const sectionCampaigns = activeSection ? campaigns.filter(c => c.type === activeSection.slug) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <aside className="w-full md:w-64 border-r border-white/10 bg-card/50 backdrop-blur-xl p-6 flex flex-col shrink-0">
        <div className="mb-8">
          <span className="font-display font-black text-2xl tracking-tighter text-foreground block">
            LABZ <span className="text-primary">ADMIN</span>
          </span>
        </div>

        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 custom-scrollbar">
          {sectionNavItems.length > 0 && (
            <>
              <p className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 pt-2 pb-1">Campaigns</p>
              {sectionNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    tab === item.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </button>
              ))}
              <div className="hidden md:block h-px bg-white/10 my-3" />
              <p className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 pb-1">Management</p>
            </>
          )}
          {staticNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                tab === item.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "kols" && (
              <KolsManager data={kols} refresh={() => qc.invalidateQueries({ queryKey: ["/api/kols"] })} />
            )}
            {tab === "campaigns" && (
              <CampaignTypesManager
                allCampaigns={campaigns}
                allTags={tags}
                sections={sections}
                refresh={refreshCampaigns}
              />
            )}
            {activeSection && (
              <CampaignsManager
                type={activeSection.slug}
                sectionName={activeSection.name}
                data={sectionCampaigns}
                allTags={tags}
                sections={sections}
                refresh={refreshCampaigns}
              />
            )}
            {tab === "cases" && (
              <CasesManager data={cases} refresh={() => qc.invalidateQueries({ queryKey: ["/api/cases"] })} />
            )}
            {tab === "sections" && (
              <SectionsManager data={sections} refresh={() => qc.invalidateQueries({ queryKey: ["/api/sections"] })} />
            )}
            {tab === "tags" && (
              <TagsManager data={tags} sections={sections} refresh={() => qc.invalidateQueries({ queryKey: ["/api/tags"] })} />
            )}
            {tab === "applications" && <ApplicationsViewer data={apps} refresh={() => qc.invalidateQueries({ queryKey: ["/api/applications"] })} />}
            {tab === "submissions" && <SubmissionsManager data={submissions} refresh={() => qc.invalidateQueries({ queryKey: ["/api/submissions"] })} />}
            {tab === "project-requests" && <ProjectRequestsManager data={projectRequests} refresh={() => qc.invalidateQueries({ queryKey: ["/api/project-requests"] })} />}
            {tab === "users" && <UsersManager data={users} refresh={() => qc.invalidateQueries({ queryKey: ["/api/users"] })} />}
            {tab === "posts" && <PostsManager data={posts} refresh={() => qc.invalidateQueries({ queryKey: ["/api/posts"] })} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(f);
      onChange(url);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Image *</label>
      <div className="flex gap-4">
        {value && <img src={value} className="w-16 h-16 object-cover rounded-lg border border-white/10" />}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileRef}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Image"}
          </button>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Or paste URL"
            className="w-full mt-2 bg-background/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>
    </div>
  );
}

function TagMultiSelect({ allTags, selectedIds, onChange }: { allTags: any[]; selectedIds: number[]; onChange: (ids: number[]) => void }) {
  if (allTags.length === 0) return <p className="text-sm text-muted-foreground">No tags available. Create tags in the Tags section first.</p>;

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map(t => {
        const selected = selectedIds.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              selected
                ? "border-primary bg-primary/20 text-primary"
                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/30 hover:text-foreground"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: selected ? undefined : t.color, background: selected ? undefined : t.color }}
            />
            {t.name}
          </button>
        );
      })}
    </div>
  );
}

function KolsManager({ data, refresh }: { data: any[]; refresh: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  const createMut = useCreateKol({ mutation: { onSuccess: () => { refresh(); setEditing(null); setIsNew(false); } } });
  const updateMut = useUpdateKol({ mutation: { onSuccess: () => { refresh(); setEditing(null); } } });
  const deleteMut = useDeleteKol({ mutation: { onSuccess: () => refresh() } });

  const [form, setForm] = useState<KolInput>({ name: "", followers: "", niche: "", imageUrl: "", twitter: "", telegram: "" });

  const openNew = () => { setForm({ name: "", followers: "", niche: "", imageUrl: "", twitter: "", telegram: "" }); setIsNew(true); setEditing(true); };
  const openEdit = (k: any) => { setForm(k); setIsNew(false); setEditing(k); };

  const handleSave = () => {
    if (!form.name || !form.imageUrl) return alert("Name and Image required");
    if (isNew) createMut.mutate({ data: form });
    else updateMut.mutate({ id: editing.id, data: form });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display font-bold">Manage KOLs</h2>
        <button onClick={openNew} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {editing && (
        <div className="glass-panel p-6 rounded-xl mb-8 space-y-4 border-primary/30 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
          <h3 className="font-bold text-xl">{isNew ? "Create KOL" : "Edit KOL"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" /></div>
            <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Followers</label><input value={form.followers} onChange={e => setForm({ ...form, followers: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" /></div>
            <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Niche</label><input value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" /></div>
            <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Twitter URL</label><input value={form.twitter || ""} onChange={e => setForm({ ...form, twitter: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" /></div>
            <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Telegram URL</label><input value={form.telegram || ""} onChange={e => setForm({ ...form, telegram: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" /></div>
            <ImageUploader value={form.imageUrl} onChange={url => setForm({ ...form, imageUrl: url })} />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 rounded-lg bg-white/5 font-bold">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(k => (
          <div key={k.id} className="glass-panel p-4 rounded-xl flex gap-4">
            <img src={k.imageUrl} className="w-20 h-24 object-cover rounded-lg border border-white/10" />
            <div className="flex-1">
              <h4 className="font-bold text-lg">{k.name}</h4>
              <p className="text-xs text-muted-foreground">{k.niche} • {k.followers}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(k)} className="p-2 rounded bg-white/5 hover:bg-white/10"><Edit3 className="w-4 h-4 text-blue-400" /></button>
                <button onClick={() => { if (confirm("Are you sure?")) deleteMut.mutate({ id: k.id }); }} className="p-2 rounded bg-white/5 hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CampaignTypesManager ─────────────────────────────────────── */
function CampaignTypesManager({ allCampaigns, allTags, sections, refresh }: {
  allCampaigns: any[];
  allTags: any[];
  sections: any[];
  refresh: () => void;
}) {
  const [openType, setOpenType] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Campaigns</h2>
      <div className="space-y-3">
        {CAMPAIGN_TYPES.map((ct) => {
          const typeCampaigns = allCampaigns.filter((c) => c.type === ct.id);
          const isOpen = openType === ct.id;
          return (
            <div key={ct.id} className="glass-panel rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenType(isOpen ? null : ct.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{ct.label}</span>
                  <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                    {typeCampaigns.length}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-white/5">
                  <CampaignsManager
                    type={ct.id}
                    sectionName={ct.label}
                    data={typeCampaigns}
                    allTags={allTags}
                    sections={sections}
                    refresh={refresh}
                    embedded
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CampaignsManager({
  type, sectionName, data, allTags, sections, refresh, embedded
}: {
  type: string;
  sectionName: string;
  data: any[];
  embedded?: boolean;
  allTags: any[];
  sections: any[];
  refresh: () => void;
}) {
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  const createMut = useCreateCampaign({ mutation: { onSuccess: () => { refresh(); setEditing(null); setIsNew(false); } } });
  const updateMut = useUpdateCampaign({ mutation: { onSuccess: () => { refresh(); setEditing(null); } } });
  const deleteMut = useDeleteCampaign({ mutation: { onSuccess: () => refresh() } });

  const defaultForm: CampaignInput = { title: "", tag: "", description: "", applyLink: "", imageUrl: "", type, status: "active", tagIds: [] };
  const [form, setForm] = useState<CampaignInput>(defaultForm);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const sectionTags = allTags.filter(t => {
    const section = sections.find(s => s.slug === type);
    return !t.sectionId || t.sectionId === section?.id;
  });

  const openNew = () => { setForm({ ...defaultForm }); setFormFields([]); setIsNew(true); setEditing(true); };
  const openEdit = (c: any) => {
    setForm({ ...c, tagIds: c.tagIds ?? [] });
    setFormFields((c.formFields as FormField[]) ?? []);
    setIsNew(false);
    setEditing(c);
  };

  const handleSave = () => {
    if (!form.title || !form.imageUrl) return alert("Title and Image required");
    const data = { ...form, formFields } as any;
    if (isNew) createMut.mutate({ data });
    else updateMut.mutate({ id: editing.id, data });
  };

  const updateField = (id: string, patch: Partial<FormField>) =>
    setFormFields(fs => fs.map(f => f.id === id ? { ...f, ...patch } : f));
  const removeField = (id: string) => setFormFields(fs => fs.filter(f => f.id !== id));
  const addField = () => setFormFields(fs => [...fs, newField()]);

  return (
    <div>
      <div className={`flex justify-between items-center ${embedded ? "px-5 py-3" : "mb-8"}`}>
        {!embedded && <h2 className="text-3xl font-display font-bold">{sectionName} Campaigns</h2>}
        <button onClick={openNew} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Campaign
        </button>
      </div>

      {editing && (
        <div className="glass-panel p-6 rounded-xl mb-8 space-y-4 border-primary/30 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
          <h3 className="font-bold text-xl">{isNew ? "Create Campaign" : "Edit Campaign"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Display Tag (label)</label>
              <input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Apply Link</label>
              <input value={form.applyLink} onChange={e => setForm({ ...form, applyLink: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Status / Mode</label>
              <div className="flex gap-2 mt-1">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, status: opt.value })}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      form.status === opt.value
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <ImageUploader value={form.imageUrl} onChange={url => setForm({ ...form, imageUrl: url })} />
            </div>
            {sectionTags.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Tags (click to select multiple)</label>
                <TagMultiSelect
                  allTags={sectionTags}
                  selectedIds={form.tagIds ?? []}
                  onChange={ids => setForm({ ...form, tagIds: ids })}
                />
              </div>
            )}

            {/* ── FORM FIELD BUILDER ─────────────────── */}
            <div className="md:col-span-2 border border-white/10 rounded-lg p-4 space-y-3 bg-black/20">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-white">Application Form Fields</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Define custom fields KOLs must fill to apply (leave empty to use Apply Link instead)</div>
                </div>
                <button
                  type="button"
                  onClick={addField}
                  className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 flex items-center gap-1.5 border border-primary/30"
                >
                  <Plus className="w-3 h-3" /> Add Field
                </button>
              </div>
              {formFields.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-4 border border-dashed border-white/10 rounded-lg">
                  No custom fields — uses the Apply Link above
                </div>
              )}
              {formFields.map((field, i) => (
                <div key={field.id} className="border border-white/10 rounded-lg p-3 space-y-2 bg-background/30">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Field {i + 1}</span>
                    <div className="flex-1" />
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => updateField(field.id, { required: e.target.checked })}
                        className="accent-primary"
                      />
                      Required
                    </label>
                    <button type="button" onClick={() => removeField(field.id)} className="p-1 rounded hover:bg-destructive/20 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Label</label>
                      <input
                        value={field.label}
                        onChange={e => updateField(field.id, { label: e.target.value })}
                        placeholder="e.g. Twitter Handle"
                        className="w-full bg-background/50 border border-white/10 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Type</label>
                      <select
                        value={field.type}
                        onChange={e => updateField(field.id, { type: e.target.value as FormFieldType })}
                        className="w-full bg-background/50 border border-white/10 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary/50"
                      >
                        {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Placeholder</label>
                      <input
                        value={field.placeholder ?? ""}
                        onChange={e => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Hint text shown inside the field"
                        className="w-full bg-background/50 border border-white/10 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    {field.type === "select" && (
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Options (one per line)</label>
                        <textarea
                          rows={3}
                          value={(field.options ?? []).join("\n")}
                          onChange={e => updateField(field.id, { options: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })}
                          placeholder={"Option A\nOption B\nOption C"}
                          className="w-full bg-background/50 border border-white/10 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary/50 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 rounded-lg bg-white/5 font-bold">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-xl text-muted-foreground">
          <p className="text-lg font-bold mb-2">No campaigns yet</p>
          <p className="text-sm">Click "Add Campaign" to create the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map(c => (
            <div key={c.id} className="glass-panel p-4 rounded-xl flex gap-4">
              <img src={c.imageUrl} className="w-32 h-24 object-cover rounded-lg border border-white/10 shrink-0" />
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold leading-tight truncate">{c.title}</h4>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                  {(c.tagIds ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(c.tagIds as number[]).map(tid => {
                        const tag = allTags.find(t => t.id === tid);
                        return tag ? (
                          <span key={tid} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-muted-foreground" style={{ borderLeft: `2px solid ${tag.color}` }}>
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-white/10">{c.tag}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded bg-white/5 hover:bg-white/10"><Edit3 className="w-4 h-4 text-blue-400" /></button>
                    <button onClick={() => { if (confirm("Are you sure?")) deleteMut.mutate({ id: c.id }); }} className="p-1.5 rounded bg-white/5 hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CasesManager({ data, refresh }: { data: any[]; refresh: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  const createMut = useCreateCase({ mutation: { onSuccess: () => { refresh(); setEditing(null); setIsNew(false); } } });
  const updateMut = useUpdateCase({ mutation: { onSuccess: () => { refresh(); setEditing(null); } } });
  const deleteMut = useDeleteCase({ mutation: { onSuccess: () => refresh() } });

  const [form, setForm] = useState<CaseInput>({ project: "", result: "", category: "", imageUrl: "" });

  const openNew = () => { setForm({ project: "", result: "", category: "", imageUrl: "" }); setIsNew(true); setEditing(true); };
  const openEdit = (c: any) => { setForm(c); setIsNew(false); setEditing(c); };

  const handleSave = () => {
    if (!form.project || !form.imageUrl) return alert("Project and Image required");
    if (isNew) createMut.mutate({ data: form });
    else updateMut.mutate({ id: editing.id, data: form });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display font-bold">Manage Cases</h2>
        <button onClick={openNew} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {editing && (
        <div className="glass-panel p-6 rounded-xl mb-8 space-y-4 border-primary/30 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
          <h3 className="font-bold text-xl">{isNew ? "Create Case" : "Edit Case"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Project Name</label><input value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" /></div>
            <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Result (Stats/Metrics)</label><input value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" /></div>
            <div className="md:col-span-2"><ImageUploader value={form.imageUrl} onChange={url => setForm({ ...form, imageUrl: url })} /></div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 rounded-lg bg-white/5 font-bold">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map(c => (
          <div key={c.id} className="glass-panel p-4 rounded-xl flex flex-col gap-3">
            <img src={c.imageUrl} className="w-full h-32 object-cover rounded-lg border border-white/10" />
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground bg-white/5 px-2 py-0.5 rounded">{c.category}</span>
              <h4 className="font-bold mt-1 text-lg leading-tight">{c.project}</h4>
              <p className="text-primary text-sm font-medium mt-1">{c.result}</p>
            </div>
            <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
              <button onClick={() => openEdit(c)} className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-bold flex items-center justify-center"><Edit3 className="w-3.5 h-3.5 text-blue-400" /></button>
              <button onClick={() => { if (confirm("Are you sure?")) deleteMut.mutate({ id: c.id }); }} className="flex-1 py-1.5 rounded bg-white/5 hover:bg-destructive/20 text-xs font-bold flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionsManager({ data, refresh }: { data: any[]; refresh: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  const createMut = useCreateSection({ mutation: { onSuccess: () => { refresh(); setEditing(null); setIsNew(false); } } });
  const updateMut = useUpdateSection({ mutation: { onSuccess: () => { refresh(); setEditing(null); } } });
  const deleteMut = useDeleteSection({ mutation: { onSuccess: () => refresh() } });

  const [form, setForm] = useState<SectionInput>({ name: "", slug: "", icon: "Globe", description: "", color: "#FFD700", sortOrder: 0, isActive: true });

  const openNew = () => { setForm({ name: "", slug: "", icon: "Globe", description: "", color: "#FFD700", sortOrder: data.length, isActive: true }); setIsNew(true); setEditing(true); };
  const openEdit = (s: any) => { setForm(s); setIsNew(false); setEditing(s); };

  const handleSave = () => {
    if (!form.name || !form.slug) return alert("Name and Slug required");
    if (isNew) createMut.mutate({ data: form });
    else updateMut.mutate({ id: editing.id, data: form });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display font-bold">App Sections</h2>
        <button onClick={openNew} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Sections appear in the sidebar as campaign categories. Each section gets its own campaign management tab.</p>

      {editing && (
        <div className="glass-panel p-6 rounded-xl mb-8 space-y-4 border-primary/30 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
          <h3 className="font-bold text-xl">{isNew ? "Create Section" : "Edit Section"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value, slug: isNew ? e.target.value.toLowerCase().replace(/\s+/g, "-") : form.slug })}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Slug (campaign type identifier)</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Color (Hex)</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full h-10 bg-background/50 border border-white/10 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="isActive" className="text-sm font-bold cursor-pointer">Show on App Page</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 rounded-lg bg-white/5 font-bold">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-bold text-muted-foreground">Order</th>
              <th className="p-4 font-bold text-muted-foreground">Name</th>
              <th className="p-4 font-bold text-muted-foreground">Slug</th>
              <th className="p-4 font-bold text-muted-foreground">Color</th>
              <th className="p-4 font-bold text-muted-foreground">Visibility</th>
              <th className="p-4 font-bold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...data].sort((a, b) => a.sortOrder - b.sortOrder).map(s => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4">{s.sortOrder}</td>
                <td className="p-4 font-bold">{s.name}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">{s.slug}</td>
                <td className="p-4"><div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: s.color }}></div></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${s.isActive ? "bg-green-500/20 text-green-400" : "bg-white/5 text-muted-foreground"}`}>
                    {s.isActive ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-white/10"><Edit3 className="w-4 h-4 text-blue-400" /></button>
                    <button onClick={() => { if (confirm("Are you sure?")) deleteMut.mutate({ id: s.id }); }} className="p-1.5 rounded hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TagsManager({ data, sections, refresh }: { data: any[]; sections: any[]; refresh: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  const createMut = useCreateTag({ mutation: { onSuccess: () => { refresh(); setEditing(null); setIsNew(false); } } });
  const updateMut = useUpdateTag({ mutation: { onSuccess: () => { refresh(); setEditing(null); } } });
  const deleteMut = useDeleteTag({ mutation: { onSuccess: () => refresh() } });

  const [form, setForm] = useState<TagInput>({ name: "", slug: "", sectionId: null, color: "#ffffff" });

  const openNew = () => { setForm({ name: "", slug: "", sectionId: sections[0]?.id || null, color: "#ffffff" }); setIsNew(true); setEditing(true); };
  const openEdit = (t: any) => { setForm(t); setIsNew(false); setEditing(t); };

  const handleSave = () => {
    if (!form.name) return alert("Name required");
    if (isNew) createMut.mutate({ data: form });
    else updateMut.mutate({ id: editing.id, data: form });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display font-bold">Manage Tags</h2>
        <button onClick={openNew} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Tag
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Tags assigned to a section will be auto-suggested when creating campaigns in that section.</p>

      {editing && (
        <div className="glass-panel p-6 rounded-xl mb-8 space-y-4 border-primary/30 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
          <h3 className="font-bold text-xl">{isNew ? "Create Tag" : "Edit Tag"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value, slug: isNew ? e.target.value.toLowerCase().replace(/\s+/g, "-") : form.slug })}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-12 h-10 bg-background/50 border border-white/10 rounded-lg cursor-pointer" />
                <span className="text-sm font-mono text-muted-foreground">{form.color}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Applies To Section</label>
              <select
                value={form.sectionId || ""}
                onChange={e => setForm({ ...form, sectionId: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50"
              >
                <option value="">All Sections (Global)</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 rounded-lg bg-white/5 font-bold">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        {data.map(t => (
          <div key={t.id} className="glass-panel px-4 py-3 rounded-xl flex items-center gap-4">
            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.color }} />
            <div>
              <span className="font-bold block text-sm">{t.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{sections.find(s => s.id === t.sectionId)?.name || "Global"}</span>
            </div>
            <div className="flex gap-1 ml-4 border-l border-white/10 pl-4">
              <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-white/10"><Edit3 className="w-3.5 h-3.5 text-blue-400" /></button>
              <button onClick={() => { if (confirm("Are you sure?")) deleteMut.mutate({ id: t.id }); }} className="p-1.5 rounded hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── RANK COLORS ── */
const RANK_STYLES: Record<string, { label: string; color: string; badge: string }> = {
  beginner: { label: "Beginner", color: "text-green-400",  badge: "bg-green-500/20 border-green-500/40 text-green-400"  },
  advanced: { label: "Advanced", color: "text-blue-400",   badge: "bg-blue-500/20  border-blue-500/40  text-blue-400"   },
  elite:    { label: "Elite",    color: "text-red-400",    badge: "bg-red-500/20   border-red-500/40   text-red-400"    },
  early:    { label: "Early",    color: "text-yellow-400", badge: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" },
};

function UsersManager({ data, refresh }: { data: any[]; refresh: () => void }) {
  const updateRankMut = useUpdateUserRank({ mutation: { onSuccess: () => refresh() } });

  const handleRank = (id: number, rank: string) => {
    updateRankMut.mutate({ id, data: { rank } });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">Members</h2>
        <p className="text-muted-foreground mt-1">Manage registered users and assign ranks.</p>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="py-12 text-center glass-panel rounded-xl text-muted-foreground">No members yet.</div>
        ) : data.map(u => {
          const rs = RANK_STYLES[u.rank ?? "beginner"] ?? RANK_STYLES.beginner;
          return (
            <div key={u.id} className="glass-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-base">{u.login}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rs.badge}`}>{rs.label}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {u.evmWallet ? u.evmWallet : <span className="opacity-40">No wallet</span>}
                </div>
                {u.bio && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{u.bio}</div>}
              </div>

              <div className="flex-shrink-0">
                <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1.5">Rank</div>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(RANK_STYLES).map(([rank, style]) => (
                    <button
                      key={rank}
                      onClick={() => handleRank(u.id, rank)}
                      disabled={updateRankMut.isPending}
                      className={`px-2.5 py-1 rounded text-xs font-bold border transition-all disabled:opacity-50 ${
                        (u.rank ?? "beginner") === rank
                          ? style.badge
                          : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostsManager({ data, refresh }: { data: any[]; refresh: () => void }) {
  const [isNew, setIsNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const createMut = useCreatePost({ mutation: { onSuccess: () => { refresh(); setIsNew(false); setTitle(""); setContent(""); setImageUrl(""); } } });
  const deleteMut = useDeletePost({ mutation: { onSuccess: () => refresh() } });

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) return alert("Title and content are required");
    createMut.mutate({ data: { title: title.trim(), content: content.trim(), imageUrl: imageUrl.trim() || null } });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold">Feed</h2>
          <p className="text-muted-foreground mt-1">Posts visible to all verified KOLs. Deleting a post removes it for everyone.</p>
        </div>
        <button
          onClick={() => setIsNew(v => !v)}
          className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* New post form */}
      {isNew && (
        <div className="glass-panel p-6 rounded-xl mb-8 space-y-4 border-primary/30 shadow-[0_0_30px_rgba(255,215,0,0.06)]">
          <h3 className="font-bold text-xl">Create Post</h3>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Content *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              placeholder="Write your post..."
              className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Image URL (optional)</label>
            <ImageUploader value={imageUrl} onChange={setImageUrl} />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsNew(false)} className="px-4 py-2 rounded-lg bg-white/5 font-bold">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={createMut.isPending}
              className="px-4 py-2 rounded-lg bg-primary text-background font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {createMut.isPending ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="py-12 text-center glass-panel rounded-xl text-muted-foreground">No posts yet. Create one above.</div>
        ) : [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(post => (
          <div key={post.id} className="glass-panel p-5 rounded-xl flex flex-col sm:flex-row gap-4">
            {post.imageUrl && (
              <img src={post.imageUrl} alt={post.title} className="w-full sm:w-32 h-24 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base leading-snug">{post.title}</h3>
                <button
                  onClick={() => { if (confirm("Delete this post for everyone?")) deleteMut.mutate({ id: post.id }); }}
                  disabled={deleteMut.isPending}
                  className="flex-shrink-0 p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap">{post.content}</p>
              <span className="text-[10px] text-muted-foreground/50 mt-2 block">
                {new Date(post.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppStatusBadge({ status }: { status: string }) {
  if (status === "verified") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
      <CheckCircle className="w-3 h-3" /> Verified
    </span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
      <XCircle className="w-3 h-3" /> Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function SubmissionsManager({ data, refresh }: { data: any[]; refresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const updateMut = useUpdateSubmissionStatus();
  const deleteMut = useDeleteSubmission();

  const filtered = data.filter(s => statusFilter === "all" || s.status === statusFilter);

  const statusBadge = (status: string) => {
    if (status === "approved") return <span className="flex items-center gap-1 text-xs font-bold text-green-400"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
    if (status === "rejected") return <span className="flex items-center gap-1 text-xs font-bold text-destructive"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
    return <span className="flex items-center gap-1 text-xs font-bold text-yellow-400"><Clock className="w-3.5 h-3.5" /> Pending</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold">Campaign Submissions</h2>
        <span className="text-muted-foreground text-sm">{data.length} total</span>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
              statusFilter === f ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && ` (${data.filter(s => s.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-xl text-muted-foreground">
          <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-bold mb-2">No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sub => (
            <div key={sub.id} className="glass-panel rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              >
                {sub.campaignImageUrl && (
                  <img src={sub.campaignImageUrl} alt="" className="w-14 h-14 object-cover rounded-lg border border-white/10 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{sub.campaignTitle ?? "Campaign"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">{sub.campaignType} · User #{sub.userId}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {statusBadge(sub.status)}
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === sub.id ? "rotate-90" : ""}`} />
                </div>
              </div>

              {expandedId === sub.id && (
                <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-3">
                  {sub.answers && Object.keys(sub.answers).length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Answers</div>
                      {Object.entries(sub.answers as Record<string, string>).map(([k, v]) => (
                        <div key={k} className="bg-black/30 rounded-lg px-3 py-2">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">{k}</div>
                          <div className="text-sm mt-0.5">{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    {sub.status !== "approved" && (
                      <button
                        onClick={() => { updateMut.mutate({ id: sub.id, status: "approved" }); refresh(); }}
                        disabled={updateMut.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 border border-green-500/30 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {sub.status !== "rejected" && (
                      <button
                        onClick={() => { updateMut.mutate({ id: sub.id, status: "rejected" }); refresh(); }}
                        disabled={updateMut.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs font-bold hover:bg-destructive/30 border border-destructive/30 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={() => { if (confirm("Delete this submission?")) deleteMut.mutate({ id: sub.id }); }}
                      className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Submitted: {new Date(sub.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectRequestsManager({ data, refresh }: { data: any[]; refresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const updateMut = useUpdateProjectRequestStatus();

  const filtered = data.filter(r => statusFilter === "all" || r.status === statusFilter);

  const statusBadge = (status: string) => {
    if (status === "approved") return <span className="flex items-center gap-1 text-xs font-bold text-green-400"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
    if (status === "rejected") return <span className="flex items-center gap-1 text-xs font-bold text-destructive"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
    return <span className="flex items-center gap-1 text-xs font-bold text-yellow-400"><Clock className="w-3.5 h-3.5" /> Pending</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold">Project Campaign Requests</h2>
        <span className="text-muted-foreground text-sm">{data.length} total</span>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
              statusFilter === f ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && ` (${data.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-xl text-muted-foreground">
          <FolderKanban className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-bold mb-2">No project requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div key={req.id} className="glass-panel rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{req.projectName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {req.userLogin ?? `User #${req.userId}`} · {req.offer?.toUpperCase()} · {(req.selectedKols ?? []).length} KOLs
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {statusBadge(req.status)}
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === req.id ? "rotate-90" : ""}`} />
                </div>
              </div>

              {expandedId === req.id && (
                <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-black/30 rounded-lg px-3 py-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Twitter</div>
                      <a href={req.twitterLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all">{req.twitterLink}</a>
                    </div>
                    <div className="bg-black/30 rounded-lg px-3 py-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Website</div>
                      <a href={req.websiteLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline break-all">{req.websiteLink}</a>
                    </div>
                    <div className="bg-black/30 rounded-lg px-3 py-2 sm:col-span-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Project Info</div>
                      <p className="text-sm whitespace-pre-wrap">{req.projectInfo}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg px-3 py-2 sm:col-span-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Campaign Info</div>
                      <p className="text-sm whitespace-pre-wrap">{req.campaignInfo}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg px-3 py-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Compensation</div>
                      <div className="text-sm font-bold uppercase">{req.offer}</div>
                    </div>
                    <div className="bg-black/30 rounded-lg px-3 py-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Submitted</div>
                      <div className="text-xs">{new Date(req.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
                    </div>
                  </div>

                  {(req.selectedKols ?? []).length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Selected KOLs ({(req.selectedKols ?? []).length})</div>
                      <div className="flex flex-wrap gap-2">
                        {(req.selectedKols as Array<{id: number; name: string; niche: string}>).map(k => (
                          <span key={k.id} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-bold">{k.name} <span className="text-muted-foreground font-normal">· {k.niche}</span></span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    {req.status !== "approved" && (
                      <button
                        onClick={() => { updateMut.mutate({ id: req.id, status: "approved" }); refresh(); }}
                        disabled={updateMut.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 border border-green-500/30 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {req.status !== "rejected" && (
                      <button
                        onClick={() => { updateMut.mutate({ id: req.id, status: "rejected" }); refresh(); }}
                        disabled={updateMut.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs font-bold hover:bg-destructive/30 border border-destructive/30 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    {req.status !== "pending" && (
                      <button
                        onClick={() => { updateMut.mutate({ id: req.id, status: "pending" }); refresh(); }}
                        disabled={updateMut.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-muted-foreground text-xs font-bold hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationsViewer({ data, refresh }: { data: any[]; refresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const updateMut = useUpdateApplicationStatus({ mutation: { onSuccess: () => refresh() } });

  const filtered = [...data]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter(app => statusFilter === "all" || app.status === statusFilter);

  const counts = {
    all: data.length,
    pending: data.filter(a => a.status === "pending").length,
    verified: data.filter(a => a.status === "verified").length,
    rejected: data.filter(a => a.status === "rejected").length,
  };

  const handleStatus = (id: number, status: string) => {
    updateMut.mutate({ id, data: { status } });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">Application Inbox</h2>
        <p className="text-muted-foreground mt-1">Review incoming requests from KOLs and Projects. Grant or deny access.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(["all", "pending", "verified", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`glass-panel px-4 py-3 rounded-xl text-left transition-all border ${
              statusFilter === f ? "border-primary/50 bg-primary/10" : "border-white/5 hover:border-white/20"
            }`}
          >
            <div className="text-2xl font-bold">{counts[f]}</div>
            <div className="text-xs text-muted-foreground capitalize mt-0.5">{f === "all" ? "Total" : f}</div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center glass-panel rounded-xl text-muted-foreground">
            {statusFilter === "all" ? "No applications yet." : `No ${statusFilter} applications.`}
          </div>
        ) : filtered.map(app => (
          <div key={app.id} className="glass-panel p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: app.type === "kol" ? "#00E5FF" : "#FFD700" }} />
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${app.type === "kol" ? "bg-[#00E5FF]/20 text-[#00E5FF]" : "bg-[#FFD700]/20 text-[#FFD700]"}`}>
                    {app.type}
                  </span>
                  <AppStatusBadge status={app.status} />
                </div>
                <h3 className="text-xl font-bold">{app.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(app.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                {app.userId && (
                  <p className="text-xs text-muted-foreground">User ID: <span className="text-foreground font-mono">{app.userId}</span></p>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  {app.status !== "verified" && (
                    <button
                      onClick={() => handleStatus(app.id, "verified")}
                      disabled={updateMut.isPending}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 font-bold text-sm hover:bg-green-500/30 transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Grant Access
                    </button>
                  )}
                  {app.status !== "rejected" && (
                    <button
                      onClick={() => handleStatus(app.id, "rejected")}
                      disabled={updateMut.isPending}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500/30 transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  )}
                  {app.status !== "pending" && (
                    <button
                      onClick={() => handleStatus(app.id, "pending")}
                      disabled={updateMut.isPending}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-muted-foreground border border-white/10 font-bold text-xs hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      Reset to Pending
                    </button>
                  )}
                </div>
              </div>

              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Telegram</span>
                  <a href={`https://t.me/${app.telegram.replace("@", "")}`} target="_blank" className="text-primary hover:underline text-sm">{app.telegram}</a>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Social Media</span>
                  <a href={app.socialMedia} target="_blank" className="text-blue-400 hover:underline text-sm truncate block">{app.socialMedia}</a>
                </div>
                {(app.additionalLink1 || app.additionalLink2) && (
                  <div className="sm:col-span-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Additional Links</span>
                    <div className="flex gap-4">
                      {app.additionalLink1 && <a href={app.additionalLink1} target="_blank" className="text-xs text-muted-foreground hover:text-foreground hover:underline truncate max-w-[200px]">{app.additionalLink1}</a>}
                      {app.additionalLink2 && <a href={app.additionalLink2} target="_blank" className="text-xs text-muted-foreground hover:text-foreground hover:underline truncate max-w-[200px]">{app.additionalLink2}</a>}
                    </div>
                  </div>
                )}
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-white/5">
                  <span className="text-xs font-bold text-muted-foreground uppercase block mb-2">About</span>
                  <p className="text-sm bg-white/5 p-3 rounded-lg leading-relaxed">{app.about}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
