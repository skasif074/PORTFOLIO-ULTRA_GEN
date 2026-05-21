'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, PhoneOff } from 'lucide-react';
import api from '@/lib/api';

// 1. Statically import CSS and Stream components at the top
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { 
  StreamVideo, 
  StreamCall, 
  CallControls, 
  SpeakerLayout, 
  StreamVideoClient, 
  Call 
} from '@stream-io/video-react-sdk';

export default function CallPage() {
  const { id } = useParams();
  const { user, isSignedIn } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [left, setLeft] = useState(false);
  
  // 2. Store the client and call directly in state
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [videoCall, setVideoCall] = useState<Call | null>(null);

  useEffect(() => {
    // Only initialize if signed in and the client hasn't been created yet
    if (isSignedIn && !videoClient) {
      initCall();
    }
    
    // Cleanup function: Safely leave the call if the user navigates away
    return () => {
      if (videoCall && videoCall.state.callingState !== 'left') {
        videoCall.leave().catch(console.error);
      }
      if (videoClient) {
        videoClient.disconnectUser().catch(console.error);
      }
    };
  }, [isSignedIn, videoCall, videoClient]);

  const initCall = async () => {
    try {
      const res = await api.post('/api/messages/stream-token', {
        name: user?.fullName || 'User',
        image: user?.imageUrl || '',
      });
      const { token, userId, apiKey } = res.data.data;

      const client = new StreamVideoClient({
        apiKey,
        user: {
          id: userId,
          name: user?.fullName || 'User',
          image: user?.imageUrl || '',
        },
        token,
      });

      const call = client.call('default', String(id));
      await call.getOrCreate({ data: { members: [{ user_id: userId }] } });
      await call.join({ create: true });

      // Save to state instead of creating a dynamic component
      setVideoClient(client);
      setVideoCall(call);

    } catch (err: any) {
      console.error('Call error:', err);
      setError('Failed to join call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (left) {
    return (
      <div className="min-h-screen bg-deep-dark flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-400/10 flex items-center justify-center">
          <PhoneOff size={28} className="text-red-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Call Ended</h2>
        <a
          href="/"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-neon-purple text-white text-sm font-medium"
        >
          Back to Portfolio
        </a>
      </div>
    );
  }

  if (!isSignedIn && !loading) {
    return (
      <div className="min-h-screen bg-deep-dark flex items-center justify-center flex-col gap-4">
        <p className="text-white">Please sign in to join the call</p>
        <a href="/" className="px-5 py-2.5 rounded-xl bg-electric-blue/10 text-electric-blue text-sm">
          Go Back
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-dark flex items-center justify-center flex-col gap-4">
        <Loader2 size={32} className="animate-spin text-electric-blue" />
        <p className="text-slate-400 text-sm">Joining video call...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-deep-dark flex items-center justify-center flex-col gap-4">
        <p className="text-red-400">{error}</p>
        <a href="/" className="px-5 py-2.5 rounded-xl bg-electric-blue/10 text-electric-blue text-sm">
          Back to Portfolio
        </a>
      </div>
    );
  }

  // Prevent rendering if state isn't ready
  if (!videoClient || !videoCall) return null;

  // 3. Render standard UI directly referencing the state
  return (
    <div className="str-video" style={{ height: '100vh', background: '#0F172A' }}>
      <StreamVideo client={videoClient}>
        <StreamCall call={videoCall}>
          <SpeakerLayout />
          {/* 4. Stream handles the actual disconnect under the hood; just update the UI state */}
          <CallControls onLeave={() => setLeft(true)} />
        </StreamCall>
      </StreamVideo>
    </div>
  );
}