import { detectSubject } from "@/api";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useChats, useCreateChat, useDeleteChat } from "@/hooks/useChats";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlus, Search, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";

const SUBJECTS: Array<Subject | "All"> = [
  "All",
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Language",
  "Other",
];

const SUBJECT_COLORS: Record<Subject, string> = {
  Math: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  Physics: "bg-purple-500/10 text-purple-400 border-purple-500/25",
  Chemistry: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  Biology: "bg-lime-500/10 text-lime-400 border-lime-500/25",
  History: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  Language: "bg-rose-500/10 text-rose-400 border-rose-500/25",
  Other: "bg-muted text-muted-foreground border-border",
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState<Subject | "All">("All");
  const [isCreating, setIsCreating] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const newChatInputRef = useRef<HTMLInputElement>(null);

  const { data: chats, isLoading } = useChats();
  const createChat = useCreateChat();
  const deleteChat = useDeleteChat();
  const params = useParams({ strict: false }) as { chatId?: string };

  const filtered = (chats ?? []).filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.title.toLowerCase().includes(q) ||
      c.messages.some((m) => m.content.toLowerCase().includes(q));
    const matchSubject = activeSubject === "All" || c.subject === activeSubject;
    return matchSearch && matchSubject;
  });

  async function handleCreate() {
    const title = newChatTitle.trim() || "New Conversation";
    const subject = await detectSubject(title);
    const result = await createChat.mutateAsync({ title, subject });
    setIsCreating(false);
    setNewChatTitle("");
    onClose();
    return result;
  }

  function startCreating() {
    setIsCreating(true);
    setTimeout(() => newChatInputRef.current?.focus(), 50);
  }

  function cancelCreating() {
    setIsCreating(false);
    setNewChatTitle("");
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          aria-hidden="true"
          role="presentation"
        />
      )}

      <aside
        aria-label="Conversations sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-72 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border shrink-0">
          <span className="font-display text-sm font-semibold text-sidebar-foreground tracking-tight">
            Conversations
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
            data-ocid="sidebar.close_button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* New conversation */}
        <div className="p-3 border-b border-sidebar-border shrink-0">
          {isCreating ? (
            <div className="space-y-2">
              <Input
                ref={newChatInputRef}
                placeholder="Describe your doubt topic\u2026"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") cancelCreating();
                }}
                className="h-8 text-sm bg-sidebar-accent border-sidebar-border focus:border-primary/50"
                aria-label="New conversation title"
                data-ocid="sidebar.new_chat_input"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={handleCreate}
                  disabled={createChat.isPending}
                  aria-label="Create conversation"
                  data-ocid="sidebar.create_chat_button"
                >
                  {createChat.isPending ? "Creating\u2026" : "Create"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={cancelCreating}
                  aria-label="Cancel creating conversation"
                  data-ocid="sidebar.cancel_create_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="w-full gap-2 h-9 text-sm font-medium"
              onClick={startCreating}
              aria-label="Start new conversation"
              data-ocid="sidebar.new_conversation_button"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Conversation
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search conversations\u2026"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-sidebar-accent border-sidebar-border focus:border-primary/50"
              aria-label="Search conversations"
              data-ocid="sidebar.search_input"
            />
          </div>
        </div>

        {/* Subject filter chips */}
        <div className="px-3 pb-2 shrink-0" aria-label="Filter by subject">
          <div className="flex flex-wrap gap-1">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSubject(s)}
                aria-pressed={activeSubject === s}
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs border transition-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  activeSubject === s
                    ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                    : "text-muted-foreground border-border hover:border-primary/30 hover:text-foreground",
                )}
                data-ocid={`sidebar.filter.${s.toLowerCase()}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1 min-h-0">
          <nav aria-label="Conversation list">
            <div className="px-2 pb-2 space-y-0.5">
              {isLoading ? (
                ["s1", "s2", "s3", "s4"].map((k) => (
                  <div key={k} className="p-3 space-y-1.5 rounded-md">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-3 py-12 px-4 text-center"
                  data-ocid="sidebar.empty_state"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <MessageSquarePlus className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground/70">
                      {search ? "No results found" : "No conversations yet"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {search
                        ? "Try a different search term"
                        : "Start a new conversation above"}
                    </p>
                  </div>
                </div>
              ) : (
                filtered.map((chat, i) => (
                  <Link
                    key={chat.id}
                    to="/chat/$chatId"
                    params={{ chatId: chat.id }}
                    onClick={onClose}
                    aria-current={
                      params.chatId === chat.id ? "page" : undefined
                    }
                    className={cn(
                      "group flex items-start gap-2.5 w-full rounded-lg p-2.5 transition-smooth text-left hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      params.chatId === chat.id
                        ? "bg-sidebar-accent border border-sidebar-primary/20"
                        : "border border-transparent",
                    )}
                    data-ocid={`sidebar.chat.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-sidebar-foreground truncate leading-relaxed mb-1">
                        {chat.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
                            SUBJECT_COLORS[chat.subject],
                          )}
                        >
                          {chat.subject}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(chat.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth mt-0.5"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          aria-label={`Delete conversation: ${chat.title}`}
                          data-ocid={`sidebar.delete_chat_button.${i + 1}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="sidebar.delete_chat_dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete conversation?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{chat.title}" and all
                            its messages. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="sidebar.delete_chat_cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            data-ocid="sidebar.delete_chat_confirm_button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat.mutate(chat.id);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </Link>
                ))
              )}
            </div>
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
