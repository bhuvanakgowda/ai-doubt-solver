import { useAuth } from "@/hooks/useAuth";
import { useCreateChat } from "@/hooks/useChats";
import type { InputType } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Camera,
  ChevronRight,
  MessageSquare,
  Mic,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

const inputModes: {
  type: InputType;
  icon: typeof MessageSquare;
  title: string;
  description: string;
  ocid: string;
}[] = [
  {
    type: "text",
    icon: MessageSquare,
    title: "Ask a question",
    description:
      "Type your doubt and receive a step-by-step explanation from your AI tutor.",
    ocid: "home.ask_text_button",
  },
  {
    type: "image",
    icon: Camera,
    title: "Upload an image",
    description:
      "Photograph a diagram, equation, or textbook problem and let AI analyze it.",
    ocid: "home.ask_image_button",
  },
  {
    type: "voice",
    icon: Mic,
    title: "Record your voice",
    description:
      "Speak your question aloud — your voice is transcribed and answered instantly.",
    ocid: "home.ask_voice_button",
  },
];

const subjects = [
  { label: "Math", emoji: "📐" },
  { label: "Physics", emoji: "⚡" },
  { label: "Chemistry", emoji: "⚗️" },
  { label: "Biology", emoji: "🧬" },
  { label: "History", emoji: "📖" },
  { label: "Language", emoji: "🌍" },
];

export default function HomePage() {
  const { shortPrincipal, isAuthenticated } = useAuth();
  const { mutateAsync: createChat, isPending } = useCreateChat();
  const navigate = useNavigate();

  async function handleModeSelect(inputType: InputType) {
    if (isPending) return;
    const titles: Record<InputType, string> = {
      text: "New text question",
      image: "New image question",
      voice: "New voice question",
    };
    try {
      const chat = await createChat({
        title: titles[inputType],
        subject: "Other",
      });
      navigate({ to: "/chat/$chatId", params: { chatId: chat.id } });
    } catch {
      toast.error("Failed to start conversation. Please try again.");
    }
  }

  return (
    <div
      data-ocid="home.page"
      className="min-h-full flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-10">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-2">
            <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
            {isAuthenticated && shortPrincipal ? (
              <span className="text-xs font-medium text-primary font-display">
                Signed in as{" "}
                <span
                  data-ocid="home.principal_display"
                  className="font-mono text-primary"
                >
                  {shortPrincipal}
                </span>
              </span>
            ) : (
              <span className="text-xs font-medium text-primary font-display">
                AI Doubt Solver
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight text-balance-tight">
            What would you like to
            <br />
            <span className="text-primary">learn today?</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
            Choose how you want to ask your doubt — your AI tutor is ready.
          </p>
        </motion.div>

        {/* Mode selection cards */}
        <div
          data-ocid="home.mode_select"
          className="w-full grid grid-cols-1 gap-4"
          aria-label="Choose input mode"
        >
          {inputModes.map(
            ({ type, icon: Icon, title, description, ocid }, i) => (
              <motion.button
                key={type}
                data-ocid={ocid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + i * 0.1,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                onClick={() => handleModeSelect(type)}
                disabled={isPending}
                aria-label={`${title} — ${description}`}
                type="button"
                className="group relative w-full flex items-center gap-5 rounded-2xl border border-border bg-card p-5 text-left transition-smooth hover:border-primary/50 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {/* Card hover overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none"
                />

                {/* Icon */}
                <div className="relative z-10 shrink-0 w-14 h-14 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center group-hover:bg-primary/25 transition-smooth">
                  <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>

                {/* Text */}
                <div className="relative z-10 flex-1 min-w-0">
                  <p className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-smooth">
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                    {description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  aria-hidden="true"
                  className="relative z-10 shrink-0 w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth"
                />
              </motion.button>
            ),
          )}
        </div>

        {/* Loading indicator */}
        {isPending && (
          <motion.div
            data-ocid="home.loading_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
            aria-live="polite"
            aria-label="Creating new conversation"
          >
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Starting conversation…
          </motion.div>
        )}

        {/* Subject badge row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          aria-label="Supported subjects"
          className="flex flex-wrap justify-center gap-2"
        >
          {subjects.map(({ label, emoji }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              <span aria-hidden="true">{emoji}</span>
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
