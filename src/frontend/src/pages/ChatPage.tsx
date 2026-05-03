import { deleteMessage as apiDeleteMessage, updateChatTitle } from "@/api";
import ImageUploader from "@/components/ImageUploader";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import VoiceRecorder from "@/components/VoiceRecorder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useChat, useSubmitDoubt } from "@/hooks/useChats";
import { chatKey } from "@/hooks/useChats";
import type { Message, Subject } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import {
  Bot,
  Check,
  ChevronDown,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Pencil,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Subject badge colors
// ---------------------------------------------------------------------------
const SUBJECT_COLORS: Record<Subject, string> = {
  Math: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  Physics: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  Chemistry: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  Biology: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  History: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  Language: "bg-accent/15 text-accent border-accent/30",
  Other: "bg-muted text-muted-foreground border-border",
};

// ---------------------------------------------------------------------------
// Timestamp helper
// ---------------------------------------------------------------------------
function formatTs(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Typing dots
// ---------------------------------------------------------------------------
function TypingDots() {
  return (
    <output
      className="flex items-center gap-1 px-3 py-2"
      aria-label="AI is thinking"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.15,
          }}
        />
      ))}
    </output>
  );
}

// ---------------------------------------------------------------------------
// Single Message
// ---------------------------------------------------------------------------
function MessageBubble({
  msg,
  onDelete,
}: { msg: Message; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`group flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary/15 text-primary"
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>

      {/* Bubble */}
      <div
        className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium ${
              isUser ? "text-muted-foreground" : "text-primary"
            }`}
          >
            {isUser ? "You" : "AI"}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {formatTs(msg.timestamp)}
          </span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary/15 text-foreground rounded-tr-sm border border-primary/20"
              : "bg-card text-foreground rounded-tl-sm border border-border"
          }`}
        >
          {/* Image preview */}
          {msg.imageUrl?.startsWith("data:image") && (
            <img
              src={msg.imageUrl}
              alt="Uploaded content"
              className="w-full max-w-xs rounded-lg mb-2 object-contain"
            />
          )}
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {msg.content}
            </p>
          ) : (
            <MarkdownRenderer content={msg.content} />
          )}
        </div>

        {/* Delete button — appears on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    aria-label="Delete this message"
                    data-ocid="message.delete_button"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-1 py-0.5 rounded"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="message.dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete message?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="message.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      data-ocid="message.confirm_button"
                      onClick={() => onDelete(msg.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Input tabs
// ---------------------------------------------------------------------------
type TabId = "text" | "image" | "voice";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "text", label: "Text", icon: <MessageSquare size={14} /> },
  { id: "image", label: "Image", icon: <ImageIcon size={14} /> },
  { id: "voice", label: "Voice", icon: <Mic size={14} /> },
];

// ---------------------------------------------------------------------------
// ChatPage
// ---------------------------------------------------------------------------
export default function ChatPage() {
  const { chatId } = useParams({ from: "/chat/$chatId" });
  const { data: chat, isLoading: chatLoading } = useChat(chatId);
  const submitMutation = useSubmitDoubt(chatId);
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("text");
  const [text, setText] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isLoading = submitMutation.isPending;

  // auto-scroll
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  // auto-resize textarea
  useEffect(() => {
    const ta = textAreaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }); // re-runs on every render; textarea ref content drives the resize

  // Title editing
  const titleMutation = useMutation({
    mutationFn: (newTitle: string) => updateChatTitle(chatId, newTitle),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKey(chatId) });
      setEditingTitle(false);
    },
    onError: () => toast.error("Failed to update title"),
  });

  const startEditTitle = () => {
    setTitleDraft(chat?.title ?? "");
    setEditingTitle(true);
  };

  const commitTitle = () => {
    if (titleDraft.trim() && titleDraft !== chat?.title) {
      titleMutation.mutate(titleDraft.trim());
    } else {
      setEditingTitle(false);
    }
  };

  // Delete message
  const deleteMsg = useMutation({
    mutationFn: (msgId: string) => apiDeleteMessage(chatId, msgId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKey(chatId) });
      toast.success("Message deleted");
    },
    onError: () => toast.error("Failed to delete message"),
  });

  // Submit text
  const handleTextSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    submitMutation.mutate(
      { content: trimmed, inputType: "text" },
      {
        onError: () => toast.error("Failed to submit doubt. Please try again."),
      },
    );
    setText("");
  }, [text, isLoading, submitMutation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  // Submit image
  const handleImageSubmit = (imageData: string, caption: string) => {
    const content =
      caption.trim() || "Please analyze this image and explain what you see.";
    submitMutation.mutate(
      { content, inputType: "image", imageData },
      { onError: () => toast.error("Failed to submit image doubt.") },
    );
  };

  // Submit voice
  const handleVoiceSubmit = (transcript: string) => {
    submitMutation.mutate(
      { content: transcript, inputType: "voice" },
      { onError: () => toast.error("Failed to submit voice doubt.") },
    );
  };

  const charCount = text.length;
  const MAX_CHARS = 4000;

  const messages = useMemo(() => chat?.messages ?? [], [chat]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background"
      data-ocid="chat.page"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        {chatLoading ? (
          <Skeleton className="h-5 w-48" />
        ) : editingTitle ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") setEditingTitle(false);
              }}
              aria-label="Edit chat title"
              data-ocid="chat.title_input"
              className="flex-1 min-w-0 bg-transparent border-b border-primary text-foreground font-semibold text-base focus:outline-none px-0.5"
            />
            <button
              type="button"
              onClick={commitTitle}
              aria-label="Save title"
              data-ocid="chat.save_button"
              className="text-primary hover:text-primary/70 transition-colors"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={() => setEditingTitle(false)}
              aria-label="Cancel title edit"
              data-ocid="chat.cancel_button"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1
              className="text-base font-semibold text-foreground truncate"
              data-ocid="chat.title"
            >
              {chat?.title ?? "Conversation"}
            </h1>
            <button
              type="button"
              onClick={startEditTitle}
              aria-label="Edit chat title"
              data-ocid="chat.edit_button"
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}
        {chat?.subject && (
          <Badge
            variant="outline"
            className={`shrink-0 text-xs ${SUBJECT_COLORS[chat.subject]}`}
            data-ocid="chat.subject_badge"
          >
            {chat.subject}
          </Badge>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scroll-smooth"
        data-ocid="chat.messages_list"
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        {chatLoading && (
          <div className="space-y-4" data-ocid="chat.loading_state">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
              >
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5 max-w-xs">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!chatLoading && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full min-h-[40vh] gap-4 text-center"
            data-ocid="chat.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bot size={32} className="text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Start by asking your first doubt
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Type, upload an image, or record your voice below
              </p>
            </div>
          </motion.div>
        )}

        {!chatLoading &&
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onDelete={(id) => deleteMsg.mutate(id)}
            />
          ))}

        {isLoading && (
          <div className="flex gap-3" data-ocid="chat.loading_state">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Bot size={15} className="text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            data-ocid="chat.scroll_button"
            className="absolute right-6 bottom-[240px] w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-smooth"
          >
            <ChevronDown size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input panel */}
      <div
        className="shrink-0 border-t border-border bg-card px-4 pt-3 pb-4"
        data-ocid="chat.input_panel"
        aria-label="Input panel"
      >
        {/* Tabs */}
        <div
          className="flex gap-1 mb-3"
          role="tablist"
          aria-label="Input method"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              data-ocid={`chat.${tab.id}_tab`}
              onClick={() => setActiveTab(tab.id)}
              disabled={isLoading}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-smooth
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-label={`${activeTab} input`}
        >
          {/* Text */}
          {activeTab === "text" && (
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  ref={textAreaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your doubt here... (Enter to send, Shift+Enter for newline)"
                  disabled={isLoading}
                  aria-label="Type your doubt"
                  data-ocid="chat.text_input"
                  rows={2}
                  className="resize-none pr-16 min-h-[60px] max-h-[160px] text-sm"
                />
                <span
                  className={`absolute bottom-2.5 right-3 text-xs tabular-nums ${
                    charCount > MAX_CHARS * 0.9
                      ? "text-destructive"
                      : "text-muted-foreground/50"
                  }`}
                  aria-live="polite"
                  aria-label={`${charCount} of ${MAX_CHARS} characters used`}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
              <Button
                type="button"
                onClick={handleTextSubmit}
                disabled={isLoading || !text.trim()}
                className="w-full gap-2"
                aria-label="Submit text doubt"
                data-ocid="chat.text_submit_button"
              >
                <Send size={15} />
                {isLoading ? "AI is thinking..." : "Ask"}
              </Button>
            </div>
          )}

          {/* Image */}
          {activeTab === "image" && (
            <ImageUploader onSubmit={handleImageSubmit} isLoading={isLoading} />
          )}

          {/* Voice */}
          {activeTab === "voice" && (
            <VoiceRecorder onSubmit={handleVoiceSubmit} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}
