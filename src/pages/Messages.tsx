import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { getMessages, sendMessage, supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { fadeUp } from '../lib/motion';
import type { Message } from '../types';

interface Conversation {
  partner_id: string;
  partner_name: string;
  partner_avatar?: string;
  listing_id?: string;
  listing_title?: string;
  messages: Message[];
  last_message: Message;
}

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await getMessages(user.id);
    setLoading(false);

    const convMap = new Map<string, Conversation>();
    data?.forEach((msg: Message) => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const partner = msg.sender_id === user.id ? (msg as any).receiver : (msg as any).sender;
      const key = `${partnerId}-${msg.listing_id || 'general'}`;

      if (!convMap.has(key)) {
        convMap.set(key, {
          partner_id: partnerId,
          partner_name: partner?.full_name || 'Unknown',
          partner_avatar: partner?.avatar_url,
          listing_id: msg.listing_id || undefined,
          listing_title: (msg as any).listing?.title,
          messages: [],
          last_message: msg,
        });
      }
      const conv = convMap.get(key)!;
      conv.messages.push(msg);
      if (new Date(msg.created_at) > new Date(conv.last_message.created_at)) {
        conv.last_message = msg;
      }
    });

    setConversations(
      Array.from(convMap.values()).sort(
        (a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
      )
    );
  }, [user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Realtime: new incoming messages land instantly without a refresh.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          const msg = payload.new as Message;
          const sameThread = (c: Conversation) =>
            c.partner_id === msg.sender_id && (c.listing_id || null) === (msg.listing_id || null);

          let known = false;
          setConversations((prev) => {
            const idx = prev.findIndex(sameThread);
            if (idx === -1) return prev;
            known = true;
            const conv = { ...prev[idx], messages: [...prev[idx].messages, msg], last_message: msg };
            const next = [...prev];
            next.splice(idx, 1);
            return [conv, ...next];
          });
          setActiveConversation((curr) => (curr && sameThread(curr) ? { ...curr, messages: [...curr.messages, msg] } : curr));
          if (!known) loadMessages();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadMessages]);

  // Keep the conversation scrolled to the newest message.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length, activeConversation?.partner_id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConversation || !newMessage.trim()) return;
    const { data } = await sendMessage({
      sender_id: user.id,
      receiver_id: activeConversation.partner_id,
      listing_id: activeConversation.listing_id,
      content: newMessage,
    });
    if (data) {
      setNewMessage('');
      const updatedMessages = [...activeConversation.messages, data];
      setActiveConversation({ ...activeConversation, messages: updatedMessages });
      setConversations((prev) =>
        prev.map((conv) =>
          conv.partner_id === activeConversation.partner_id && conv.listing_id === activeConversation.listing_id
            ? { ...conv, messages: updatedMessages, last_message: data }
            : conv
        )
      );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <span className="w-16 h-16 rounded-2xl surface grid place-items-center text-ink-faint mb-5">
          <MessageCircle className="w-7 h-7" />
        </span>
        <h1 className="text-2xl font-bold text-ink mb-2">Sign in required</h1>
        <p className="text-ink-muted mb-6">Please sign in to view your messages.</p>
        <button onClick={() => navigate('/auth')} className="btn-navy px-6 py-3 rounded-full transition-colors">
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-ink">Messages</h1>
          <p className="text-ink-muted mt-1 text-lg">Chat with buyers and sellers.</p>
        </motion.div>

        <div className="flex h-[calc(100vh-220px)] md:h-[620px] surface rounded-2xl overflow-hidden">
          {/* List */}
          <div className={`w-full md:w-80 border-r border-line flex flex-col ${isMobile && activeConversation ? 'hidden md:flex' : ''}`}>
            <div className="p-4 border-b border-line">
              <input type="text" placeholder="Search conversations…" className="field w-full px-4 py-2.5 text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-16 surface-muted rounded-2xl animate-pulse" />)}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-ink-faint mx-auto mb-4" />
                  <p className="text-ink-soft font-medium">No conversations yet</p>
                  <p className="text-ink-faint text-sm mt-1">Contact a seller to start chatting.</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const active = activeConversation?.partner_id === conv.partner_id && activeConversation?.listing_id === conv.listing_id;
                  return (
                    <button
                      key={`${conv.partner_id}-${conv.listing_id}`}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${active ? 'bg-canvas' : 'hover:bg-canvas/60'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-navy-600 grid place-items-center text-white font-bold flex-shrink-0">
                        {conv.partner_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-ink truncate">{conv.partner_name}</p>
                          <span className="text-xs text-ink-faint ml-2">
                            {new Date(conv.last_message.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {conv.listing_title && <p className="text-xs text-navy-600 truncate mb-0.5">{conv.listing_title}</p>}
                        <p className="text-sm text-ink-muted truncate">{conv.last_message.content}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* View */}
          <div className={`flex-1 flex flex-col ${isMobile && !activeConversation ? 'hidden md:flex' : ''}`}>
            {activeConversation ? (
              <>
                <div className="p-4 border-b border-line flex items-center gap-3">
                  {isMobile && (
                    <button onClick={() => setActiveConversation(null)} className="p-2 text-ink-muted hover:text-ink transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <Link to={`/profile/${activeConversation.partner_id}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-600 grid place-items-center text-white font-bold">
                      {activeConversation.partner_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{activeConversation.partner_name}</p>
                      {activeConversation.listing_id && (
                        <Link to={`/listing/${activeConversation.listing_id}`} className="text-xs text-navy-600 hover:text-navy-500">
                          View listing
                        </Link>
                      )}
                    </div>
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-canvas/40">
                  {activeConversation.messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-xl ${isOwn ? 'bg-navy-600 text-white rounded-br-lg' : 'bg-surface border border-line text-ink rounded-bl-lg'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[11px] mt-1 ${isOwn ? 'text-white/60' : 'text-ink-faint'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={endRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-line">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message…"
                      className="field flex-1 px-4 py-3"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-12 grid place-items-center btn-navy rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <span className="w-16 h-16 rounded-2xl surface-muted grid place-items-center text-ink-faint mb-4">
                  <MessageCircle className="w-7 h-7" />
                </span>
                <h3 className="text-lg font-bold text-ink mb-1">Select a conversation</h3>
                <p className="text-ink-muted">Choose a chat from the list to start talking.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
