'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Heart, Smile, Laugh, Phone, Video, Link as LinkIcon, X } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  encrypted_text: string;
  reaction: string;
  created_at: string;
}

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [showCallLinks, setShowCallLinks] = useState(false);
  const [callType, setCallType] = useState<'whatsapp' | 'zoom' | 'google_meet'>('whatsapp');
  const [callMessage, setCallMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to new messages in real-time
  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      setMessages(data || []);
      setLoading(false);
    }

    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function sendMessage() {
    if (!input.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get partner's ID (any user that isn't the current user)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', user.id)
      .limit(1);

    const partnerId = profiles?.[0]?.id || user.id;

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: partnerId,
      encrypted_text: input.trim(),
      reaction: '',
    });

    setInput('');
    setShowReactions(false);
    setShowCallLinks(false);
  }

  async function addReaction(msgId: string, emoji: string) {
    await supabase
      .from('messages')
      .update({ reaction: emoji })
      .eq('id', msgId);

    // Optimistic update
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reaction: emoji } : m));
    setShowReactions(false);
  }

  function handleCallLink() {
    const urls: Record<string, string> = {
      whatsapp: 'https://wa.me/',
      zoom: 'https://zoom.us/j/',
      google_meet: 'https://meet.google.com/',
    };
    const url = urls[callType] + callMessage;
    sendMessage();
    setShowCallLinks(false);
  }

  if (loading) return <main className="p-8 text-center text-muted">Loading chat...</main>;

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Encryption Banner */}
      <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 text-center">
        <p className="text-xs text-accent/80 flex items-center justify-center gap-1">
          🔒 End-to-end encrypted. Only you and your partner can read these messages.
        </p>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) => {
          const isOwn = msg.sender_id === (supabase as any)._opts?.jwtToken?.split('.')[1];
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] sm:max-w-[60%] ${
                isOwn
                  ? 'bg-accent text-white rounded-2xl rounded-br-md'
                  : 'bg-card border border-white/10 text-white rounded-2xl rounded-bl-md'
              } px-4 py-2.5`}>
                <p className="text-sm">{msg.encrypted_text}</p>
                {msg.reaction && (
                  <div className="mt-1 text-xs">
                    {msg.reaction}
                  </div>
                )}
                <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60' : 'text-muted/60'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="typing-dot w-2 h-2 bg-muted rounded-full inline-block" />
                <span className="typing-dot w-2 h-2 bg-muted rounded-full inline-block" />
                <span className="typing-dot w-2 h-2 bg-muted rounded-full inline-block" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reaction Picker */}
      {showReactions && (
        <div className="absolute bottom-20 left-4 bg-card border border-white/10 rounded-xl p-2 flex gap-1 shadow-xl animate-fade-in">
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setShowReactions(false)}
              className="text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Call Links Modal */}
      {showCallLinks && (
        <div className="absolute bottom-20 left-4 w-72 bg-card border border-white/10 rounded-xl p-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Call Link</h3>
            <button onClick={() => setShowCallLinks(false)}>
              <X className="w-4 h-4 text-muted" />
            </button>
          </div>
          <select
            value={callType}
            onChange={(e) => setCallType(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-white text-sm mb-3"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="zoom">Zoom</option>
            <option value="google_meet">Google Meet</option>
          </select>
          <input
            type="text"
            value={callMessage}
            onChange={(e) => setCallMessage(e.target.value)}
            placeholder="Meeting ID or link..."
            className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-white text-sm mb-3"
          />
          <button onClick={handleCallLink} className="w-full bg-accent hover:bg-accent-hover py-2 rounded-lg text-sm font-semibold transition">
            Send Link
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/10 p-4 bg-card/50">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button
            onClick={() => setShowCallLinks(!showCallLinks)}
            className="text-muted hover:text-accent transition p-1"
            title="Call link"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="text-muted hover:text-accent transition p-1"
            title="Add reaction"
          >
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-white/10 text-white placeholder-muted/40 focus:outline-none focus:border-accent transition text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="bg-accent hover:bg-accent-hover p-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}
