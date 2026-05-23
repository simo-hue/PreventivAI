"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Profile {
  full_name: string;
  role: string;
}

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: Profile | null;
}

export function ChatBox({ 
  requestId, 
  currentUserId 
}: { 
  requestId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 10000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    setSending(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputValue }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setInputValue("");
        
        // Rilancia l'analisi se chi scrive non è admin (così il nuovo testo sblocca l'analisi)
        // O semplicemente ricarica la pagina per far vedere gli aggiornamenti se c'erano domande bloccanti
        // Siccome l'admin ha id fisso:
        if (currentUserId !== "5d65094f-d066-423c-a7ce-ef18a0f64368") {
          // Opzionale: chiamare /api/requests/{requestId}/analyze per ricalcolare il preventivo
          fetch(`/api/requests/${requestId}/analyze`, { method: "POST" }).catch(console.error);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
      // Ensure focus goes back to the textarea after sending
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  return (
    <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden max-h-full h-full min-h-[400px]">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-slate-200 bg-slate-50">
        <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
        <h2 className="text-lg font-bold text-slate-900">Chat con il Team</h2>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-slate-50/50 flex flex-col gap-4">
        {loading ? (
          <div className="text-center text-sm text-slate-500 my-auto">Caricamento chat...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-slate-500 my-auto">Nessun messaggio. Scrivi qualcosa per iniziare!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isMe ? "bg-indigo-600" : "bg-slate-600"}`}>
                  {isMe ? "TU" : msg.profiles?.full_name?.substring(0, 2).toUpperCase() || "SH"}
                </div>
                <div className={`border rounded-2xl p-3 shadow-sm max-w-[85%] text-sm whitespace-pre-wrap ${
                  isMe 
                    ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-sm" 
                    : "bg-white text-slate-700 border-slate-200 rounded-tl-sm"
                }`}>
                  <ReactMarkdown
                    components={{
                      p: ({node: _node, ...props}) => <p className="m-0" {...props} />,
                      strong: ({node: _node, ...props}) => <strong className="font-semibold" {...props} />,
                      ul: ({node: _node, ...props}) => <ul className="list-disc pl-4 m-0" {...props} />,
                      ol: ({node: _node, ...props}) => <ol className="list-decimal pl-4 m-0" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white mt-auto">
        <div className="flex gap-2 items-end">
          <textarea 
            ref={textareaRef}
            placeholder="Scrivi un messaggio..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-slate-50 disabled:text-slate-400 overflow-y-auto min-h-[44px] max-h-[120px] shadow-sm transition-colors"
          />
          <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim() || sending} 
            className="rounded-full px-4 h-11 shrink-0 shadow-sm"
          >
            <Send className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Invia</span>
          </Button>
        </div>
        <div className="text-xs text-slate-400 text-center mt-2 hidden sm:block">
          Premi Invio per inviare, Shift + Invio per andare a capo
        </div>
      </div>
    </div>
  );
}
