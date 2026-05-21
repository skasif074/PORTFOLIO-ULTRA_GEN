'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, CheckCheck, Paperclip, Video, Download } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import api from '@/lib/api';

let chatClient: StreamChat | null = null;

interface Message {
  id: string;
  text: string;
  user: { id: string; name: string; image?: string };
  created_at: string | Date;
  attachments?: any[];
}

export default function ChatWidget() {
  const { isSignedIn, user } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [hasAdminReply, setHasAdminReply] = useState(false);
  const [unread, setUnread] = useState(0);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID!;

  // Refs for tracking state inside listeners and handling strict mode unmounts
  const openRef = useRef(false);
  const listenerRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) {
      scrollToBottom('instant');
    }
  }, [open, scrollToBottom]);

  useEffect(() => {
    if (isSignedIn && user) checkForAdminReply();
    
    // Cleanup the listener entirely if the component unmounts
    return () => {
      if (listenerRef.current) {
        listenerRef.current.unsubscribe();
      }
    };
  }, [isSignedIn, user]);

  const checkForAdminReply = async () => {
    try {
      const res = await api.post('/api/messages/stream-token', {
        name: user?.fullName || 'User',
        image: user?.imageUrl || '',
      });
      const { token, userId, apiKey } = res.data.data;

      if (!chatClient) chatClient = new StreamChat(apiKey);
      if (!chatClient.userID) {
        await chatClient.connectUser(
          { id: userId, name: user?.fullName || 'User', image: user?.imageUrl || '' },
          token
        );
      }

      const shortUserId = userId.replace('user_', '').slice(0, 20);
      const channelId = `dm-${shortUserId}`;
      const members = userId === adminId ? [userId] : [userId, adminId];
      const ch = chatClient.channel('messaging', channelId, { members });
      await ch.watch();

      const msgs = ch.state.messages as unknown as Message[];
      const adminReplied = msgs.some((m) => m.user?.id === adminId);
      setHasAdminReply(adminReplied);
      
      if (!openRef.current) {
        setUnread(msgs.filter((m) => m.user?.id === adminId).length);
      }

      setChannel(ch);
      setMessages(msgs);
      setConnected(true);

      // 1. Properly unsubscribe from the previous listener to prevent TS errors and duplicate renders
      if (listenerRef.current) {
        listenerRef.current.unsubscribe();
      }

      // 2. Save the newly created listener
      listenerRef.current = ch.on('message.new', (event) => {
        if (event.message) {
          const newMsg = event.message as unknown as Message;

          setMessages((prev) => {
            // 3. Deduplication check: Ignore if we already have this message ID
            if (prev.some((m) => m.id === newMsg.id)) return prev;

            if (newMsg.user?.id === adminId) {
              setHasAdminReply(true);
              if (!openRef.current) {
                setUnread((u) => u + 1);
              }
            }

            return [...prev, newMsg];
          });
          
          scrollToBottom();
        }
      });
    } catch {
      // silent fail
    }
  };

  const initChat = async () => {
    if (connected) return;
    setLoading(true);
    setError('');
    try {
      await checkForAdminReply();
    } catch {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
    if (isSignedIn && !connected) initChat();
  };

  const sendMessage = async () => {
    if (!input.trim() || !channel || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      await channel.sendMessage({ text });
      scrollToBottom();
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const sendFile = async (file: File) => {
    if (!channel || uploading) return;
    setUploading(true);
    try {
      const isImage = file.type.startsWith('image/');
      if (isImage) {
        const res = await channel.sendImage(file);
        await channel.sendMessage({
          text: '',
          attachments: [{ type: 'image', image_url: res.file, fallback: file.name }],
        });
      } else {
        const res = await channel.sendFile(file);
        await channel.sendMessage({
          text: '',
          attachments: [{ type: 'file', asset_url: res.file, title: file.name, file_size: file.size }],
        });
      }
      scrollToBottom();
    } catch {
      // silent
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const startVideoCall = async () => {
    if (!channel) return;
    try {
      const id = `call-${channel.id}-${Date.now()}`;
      await channel.sendMessage({
        text: '📹 Video call started! Click to join.',
        attachments: [{ type: 'video_call', call_id: id, title: 'Video Call Invite' }],
      });
      window.open(`${window.location.origin}/call/${id}`, '_blank');
    } catch {
      // silent
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMe = (msg: Message) => msg.user?.id !== adminId;

  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!isSignedIn) return null;

  return (
    <>
      <motion.button
        onClick={handleOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shadow-2xl glow-blue"
      >
        <MessageCircle size={22} className="text-white" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-glow rounded-full border-2 border-deep-dark flex items-center justify-center text-white text-xs font-bold">
            {unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-80 md:w-96 flex flex-col shadow-2xl rounded-2xl overflow-hidden"
            style={{
              height: '560px',
              maxHeight: 'calc(100vh - 8rem)',
              background: '#0F172A',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: 'rgba(17,24,39,0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center text-white text-xs font-bold">
                    SK
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-accent rounded-full border-2 border-deep-dark" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">SK Asif Hossain</p>
                  <p className="text-emerald-accent text-xs truncate">Online · Usually replies fast</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                {connected && (
                  <motion.button
                    onClick={startVideoCall}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Start video call"
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-neon-purple hover:bg-neon-purple/10 transition-all border border-neon-purple/20"
                  >
                    <Video size={15} />
                  </motion.button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={24} className="animate-spin text-electric-blue" />
                  <p className="text-slate-400 text-xs">Connecting...</p>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={initChat}
                    className="px-5 py-2 rounded-xl bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Messages area */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
                    style={{ background: 'rgba(15,23,42,0.8)' }}
                  >
                    <div className="text-center pb-2">
                      <p className="text-slate-600 text-xs">
                        {hasAdminReply
                          ? 'Your conversation with SK Asif'
                          : 'Waiting for reply from SK Asif...'}
                      </p>
                    </div>

                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${isMe(msg) ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe(msg) && (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end mb-4">
                            SK
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] flex flex-col gap-1 ${
                            isMe(msg) ? 'items-end' : 'items-start'
                          }`}
                        >
                          {/* Attachments */}
                          {msg.attachments?.map((att, i) => (
                            <div key={i}>
                              {att.type === 'image' && att.image_url && (
                                <img
                                  src={att.image_url}
                                  alt="attachment"
                                  className="rounded-xl max-w-full max-h-40 object-cover cursor-pointer"
                                  onClick={() => window.open(att.image_url, '_blank')}
                                />
                              )}
                              
                              {att.type === 'file' && (
                                <a
                                  href={att.asset_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-electric-blue"
                                  style={{
                                    background: 'rgba(59,130,246,0.1)',
                                    border: '1px solid rgba(59,130,246,0.2)',
                                  }}
                                >
                                  <Download size={12} />
                                  {att.title || 'Download file'}
                                </a>
                              )}
                              
                              {att.type === 'video_call' && (
                                <a
                                  href={`/call/${att.call_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neon-purple"
                                  style={{
                                    background: 'rgba(139,92,246,0.1)',
                                    border: '1px solid rgba(139,92,246,0.2)',
                                  }}
                                >
                                  <Video size={12} />
                                  Join Video Call
                                </a>
                              )}
                            </div>
                          ))}

                          {/* Text bubble */}
                          {msg.text ? (
                            <div
                              className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                                isMe(msg)
                                  ? 'bg-gradient-to-br from-electric-blue to-neon-purple text-white rounded-br-sm'
                                  : 'text-slate-200 rounded-bl-sm'
                              }`}
                              style={
                                !isMe(msg)
                                  ? {
                                      background: 'rgba(255,255,255,0.07)',
                                      border: '1px solid rgba(255,255,255,0.05)',
                                    }
                                  : {}
                              }
                            >
                              {msg.text}
                            </div>
                          ) : null}

                          <div
                            className={`flex items-center gap-1 ${
                              isMe(msg) ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <span className="text-slate-600 text-xs">
                              {formatTime(msg.created_at)}
                            </span>
                            {isMe(msg) && (
                              <CheckCheck size={10} className="text-electric-blue" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area */}
                  <div
                    className="flex-shrink-0 p-3"
                    style={{
                      background: 'rgba(17,24,39,0.98)',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {hasAdminReply ? (
                      <>
                        <div
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(59,130,246,0.15)',
                          }}
                        >
                          <motion.button
                            onClick={() => fileRef.current?.click()}
                            whileHover={{ scale: 1.1 }}
                            disabled={uploading}
                            className="text-slate-500 hover:text-electric-blue transition-colors flex-shrink-0 disabled:opacity-40"
                          >
                            {uploading ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Paperclip size={15} />
                            )}
                          </motion.button>
                          <input
                            ref={fileRef}
                            type="file"
                            className="hidden"
                            onClick={(e) => {
                              (e.target as HTMLInputElement).value = '';
                            }}
                            onChange={(e) =>
                              e.target.files?.[0] && sendFile(e.target.files[0])
                            }
                          />

                          <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none min-w-0"
                          />

                          <motion.button
                            onClick={sendMessage}
                            disabled={!input.trim() || sending}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center disabled:opacity-40 flex-shrink-0 transition-all"
                          >
                            {sending ? (
                              <Loader2 size={13} className="animate-spin text-white" />
                            ) : (
                              <Send size={13} className="text-white" />
                            )}
                          </motion.button>
                        </div>
                        <p className="text-slate-700 text-xs text-center mt-1.5">
                          Enter to send · 📎 attach files · 📹 video call top right
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Waiting for reply... Use the{' '}
                          <a
                            href="#contact"
                            onClick={() => setOpen(false)}
                            className="text-electric-blue hover:underline"
                          >
                            contact form
                          </a>{' '}
                          to send your first message.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}