import {useEffect, useRef} from 'react';

const BACKEND_URL = import.meta.env.VITE_API_URL;   // Backend url for http requests
const INTERVAL_MS = 30000;   // Set interval for sending heartbeat every 30 seconds

export default function UserHeatbeat(userId) {
    const timerRef = useRef(null);

    /**
     * 
     */
    useEffect(() => {
        if (!userId) return;

        const sendHeartbeat = async () => {
            try {
                await fetch(`${BACKEND_URL}/presence/heartbeat?userId=${userId}`, {
                    method: 'POST',
                });
            } catch (error) {
                console.log('Heartbeat failed: ', error);
            }
        };

        const resetTimer = () => {
            clearInterval(timerRef.current);
            sendHeartbeat();
            timerRef.current = setInterval(sendHeartbeat, INTERVAL_MS);
        }

        sendHeartbeat();
        timerRef.current = setInterval(sendHeartbeat, INTERVAL_MS);

        return () => {
            clearInterval(timerRef.current);
            window.removeEventListener('click', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('scroll', resetTimer);
        };
    }, [userId]);
}