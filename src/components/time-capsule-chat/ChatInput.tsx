"use client";

import { useState } from "react";
import { ArrowUp, Gift, X } from "lucide-react";
import type { ChatMessage } from "./types";

interface ChatInputProps {
  onSend: (message: string, replyTo?: { id: string; senderName: string; content: string }) => void;
  onGiftClick: () => void;
  replyTo?: ChatMessage | null;
  onCancelReply?: () => void;
}

export function ChatInput({ onSend, onGiftClick, replyTo, onCancelReply }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    // 답글 정보 포함해서 전송
    if (replyTo) {
      onSend(message.trim(), {
        id: replyTo.id,
        senderName: replyTo.sender?.name || '참여자',
        content: replyTo.content,
      });
    } else {
      onSend(message.trim());
    }
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-5 pb-8 pt-2">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
          <div className="flex-1 border-l-2 border-primary pl-2">
            <p className="text-size-10 font-medium text-primary">{replyTo.sender?.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{replyTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="w-5 h-5 rounded-full hover:bg-background flex items-center justify-center"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Gift button - outside input, far left */}
        <button
          onClick={onGiftClick}
          className="p-2.5 border-2 border-primary rounded-full hover:bg-primary/10 transition-colors shrink-0"
        >
          <Gift className="w-5 h-5 text-primary" />
        </button>

        {/* Input area */}
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyTo ? "답글을 입력하세요..." : "말 한마디가 정말 큰 힘이 됩니다."}
            className="flex-1 bg-transparent text-base outline-none text-foreground placeholder:text-muted-foreground"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center transition-all
              ${message.trim()
                ? 'bg-foreground text-white'
                : 'bg-muted-foreground/20 text-muted-foreground'}
            `}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
