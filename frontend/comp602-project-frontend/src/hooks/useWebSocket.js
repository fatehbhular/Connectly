import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const WS_BROKER_URL = BACKEND_URL.replace(/^http/, 'ws') + '/ws';

export function useWebSocket(userId, onSignalReceived) {
    /**
     * useRef keeps the STOMP client alive across re-renders
     * without triggering them.
     */
    console.log("useWebSocket called with userId:", userId);
    const clientRef = useRef(null);

    // Keep an always-fresh mutable pointer to the latest handleSignal callback function.
    // This explicitly prevents STOMP subscription listeners from being caught in stale closures.
    const onSignalReceivedRef = useRef(onSignalReceived);
    useEffect(() => {
        onSignalReceivedRef.current = onSignalReceived;
    }, [onSignalReceived]);

    useEffect(() => {
        if (!userId) return;

        console.log("🚀 Attempting WebSocket connection to:", WS_BROKER_URL); 

        /** Creates the STOMP client */
        const client = new Client({
            /** Native WebSocket */
            brokerURL: WS_BROKER_URL,

            onConnect: () => {
                console.log("WebSocket connected!");
                /**
                 * Subscribe to this user's personal channel.
                 * 
                 * Any message addressed to this user arrives
                 * here.
                 */
                client.subscribe(`/topic/signal/${userId}`, (message) => {
                    const signal = JSON.parse(message.body);
                    console.log("Signal received:", signal);
                    
                    // FIX: Invoke the fresh pointer reference instead of the stale initial render instance
                    if (onSignalReceivedRef.current) {
                        onSignalReceivedRef.current(signal);
                    }
                });
            },

            onDisconnect: () => {
                console.log("WebSocket disconnected.");
            },

            onStompError: (frame) => {
                console.error("WebSocket error:", frame);
            },

            onWebSocketError: (event) => {
                console.error("WebSocket error:", event);
            }
        });

        /** Activate the connection */
        client.activate();
        clientRef.current = client;

        /** Cleanup -> deactivate when component unmounts or userId changes. */
        return () => {
            client.deactivate();
        };
    }, [userId]);

    const sendSignal = useCallback((type, receiverId, payload) => {
        if (!clientRef.current?.connected) {
            console.error("WebScoket is not connected");
            return;
        }

        const message = { type, senderId: userId, receiverId, payload };

        /** Send to /app/signal - Spring Boot's SignallingController picks this up. */
        clientRef.current.publish({
            destination: "/app/signal",
            body: JSON.stringify(message),
        });

        console.log("Signal sent:", message);
    }, [userId]);

    return { sendSignal };
}
