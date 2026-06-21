import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, MessageSquare, Compass, ShieldAlert, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface YatraAITravelProps {
  userId?: string;
  onSelectTripId?: (tripId: string) => void;
}

export default function YatraAI({ userId, onSelectTripId }: YatraAITravelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! 🙏 Welcome to Yatra Nepal. I am **Yatra AI**, your Nepalese travel helper. I can find fast buses (VIP Sofa, Sleeper, AC Deluxe) from Kathmandu, handle cancellation questions, recommend routes, or activate secret promo codes! How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (userText: string) => {
    if (!userText.trim()) return;
    const newMsgs = [...messages, { role: "user" as const, content: userText }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({
            role: m.role,
            content: m.content
          })),
          userProfile: { userId }
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant" as const, content: data.reply }]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: "Namaste! It seems the direct server connection has high latency, but I can suggest: search **Kathmandu to Pokhara** or apply promo code **YATRA200** to get an instant discount on our VIP Sofa buses!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-slate-950/40 border-b border-slate-800/80 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-800 rounded-xl border border-slate-700/50">
            <Bot className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-wide flex items-center gap-1">
              Yatra AI Assistant 
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            </h4>
            <p className="text-[10px] text-slate-400">Live chat & travel scheduler</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest font-bold">
            Online
          </span>
        </div>
      </div>

      {/* Suggestion Quick Chips */}
      <div className="p-3 border-b border-slate-800/80 flex gap-2 overflow-x-auto scrollbar-none bg-slate-950/20">
        <button 
          onClick={() => handleSuggestClick("Suggest best buses from Kathmandu to Pokhara")}
          className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap hover:border-slate-500 hover:text-white transition-colors shrink-0 flex items-center gap-1.5 font-medium"
        >
          <Compass className="h-3 w-3 text-red-400" /> Kathmandu → Pokhara
        </button>
        <button 
          onClick={() => handleSuggestClick("What is refund policy?")}
          className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap hover:border-slate-500 hover:text-white transition-colors shrink-0 flex items-center gap-1.5 font-medium"
        >
          <ShieldAlert className="h-3 w-3 text-amber-500" /> Refund Policy
        </button>
        <button 
          onClick={() => handleSuggestClick("Any discount codes available?")}
          className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap hover:border-slate-500 hover:text-white transition-colors shrink-0 flex items-center gap-1.5 font-medium"
        >
          <Sparkles className="h-3 w-3 text-purple-400" /> Promo Codes
        </button>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[460px] min-h-[300px] scrollbar-none bg-slate-900/40">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-red-600 text-white rounded-br-none"
                  : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60"
              }`}
            >
              <div className="prose prose-invert prose-sm max-w-none break-words">
                {m.content.split("\n").map((line, lidx) => {
                  // Basic rendering for bold text **
                  let rendered = line;
                  const parts = [];
                  let lastIndex = 0;
                  const regex = /\*\*(.*?)\*\*/g;
                  let match; // variable declared cleanly

                  while ((match = regex.exec(line)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(line.substring(lastIndex, match.index));
                    }
                    parts.push(<strong key={match.index} className="text-red-400 font-bold">{match[1]}</strong>);
                    lastIndex = regex.lastIndex;
                  }
                  if (lastIndex < line.length) {
                    parts.push(line.substring(lastIndex));
                  }

                  // Detect and link tr_1, tr_2 etc which allows direct selector!
                  const tripIdMatch = m.role === "assistant" && line.match(/(tr_[1-9])/);
                  return (
                    <p key={lidx} className="mb-1 leading-relaxed">
                      {parts.length > 0 ? parts : line}
                      {tripIdMatch && onSelectTripId && (
                        <button
                          type="button"
                          onClick={() => onSelectTripId(tripIdMatch[1])}
                          className="ml-2 inline-flex items-center gap-1 text-[11px] text-white bg-red-656 bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-full shadow-md transition-all font-bold"
                        >
                          Book {tripIdMatch[1]} <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-400 border border-slate-700/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1.5 text-slate-400 font-medium font-mono text-[10px]">Yatra AI is checking schedules...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Console */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 border-t border-slate-800 bg-slate-950/40 flex gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Yatra AI e.g. Book VIP Sofa..."
          className="flex-1 bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-red-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all disabled:opacity-40 shadow-sm shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
