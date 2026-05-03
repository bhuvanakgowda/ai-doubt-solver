import type {
  Chat,
  CreateChatInput,
  Message,
  Subject,
  SubmitDoubtInput,
} from "@/types";

// ---------------------------------------------------------------------------
// In-memory store (replaces canister calls until backend is wired)
// ---------------------------------------------------------------------------

const STORAGE_KEY = "ai_doubt_solver_chats";

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Chat[]) : [];
  } catch {
    return [];
  }
}

function saveChats(chats: Chat[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function fetchChats(): Promise<Chat[]> {
  return loadChats();
}

export async function fetchChat(chatId: string): Promise<Chat | null> {
  const chats = loadChats();
  return chats.find((c) => c.id === chatId) ?? null;
}

export async function createChat(input: CreateChatInput): Promise<Chat> {
  const chats = loadChats();
  const now = Date.now();
  const chat: Chat = {
    id: generateId(),
    title: input.title,
    subject: input.subject,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  chats.unshift(chat);
  saveChats(chats);
  return chat;
}

export async function deleteChat(chatId: string): Promise<void> {
  const chats = loadChats().filter((c) => c.id !== chatId);
  saveChats(chats);
}

export async function submitDoubt(input: SubmitDoubtInput): Promise<Message> {
  const chats = loadChats();
  const idx = chats.findIndex((c) => c.id === input.chatId);
  if (idx === -1) throw new Error("Chat not found");

  const now = Date.now();

  const userMsg: Message = {
    id: generateId(),
    role: "user",
    content: input.content,
    inputType: input.inputType,
    imageUrl: input.imageData,
    timestamp: now,
  };

  // Mock AI response based on subject
  const aiResponse = generateMockResponse(input.content, chats[idx].subject);

  const assistantMsg: Message = {
    id: generateId(),
    role: "assistant",
    content: aiResponse,
    inputType: "text",
    timestamp: now + 1000,
  };

  chats[idx].messages.push(userMsg, assistantMsg);
  chats[idx].updatedAt = now;
  saveChats(chats);

  return assistantMsg;
}

export async function updateChatTitle(
  chatId: string,
  title: string,
): Promise<void> {
  const chats = loadChats();
  const idx = chats.findIndex((c) => c.id === chatId);
  if (idx === -1) throw new Error("Chat not found");
  chats[idx].title = title;
  chats[idx].updatedAt = Date.now();
  saveChats(chats);
}

export async function deleteMessage(
  chatId: string,
  messageId: string,
): Promise<void> {
  const chats = loadChats();
  const idx = chats.findIndex((c) => c.id === chatId);
  if (idx === -1) throw new Error("Chat not found");
  chats[idx].messages = chats[idx].messages.filter((m) => m.id !== messageId);
  chats[idx].updatedAt = Date.now();
  saveChats(chats);
}

export async function detectSubject(content: string): Promise<Subject> {
  const lower = content.toLowerCase();
  if (
    /\b(equation|integral|derivative|matrix|calculus|algebra|geometry|trigonometry|probability|statistics)\b/.test(
      lower,
    )
  )
    return "Math";
  if (
    /\b(force|energy|velocity|acceleration|momentum|gravity|electric|magnetic|quantum|wave|thermodynamics)\b/.test(
      lower,
    )
  )
    return "Physics";
  if (
    /\b(element|compound|reaction|molecule|atom|bond|acid|base|oxidation|periodic|organic|inorganic)\b/.test(
      lower,
    )
  )
    return "Chemistry";
  if (
    /\b(cell|organism|evolution|genetics|dna|protein|ecosystem|photosynthesis|respiration|anatomy)\b/.test(
      lower,
    )
  )
    return "Biology";
  if (
    /\b(war|empire|revolution|civilization|historical|ancient|medieval|century|dynasty|colonization)\b/.test(
      lower,
    )
  )
    return "History";
  if (
    /\b(grammar|syntax|vocabulary|literature|poem|prose|narrative|metaphor|language|linguistics)\b/.test(
      lower,
    )
  )
    return "Language";
  return "Other";
}

function generateMockResponse(question: string, subject: Subject): string {
  const responses: Record<Subject, string> = {
    Math: `## Step-by-Step Solution\n\nGreat question! Let me break this down for you.\n\n**Understanding the Problem**\n\nWhen approaching "${question.slice(0, 60)}...", we first need to identify the key mathematical concepts involved.\n\n**Solution Steps**\n\n1. **Identify the type** — Determine what kind of problem this is (algebraic, geometric, etc.)\n2. **Apply relevant formulas** — Use the appropriate mathematical rules\n3. **Simplify step by step** — Work through each operation carefully\n4. **Verify your answer** — Check by substituting back\n\n**Key Concept**\n\nRemember that in mathematics, every step must be logically justified. Practice similar problems to build fluency.`,
    Physics: `## Physics Explanation\n\nLet's analyze this using fundamental physics principles.\n\n**Core Concept**\n\nFor "${question.slice(0, 60)}...", the relevant physics laws come into play.\n\n**Analysis**\n\n1. **Identify the system** — Define what you're studying\n2. **List known quantities** — Write down all given values with units\n3. **Apply Newton's Laws / Energy Conservation** — Choose the right framework\n4. **Solve the equations** — Work through the mathematics\n\n**Pro Tip**\n\nAlways draw a free-body diagram before solving any mechanics problem. It prevents sign errors and clarifies the physics.`,
    Chemistry: `## Chemical Analysis\n\nLet me explain this chemistry concept clearly.\n\n**Background**\n\nFor "${question.slice(0, 60)}...", understanding the atomic/molecular level is key.\n\n**Explanation**\n\n1. **Electronic structure** — Consider the valence electrons involved\n2. **Bonding type** — Identify ionic, covalent, or metallic bonds\n3. **Reaction mechanism** — Trace how atoms rearrange\n4. **Balance the equation** — Ensure atom conservation\n\n**Remember**\n\nChemistry is about understanding patterns. Similar elements in the same group behave similarly — use the periodic table strategically.`,
    Biology: `## Biological Concept\n\nLet me explain this biology topic step by step.\n\n**Overview**\n\nFor "${question.slice(0, 60)}...", we look at the biological systems involved.\n\n**Key Points**\n\n1. **Structural level** — From molecule → cell → tissue → organ → organism\n2. **Functional aspect** — How does this structure perform its role?\n3. **Evolutionary context** — Why did this trait evolve?\n4. **Clinical significance** — How does dysfunction cause disease?\n\n**Memory Tip**\n\nUse mnemonics and diagrams. Biology has many terms — visual associations help retention significantly.`,
    History: `## Historical Analysis\n\nLet me provide context for this historical topic.\n\n**Setting the Scene**\n\n"${question.slice(0, 60)}..." can be understood through multiple perspectives.\n\n**Key Factors**\n\n1. **Political context** — Who held power and why?\n2. **Economic forces** — What resources were at stake?\n3. **Social dynamics** — How did people live and relate?\n4. **Consequences** — What changed as a result?\n\n**Critical Thinking**\n\nHistory is written by the victors. Always consider: whose story is being told, and whose is being omitted?`,
    Language: `## Language & Literature\n\nLet me help you understand this language concept.\n\n**Analysis**\n\nFor "${question.slice(0, 60)}...", we examine the linguistic or literary elements.\n\n**Breakdown**\n\n1. **Grammatical structure** — Identify parts of speech and sentence patterns\n2. **Literary devices** — Look for metaphor, simile, alliteration, imagery\n3. **Authorial intent** — What effect does the writer create?\n4. **Context** — How does setting/time period influence meaning?\n\n**Study Tip**\n\nRead widely across genres. Exposure to varied writing styles naturally improves both comprehension and expression.`,
    Other: `## Comprehensive Answer\n\nHere's a thorough explanation for your question.\n\n**Understanding Your Doubt**\n\n"${question.slice(0, 60)}..." is an interesting question that requires careful thinking.\n\n**Key Points**\n\n1. **Define the core concept** — What exactly are you trying to understand?\n2. **Break it into parts** — Complex problems are just simple problems stacked\n3. **Apply reasoning** — Use logic and known facts\n4. **Verify understanding** — Can you explain it in your own words?\n\n**General Advice**\n\nThe best way to learn is to ask questions — and you're already doing that! Keep questioning, keep exploring.`,
  };
  return responses[subject];
}
