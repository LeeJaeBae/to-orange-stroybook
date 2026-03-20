"use client";

import { useRef, useEffect } from "react";
import { Sparkles, Gift, User, Coffee, Flower2, Send, Stamp, Reply } from "lucide-react";
import type { ChatMessage } from "./types";

const giftIconMap: Record<string, React.ReactNode> = {
  coffee: <Coffee className="w-5 h-5 text-primary" />,
  gift: <Gift className="w-5 h-5 text-primary" />,
  flower: <Flower2 className="w-5 h-5 text-primary" />,
};

function getGiftIcon(iconKey: string) {
  return giftIconMap[iconKey] || <Gift className="w-5 h-5 text-primary" />;
}

interface ChatViewProps {
  messages: ChatMessage[];
  onAction?: (actionType: string, messageId: string) => void;
  onReply?: (message: ChatMessage) => void;
}

export function ChatView({ messages, onAction, onReply }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 메시지 추가 시 하단으로 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
      {messages.map((message) => (
        <div key={message.id} className="animate-fade-in-up">
          {message.type === "participant" ? (
            // Participant message - left aligned with avatar
            <div className="flex gap-2 group">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, hsl(35, 100%, 65%) 0%, hsl(20, 90%, 55%) 100%)',
                }}
              >
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{message.sender?.name}</span>
                  <span className="text-xs text-muted-foreground">({message.sender?.relation})</span>
                </div>
                <div className={`rounded-2xl rounded-tl-md px-3 py-2.5 ${message.isGift ? 'bg-secondary' : 'bg-muted'} relative`}>
                  {/* Reply reference */}
                  {message.replyTo && (
                    <div className="mb-2 pl-2 border-l-2 border-primary/50 bg-primary/5 rounded-r-lg py-1.5 px-2">
                      <p className="text-size-10 font-medium text-primary">{message.replyTo.senderName}</p>
                      <p className="text-size-10 text-muted-foreground line-clamp-1">{message.replyTo.content}</p>
                    </div>
                  )}
                  {message.isGift && message.giftData && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {getGiftIcon(message.giftData.icon)}
                      </div>
                      <span className="text-xs font-medium text-primary">{message.giftData.name}</span>
                    </div>
                  )}
                  {/* ⚠️ 마크다운/HTML 렌더링 도입 시 반드시 sanitize 필요 */}
                  <p className="text-sm text-foreground">{message.content}</p>
                </div>
                <div className="flex items-center gap-2">
                  {message.time && (
                    <p className="text-size-10 text-muted-foreground">{message.time}</p>
                  )}
                  {/* Reply button */}
                  <button
                    onClick={() => onReply?.(message)}
                    className="text-size-10 text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                    답글
                  </button>
                </div>
              </div>
            </div>
          ) : message.type === "user" ? (
            // User message - right aligned bubble
            <div className="flex justify-end">
              <div className="bg-muted rounded-3xl rounded-br-lg px-4 py-3 max-w-[80%]">
                {/* ⚠️ 마크다운/HTML 렌더링 도입 시 반드시 sanitize 필요 */}
                <p className="text-sm text-foreground">{message.content}</p>
              </div>
            </div>
          ) : message.type === "system" ? (
            // System message - centered with variants
            <div className="flex justify-center flex-col items-center gap-2">
              {message.variant === "intro" ? (
                // Intro welcome message
                <div className="bg-gradient-to-br from-secondary via-secondary/80 to-primary/10 rounded-2xl p-5 mx-2 border border-primary/10">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{message.content}</p>
                </div>
              ) : message.variant === "action" ? (
                // Action button system message
                <button
                  onClick={() => onAction?.(message.actionType || "", message.id)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Stamp className="w-4 h-4" />
                  <span className="text-sm font-medium">{message.content}</span>
                  <Send className="w-4 h-4" />
                </button>
              ) : message.variant === "sent" ? (
                // Sent confirmation message
                <div className="flex flex-col items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/30 rounded-2xl px-6 py-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{message.content}</span>
                </div>
              ) : (
                // Default system message
                <div className="flex items-center bg-secondary/50 rounded-full px-4 py-2">
                  <span className="text-xs text-muted-foreground">{message.content}</span>
                </div>
              )}
            </div>
          ) : (
            // Assistant message
            <div className="space-y-2">
              <div className="bg-muted/50 rounded-3xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">AI</span>
                </div>
                {/* ⚠️ 마크다운/HTML 렌더링 도입 시 반드시 sanitize 필요 */}
                <p className="text-sm text-foreground leading-relaxed">{message.content}</p>

                {/* Gift card if applicable */}
                {message.isGift && message.giftData && (
                  <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Gift className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{message.giftData.name}</p>
                        <p className="text-xs text-muted-foreground">선물이 전달되었어요</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {message.time && (
                <p className="text-size-10 text-muted-foreground text-center">{message.time}</p>
              )}
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
