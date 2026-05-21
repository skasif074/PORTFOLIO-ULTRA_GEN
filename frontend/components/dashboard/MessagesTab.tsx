'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Trash2, MailOpen, Loader2, Send, CheckCheck, Paperclip, Video, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { StreamChat } from 'stream-chat';
import api from '@/lib/api';

let adminChatClient: StreamChat | null = null;

interface StreamMessage {
  id: string;
  text: string;
  user: { id: string; name: string };
  created_at: string | Date;
  attachments?: any[];
}

export default function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<StreamMessage[]>([]);
  const [chatChannel, setChatChannel] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID!;

  useEffect(() => { fetchMessages(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchMessages = async () => {
    try {
      const r = await api.get('/api/messages');
      setMessages(r.data.data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const openMessage = async (msg: any) => {
    setSelected(msg);
    setChatMessages([]);
    setChatChannel(null);
    setReplyText('');
    if (!msg.is_read) {
      await api.put(`/api/messages/${msg.id}/read`);
      fetchMessages();
    }
    if (msg.clerk_user_id) {
      openStreamChat(msg.clerk_user_id);
    }
  };

  const openStreamChat = async (visitorUserId: string) => {
    setChatLoading(true);
    try {
      const res = await api.get('/api/messages/stream-token/admin');
      const { token, userId: myAdminId, apiKey } = res.data.data;

      if (!adminChatClient) {
        adminChatClient = StreamChat.getInstance(apiKey);
      }
      if (!adminChatClient.userID) {
        await adminChatClient.connectUser(
          { id: myAdminId, name: 'SK Asif Hossain' },
          token
        );
      }

      const shortUserId = visitorUserId.replace('user_', '').slice(0, 20);
      const channelId = `dm-${shortUserId}`;
      const members = visitorUserId === myAdminId
        ? [myAdminId]
        : [visitorUserId, myAdminId];

      const ch = adminChatClient.channel('messaging', channelId, { members });
      await ch.watch();

      setChatMessages(ch.state.messages as any);
      setChatChannel(ch);

      ch.on('message.new', (event) => {
        if (event.message) {
          setChatMessages((prev) => [...prev, event.message as any]);
        }
      });
    } catch {
      toast.error('Could not open Stream chat for this user.');
    } finally {
      setChatLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !chatChannel || sending) return;
    const text = replyText.trim();
    setReplyText('');
    setSending(true);
    try {
      await chatChannel.sendMessage({ text });
    } catch {
      setReplyText(text);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const sendFile = async (file: File) => {
    if (!chatChannel) return;
    setUploading(true);
    try {
      const isImage = file.type.startsWith('image/');
      if (isImage) {
        const res = await chatChannel.sendImage(file);
        await chatChannel.sendMessage({
          text: '',
          attachments: [{ type: 'image', image_url: res.file, fallback: file.name }],
        });
      } else {
        const res = await chatChannel.sendFile(file);
        await chatChannel.sendMessage({
          text: '',
          attachments: [{ type: 'file', asset_url: res.file, title: file.name, file_size: file.size }],
        });
      }
    } catch {
      toast.error('Failed to send file');
    } finally {
      setUploading(false);
    }
  };

  const startVideoCall = async () => {
    if (!chatChannel) return;
    const id = `call-${chatChannel.id}-${Date.now()}`;
    try {
      await chatChannel.sendMessage({
        text: `📹 Video call started! Click to join.`,
        attachments: [{ type: 'video_call', call_id: id, title: 'Video Call Invite' }],
      });
      window.open(`${window.location.origin}/call/${id}`, '_blank');
    } catch {
      toast.error('Failed to start video call');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await api.delete(`/api/messages/${id}`);
    toast.success('Message deleted');
    if (selected?.id === id) {
      setSelected(null);
      setChatChannel(null);
    }
    fetchMessages();
  };

  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isVisitor = (msg: StreamMessage) => msg.user?.id !== adminId;

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <Loader2 className="animate-spin text-electric-blue" size={28} />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-4" style={{ height: 'calc(100vh - 160px)' }}>

      {/* Left — inbox list */}
      <div className="lg:col-span-2 glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex-shrink-0">
          <h3 className="font-display text-sm font-bold text-white">Inbox</h3>
          <p className="text-xs text-slate-500">
            {messages.filter((m) => !m.is_read).length} unread
          </p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No messages yet</div>
          ) : messages.map((msg) => (
            <motion.div
              key={msg.id}
              onClick={() => openMessage(msg)}
              whileHover={{ x: 2 }}
              className={`p-4 cursor-pointer transition-all ${
                selected?.id === msg.id ? 'bg-electric-blue/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-electric-blue flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium truncate ${msg.is_read ? 'text-slate-400' : 'text-white'}`}>
                      {msg.name}
                    </span>
                    {msg.clerk_user_id && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-electric-blue/10 text-electric-blue flex-shrink-0">
                        chat
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {msg.subject || msg.message}
                  </p>
                </div>
                <span className="text-xs text-slate-600 flex-shrink-0">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right — detail + chat */}
      <div className="lg:col-span-3 glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        {selected ? (
          <div className="flex flex-col h-full">

            {/* Header */}
            <div className="p-4 border-b border-white/5 flex-shrink-0 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{selected.name}</h3>
                <p className="text-xs text-electric-blue">{selected.email}</p>
                {selected.subject && (
                  <p className="text-xs text-slate-500 mt-0.5">{selected.subject}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {chatChannel && (
                  <motion.button
                    onClick={startVideoCall}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs hover:bg-neon-purple/20 transition-all"
                  >
                    <Video size={12} /> Video Call
                  </motion.button>
                )}
                <button
                  onClick={() => del(selected.id)}
                  className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Original message */}
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-xs text-slate-500 mb-1 font-mono">Initial message:</p>
              <p className="text-slate-300 text-sm leading-relaxed">{selected.message}</p>
              <p className="text-slate-600 text-xs mt-1">{new Date(selected.created_at).toLocaleString()}</p>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {!selected.clerk_user_id ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <Mail size={32} className="text-slate-600" />
                  <div>
                    <p className="text-slate-400 text-sm font-medium">No Stream chat available</p>
                    <p className="text-slate-600 text-xs mt-1">This message was sent without signing in</p>
                  </div>
                  
                  {/* FIX: Added missing `<a ` to this anchor tag */}
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your message'}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-xs font-medium"
                  >
                    <Mail size={12} /> Reply via Email
                  </a>
                </div>
              ) : chatLoading ? (
                <div className="flex-1 flex items-center justify-center gap-3">
                  <Loader2 size={20} className="animate-spin text-electric-blue" />
                  <p className="text-slate-400 text-xs">Loading chat...</p>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                    style={{ background: 'rgba(15,23,42,0.6)' }}
                  >
                    {chatMessages.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-slate-600 text-xs">
                          No chat messages yet. Send a reply — it appears in the visitor's chat bubble!
                        </p>
                      </div>
                    )}
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${!isVisitor(msg) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] flex flex-col gap-1 ${!isVisitor(msg) ? 'items-end' : 'items-start'}`}>
                          <p className="text-xs text-slate-600 px-1">
                            {isVisitor(msg) ? selected.name : 'You (Admin)'}
                          </p>

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
                              
                              {/* FIX: Added missing `<a ` wrapper for files */}
                              {att.type === 'file' && (
                                <a
                                  href={att.asset_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-electric-blue"
                                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
                                >
                                  <Download size={12} /> {att.title || 'Download file'}
                                </a>
                              )}
                              
                              {/* FIX: Added missing `<a ` wrapper for video_call */}
                              {att.type === 'video_call' && (
                                <a
                                  href={`/call/${att.call_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neon-purple"
                                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
                                >
                                  <Video size={12} /> Join Video Call
                                </a>
                              )}
                            </div>
                          ))}

                          {/* Text */}
                          {msg.text ? (
                            <div
                              className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                                !isVisitor(msg)
                                  ? 'bg-gradient-to-br from-electric-blue to-neon-purple text-white rounded-br-sm'
                                  : 'text-slate-200 rounded-bl-sm'
                              }`}
                              style={isVisitor(msg) ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.05)' } : {}}
                            >
                              {msg.text}
                            </div>
                          ) : null}

                          <div className={`flex items-center gap-1 ${!isVisitor(msg) ? 'flex-row-reverse' : ''}`}>
                            <span className="text-slate-700 text-xs">{formatTime(msg.created_at)}</span>
                            {!isVisitor(msg) && <CheckCheck size={10} className="text-electric-blue" />}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {/* Reply input */}
                  <div
                    className="flex-shrink-0 p-3 space-y-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(17,24,39,0.9)' }}
                  >
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-xs hover:bg-electric-blue/20 transition-all cursor-pointer">
                        {uploading
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Paperclip size={11} />}
                        Attach File
                        <input
                          type="file"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => e.target.files?.[0] && sendFile(e.target.files[0])}
                        />
                      </label>
                    </div>

                    {/* Text input */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}
                    >
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                        placeholder="Type your reply... (Enter to send)"
                        className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
                      />
                      <motion.button
                        onClick={sendReply}
                        disabled={!replyText.trim() || sending}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                      >
                        {sending
                          ? <Loader2 size={13} className="animate-spin text-white" />
                          : <Send size={13} className="text-white" />}
                      </motion.button>
                    </div>
                    <p className="text-slate-700 text-xs text-center">
                      Replies appear instantly in visitor's chat bubble
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-slate-500">
            <MailOpen size={40} className="opacity-30" />
            <p className="text-sm">Select a message to read and reply</p>
          </div>
        )}
      </div>
    </div>
  );
}