export type Subject =
  | "Math"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "History"
  | "Language"
  | "Other";

export type InputType = "text" | "image" | "voice";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  inputType: InputType;
  imageUrl?: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  subject: Subject;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateChatInput {
  title: string;
  subject: Subject;
}

export interface SubmitDoubtInput {
  chatId: string;
  content: string;
  inputType: InputType;
  imageData?: string;
}
