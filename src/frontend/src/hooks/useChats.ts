import {
  createChat,
  deleteChat,
  fetchChat,
  fetchChats,
  submitDoubt,
} from "@/api";
import type { CreateChatInput, SubmitDoubtInput } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const CHATS_KEY = ["chats"] as const;
export const chatKey = (id: string) => ["chat", id] as const;

export function useChats() {
  return useQuery({
    queryKey: CHATS_KEY,
    queryFn: fetchChats,
  });
}

export function useChat(chatId: string | undefined) {
  return useQuery({
    queryKey: chatKey(chatId ?? ""),
    queryFn: () => fetchChat(chatId!),
    enabled: !!chatId,
  });
}

export function useCreateChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChatInput) => createChat(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHATS_KEY });
    },
    onError: () => {
      toast.error("Failed to create conversation");
    },
  });
}

export function useDeleteChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => deleteChat(chatId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHATS_KEY });
      toast.success("Conversation deleted");
    },
    onError: () => {
      toast.error("Failed to delete conversation");
    },
  });
}

export function useSubmitDoubt(chatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<SubmitDoubtInput, "chatId">) =>
      submitDoubt({ ...input, chatId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKey(chatId) });
      qc.invalidateQueries({ queryKey: CHATS_KEY });
    },
    onError: () => {
      toast.error("Failed to submit doubt. Please try again.");
    },
  });
}
