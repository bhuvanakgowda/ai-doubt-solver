import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type ChatId = bigint;
export interface MessageInfo {
    id: MessageId;
    inputType: InputType;
    content: string;
    role: MessageRole;
    timestamp: Timestamp;
    chatId: ChatId;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ChatInfo {
    id: ChatId;
    title: string;
    subject: Subject;
    userId: Principal;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface SubmitDoubtResult {
    subject: Subject;
    aiMessageId: MessageId;
    userMessageId: MessageId;
    aiResponse: string;
}
export type MessageId = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ChatWithMessages {
    messages: Array<MessageInfo>;
    chat: ChatInfo;
}
export enum InputType {
    voice = "voice",
    text = "text",
    image = "image"
}
export enum MessageRole {
    user = "user",
    assistant = "assistant"
}
export enum Subject {
    biology = "biology",
    other = "other",
    math = "math",
    history = "history",
    language = "language",
    chemistry = "chemistry",
    physics = "physics"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMessage(chatId: ChatId, role: MessageRole, content: string, inputType: InputType): Promise<MessageId | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createChat(firstQuestion: string): Promise<[ChatId, string]>;
    deleteChat(chatId: ChatId): Promise<boolean>;
    deleteMessage(messageId: MessageId): Promise<boolean>;
    getCallerUserRole(): Promise<UserRole>;
    getChat(chatId: ChatId): Promise<ChatWithMessages | null>;
    getUserChats(): Promise<Array<ChatInfo>>;
    isCallerAdmin(): Promise<boolean>;
    submitDoubt(chatId: ChatId, inputType: InputType, content: string, imageKey: string | null): Promise<SubmitDoubtResult>;
    transformGroq(input: TransformationInput): Promise<TransformationOutput>;
}
