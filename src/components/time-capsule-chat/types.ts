export interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system" | "participant";
  content: string;
  time?: string;
  isGift?: boolean;
  giftData?: {
    icon: string;
    name: string;
  };
  sender?: {
    name: string;
    relation: string;
  };
  variant?: "default" | "dday" | "action" | "sent" | "intro";
  actionType?: "send_letter";
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
}

export interface Participant {
  id: string;
  name: string;
  relation: string;
  hasJoined: boolean;
  isActive: boolean;
  messageCount: number;
  lastMessageAt?: string | null;
  isOwner?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  exampleMessage?: string;
}

export interface Notice {
  id: string;
  type: "notice" | "weather";
  content: string;
  icon: "megaphone" | "weather";
}

export interface Guide {
  id: number;
  label: string;
  content: string;
}
