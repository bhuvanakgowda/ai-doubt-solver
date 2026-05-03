import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Camera,
  Loader2,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

const features = [
  {
    icon: MessageSquare,
    label: "Ask by text",
    desc: "Type any question and get a step-by-step explanation instantly.",
  },
  {
    icon: Camera,
    label: "Upload an image",
    desc: "Snap a photo of a textbook problem or diagram for AI analysis.",
  },
  {
    icon: Mic,
    label: "Record your voice",
    desc: "Speak your doubt aloud — we'll transcribe and answer it.",
  },
];

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Login card */}
        <div
          data-ocid="login.card"
          className="rounded-2xl border border-border bg-card surface-elevated p-8 flex flex-col items-center text-center gap-6"
        >
          {/* Brand mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30"
          >
            <BookOpen className="w-8 h-8 text-primary" aria-hidden="true" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              AI Doubt Solver
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Your AI tutor — available 24/7
            </p>
          </div>

          {/* Feature highlights */}
          <div className="w-full grid grid-cols-3 gap-3">
            {features.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
                className="flex flex-col items-center gap-2 rounded-xl bg-muted/60 border border-border p-3"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <span className="text-xs text-muted-foreground font-medium leading-tight text-center">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full border-t border-border" />

          {/* Login button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.35 }}
            className="w-full"
          >
            <Button
              data-ocid="login.submit_button"
              onClick={() => login()}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold font-display gap-2"
              aria-label="Sign in with Internet Identity"
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    aria-hidden="true"
                  />
                  <span data-ocid="login.loading_state">Signing in…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>
          </motion.div>

          <p className="text-xs text-muted-foreground">
            Secure, privacy-first authentication via Internet Computer.
          </p>
        </div>

        {/* Feature detail rows */}
        <div className="mt-6 grid grid-cols-1 gap-3">
          {features.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.09, duration: 0.35 }}
              className="flex items-start gap-4 rounded-xl border border-border bg-card/60 px-4 py-3"
            >
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary/12 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground font-display">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
