'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X, Loader2 } from 'lucide-react';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  useStreamVideoClient,
  useCall,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import api from '@/lib/api';

interface Props {
  userId: string;
  channelId: string;
  onClose: () => void;
}

export default function VideoCallWidget({ userId, channelId, onClose }: Props) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initVideo();
    return () => {
      call?.leave();
      videoClient?.disconnectUser();
    };
  }, []);

  const initVideo = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/messages/stream-token', {});
      const { token, userId: uid, apiKey } = res.data.data;

      const client = new StreamVideoClient({
        apiKey,
        user: { id: uid },
        token,
      });

      const callId = `call-${channelId}`;
      const videoCall = client.call('default', callId);
      await videoCall.getOrCreate({ data: { members: [{ user_id: uid }] } });
      await videoCall.join({ create: true });

      setVideoClient(client);
      setCall(videoCall);
    } catch (err: any) {
      setError('Failed to start video call');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const endCall = async () => {
    await call?.leave();
    await videoClient?.disconnectUser();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-4 md:inset-auto md:bottom-24 md:right-[420px] md:w-[480px] md:h-[400px] z-50 glass rounded-2xl border border-neon-purple/30 overflow-hidden flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-secondary-dark/80">
        <div className="flex items-center gap-2">
          <Video size={16} className="text-neon-purple" />
          <span className="text-sm font-semibold text-white">Video Call</span>
        </div>
        <button onClick={endCall} className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-all">
          <X size={15} />
        </button>
      </div>

      {/* Video area */}
      <div className="flex-1 relative bg-deep-dark">
        {loading ? (
          <div className="h-full flex items-center justify-center flex-col gap-3">
            <Loader2 size={28} className="animate-spin text-neon-purple" />
            <p className="text-slate-400 text-sm">Starting video call...</p>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center flex-col gap-3 p-6 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-red-400/10 text-red-400 text-sm">Close</button>
          </div>
        ) : videoClient && call ? (
          <StreamVideo client={videoClient}>
            <StreamCall call={call}>
              <SpeakerLayout />
              <CallControls onLeave={endCall} />
            </StreamCall>
          </StreamVideo>
        ) : null}
      </div>
    </motion.div>
  );
}