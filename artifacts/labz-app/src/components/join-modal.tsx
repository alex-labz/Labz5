import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateApplication } from "@workspace/api-client-react";

const kolSchema = z.object({
  type: z.literal("kol"),
  name: z.string().min(2, "Name is required"),
  telegram: z.string().min(2, "Telegram username is required"),
  socialMedia: z.string().min(2, "Primary social media link is required"),
  additionalLink1: z.string().optional(),
  additionalLink2: z.string().optional(),
  about: z.string().min(10, "Please provide a brief description").max(150, "Maximum 150 characters"),
  consent1: z.boolean().refine(val => val === true, "You must agree to sign a contract"),
  consent2: z.boolean().optional(),
});

const projectSchema = z.object({
  type: z.literal("project"),
  name: z.string().min(2, "Name is required"),
  telegram: z.string().min(2, "Telegram username is required"),
  socialMedia: z.string().min(2, "Primary social media link is required"),
  additionalLink1: z.string().optional(),
  additionalLink2: z.string().optional(),
  about: z.string().min(10, "Please provide a brief description").max(150, "Maximum 150 characters"),
  consent1: z.boolean().refine(val => val === true, "You must agree to the confidentiality terms"),
  consent2: z.boolean().refine(val => val === true, "You must agree to the legally binding agreement"),
});

const applicationSchema = z.discriminatedUnion("type", [kolSchema, projectSchema]);

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export function JoinLabzModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"kol" | "project">("kol");
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { type: "kol" }
  });

  const createApplication = useCreateApplication();

  const onSubmit = async (data: ApplicationFormValues) => {
    try {
      await createApplication.mutateAsync({
        data: {
          type: data.type,
          name: data.name,
          telegram: data.telegram,
          socialMedia: data.socialMedia,
          additionalLink1: data.additionalLink1,
          additionalLink2: data.additionalLink2,
          about: data.about
        }
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        reset();
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Failed to submit application", error);
    }
  };

  const switchTab = (newTab: "kol" | "project") => {
    setTab(newTab);
    setValue("type", newTab);
    reset({ type: newTab, consent1: false, consent2: false });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0D0D0D] border border-[#2E2E2E] rounded-none shadow-2xl overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto font-mono"
        >
          <div className="console-header relative z-10 w-full">
            LABZ_MEDIA &gt; JOIN_PROCESS.exe
            <button
              onClick={onClose}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center border border-[#333] bg-transparent text-[#555] hover:border-[#FF0000] hover:text-[#FF0000] transition-colors rounded-none"
            >
              <X size={14} />
            </button>
          </div>

          {isSuccess ? (
            <div className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <pre className="text-[#00FF00] font-mono text-[10px] sm:text-sm mb-6 leading-tight text-left">
                {`  ██████╗  ██╗  ██╗
  ██╔═══██╗██║ ██╔╝
  ██║   ██║█████╔╝ 
  ██║   ██║██╔═██╗ 
  ██████╔╝██║  ██╗ 
  ╚═════╝ ╚═╝  ╚═╝ `}
              </pre>
              <h3 className="text-xl font-bold mb-2 text-[#00FF00]">&gt; APPLICATION_RECEIVED</h3>
              <p className="text-[#555] max-w-md text-sm">
                Thank you for applying. Our system is processing your details. We will contact you via Telegram.
              </p>
            </div>
          ) : (
            <div className="p-0">
              <div className="border-b border-[#2E2E2E] flex gap-8 px-6 bg-[#0A0A0A]">
                <button
                  onClick={() => switchTab("kol")}
                  className={`py-4 text-sm font-bold transition-all border-b-2 ${
                    tab === "kol" ? "text-[#00FF00] border-[#00FF00]" : "text-[#555] border-transparent hover:text-[#D9D9D9]"
                  }`}
                >
                  [ KOL ]
                </button>
                <button
                  onClick={() => switchTab("project")}
                  className={`py-4 text-sm font-bold transition-all border-b-2 ${
                    tab === "project" ? "text-[#00FF00] border-[#00FF00]" : "text-[#555] border-transparent hover:text-[#D9D9D9]"
                  }`}
                >
                  [ PROJECT ]
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6 sm:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">// NAME_OR_ALIAS *</label>
                    <input
                      {...register("name")}
                      className="console-input"
                      placeholder="Satoshi Nakamoto"
                    />
                    {errors.name && <p className="text-[#FF0000] text-xs mt-1">! {errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">// TELEGRAM_HANDLE *</label>
                    <input
                      {...register("telegram")}
                      className="console-input"
                      placeholder="@username"
                    />
                    {errors.telegram && <p className="text-[#FF0000] text-xs mt-1">! {errors.telegram.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">// PRIMARY_SOCIAL_LINK *</label>
                  <input
                    {...register("socialMedia")}
                    className="console-input"
                    placeholder="https://x.com/..."
                  />
                  {errors.socialMedia && <p className="text-[#FF0000] text-xs mt-1">! {errors.socialMedia.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">// ADDITIONAL_LINK_1</label>
                    <input
                      {...register("additionalLink1")}
                      className="console-input"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">// ADDITIONAL_LINK_2</label>
                    <input
                      {...register("additionalLink2")}
                      className="console-input"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-2">// DESCRIPTION *</label>
                  <textarea
                    {...register("about")}
                    rows={3}
                    className="console-input resize-none"
                    placeholder="Brief description (max 150 chars)"
                  />
                  {errors.about && <p className="text-[#FF0000] text-xs mt-1">! {errors.about.message}</p>}
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        {...register("consent1")}
                        className="peer sr-only"
                      />
                      <div className="text-[#555] peer-checked:text-[#00FF00] font-mono text-sm leading-none select-none">
                        <span className="peer-checked:hidden">[ ]</span>
                        <span className="hidden peer-checked:inline">[✓]</span>
                      </div>
                    </div>
                    <span className="text-xs text-[#666] group-hover:text-[#D9D9D9] transition-colors leading-tight">
                      {tab === "kol" 
                        ? "If selected, I agree to sign a contract with Labz Media." 
                        : "I understand that Labz Media data is strictly confidential."}
                    </span>
                  </label>
                  {errors.consent1 && <p className="text-[#FF0000] text-xs ml-8">! {errors.consent1.message}</p>}

                  {tab === "project" && (
                    <>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            {...register("consent2")}
                            className="peer sr-only"
                          />
                          <div className="text-[#555] peer-checked:text-[#00FF00] font-mono text-sm leading-none select-none">
                            <span className="peer-checked:hidden">[ ]</span>
                            <span className="hidden peer-checked:inline">[✓]</span>
                          </div>
                        </div>
                        <span className="text-xs text-[#666] group-hover:text-[#D9D9D9] transition-colors leading-tight">
                          I agree to enter a legally binding agreement if approved.
                        </span>
                      </label>
                      {errors.consent2 && <p className="text-[#FF0000] text-xs ml-8">! {errors.consent2.message}</p>}
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={createApplication.isPending}
                  className="console-btn-primary w-full mt-6"
                >
                  {createApplication.isPending ? "[ PROCESSING... ]" : "[ SUBMIT_APPLICATION ]"} 
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}