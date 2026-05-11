'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { demoEngine } from '@/lib/demoRealtimeEngine';

export function useWebSocket() {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Connect to the Socket.io server
    const socket = io(wsUrl, {
      path: '/socket.io',
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Listen to the operational events broadcasted by backend
    socket.on('TELEMETRY_TICK', (data) => {
      setLastMessage({ type: 'TELEMETRY_TICK', payload: data });
    });

    socket.on('TELEMETRY_EVENT', (data) => {
      setLastMessage({ type: 'TELEMETRY_EVENT', payload: data });
    });

    socket.on('INTELLIGENCE_FEED', (data) => {
      setLastMessage({ type: 'INTELLIGENCE_FEED', payload: data });
    });

    socket.on('DASHBOARD_REFRESH', (data) => {
      setLastMessage({ type: 'DASHBOARD_REFRESH', payload: data });
    });

    // DEMO ENGINE SUBSCRIPTION (Fallback)
    const unsubscribeDemo = demoEngine.subscribe((msg) => {
      // Only use demo data if not connected to real backend
      if (!socket.connected) {
        setLastMessage(msg);
        setIsDemoMode(true);
      } else {
        setIsDemoMode(false);
      }
    });

    return () => {
      socket.disconnect();
      unsubscribeDemo();
    };
  }, []);

  const send = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { lastMessage, isConnected, isDemoMode, send };
}
