import { useRef, useCallback, useEffect } from 'react';

/**
 * This is a free Google STUN server -> Helps browsers discover their public IP
 */
const ICE_SERVERS = {
    iceServers: [
        // One fast STUN server is plenty
        { urls: 'stun:stun.l.google.com:19302' },
        
        // Metered TURN over UDP (Fastest, works for 85% of router blocks)
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "28407d56dc46ff5c510119a7",
          credential: "ehesKJGOngsnTFgV",
        },
        // Metered Secure TURN over TCP (Ultimate backup strategy for strict firewalls)
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "28407d56dc46ff5c510119a7",
          credential: "ehesKJGOngsnTFgV",
        },
    ]
};

/**
 * Manages the full WebRTC voice call lifecycle.
 * 
 * @param {string} userId -> current user's ID
 * @param {string} recipientId -> other user's ID
 * @param {Function} sendSignal -> sends signalling messages via WebSocket
 * @param {Function} onIncomingCall -> called when an incoming call comes through
 */
export function useVoiceCall(userId, recipientId, sendSignal, onIncomingCall) {
    /** Holds the RTC PeerConnection instance across re-renders */
    const peerConnectionRef = useRef(null);

    /** Holds our local microphone stream */
    const localStreamRef = useRef(null);

    /**
     * Crates and configures new RTCPeerConnection.
     * Wired up once and reused for the duration of the voice call.
     */
    const createPeerConnection = useCallback((targetId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        /**
         * Fires whenever browser discovers new ICE candidate (possible network path to reach us).
         * We send it to the other use immediately.
         */
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sending ICE candidate");
                sendSignal('ice-candidate', targetId, event.candidate);
            }
        };

        /**
         * Fires when the other user's audio stream arrives.
         * We attach this to an Audio element so it plays through the speakers.
         */
        pc.ontrack = (event) => {
            console.log("🟢 Remote audio stream received!");
            
            // Grab the persistent audio element we just added to App.jsx
            const remoteAudio = document.getElementById("remote-audio-player");
            
            if (remoteAudio) {
                // Attach the incoming WebRTC live media stream
                remoteAudio.srcObject = event.streams[0];
                
                // Explicitly trigger playback on the DOM element
                remoteAudio.play().catch((error) => {
                    console.error("Browser blocked audio autoplay:", error);
                });
            } else {
                console.error("CRITICAL: #remote-audio-player element not found in the DOM.");
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
        }

        return pc;
    }, [sendSignal]);

    /**
     * Called when the user taps the call button.
     * Creates the peer connection, gets the mic, and sends an offer.
     */
    const startCall = useCallback(async () => {
        try {
            console.log("Starting call to", recipientId);

            // Step 1: Ask the browser for microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            // Step 2: Create the peer connection
            const pc = createPeerConnection(recipientId);
            peerConnectionRef.current = pc;

            // Step 3: Add our microphone tracks to the connection - This tells WebRTC "send this audio to the other person".
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // Step 4: Create an SDP offer describing what we support.
            const offer = await pc.createOffer();

            // Step 5: Set it as our local description (commits it)
            await pc.setLocalDescription(offer);

            // Step 6: Send the offer to the other user via WebSocket
            console.log("Sending call offer to", recipientId);
            sendSignal("call-offer", recipientId, offer);
        } catch (error) {
            console.error("Failed to start call:", error);
        }
    }, [recipientId, sendSignal, createPeerConnection]);

    /**
     * Called when we receive a call-offer from another user.
     * Creates a peer connection, sets the offer, and sends back an answer.
     * 
     * @param {string} callerId -> user who is calling us
     * @param {object} offer -> their SDP offer
     */
    const handleOffer = useCallback(async (callerId, offer) => {
        try {
            console.log("handleOffer CALLED with callerId:", callerId, "offer:", offer);

            // Step 1: Get our microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            // Step 2: Create our peer connection
            const pc = createPeerConnection(callerId);
            peerConnectionRef.current = pc;

            // Step 3: Add our mic tracks
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // Step 4: Set their offer as our remote description
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Step 5: Create our answer
            const answer = await pc.createAnswer();

            // Step 6: Set it as our local description
            await pc.setLocalDescription(answer);

            // Step 7: Send the answer back to the caller
            console.log("Sending call answer to", callerId);
            sendSignal('call-answer', callerId, answer);
        } catch (error) {
            console.error("Failed to handle offer:", error);
        }
    }, [sendSignal, createPeerConnection]);

    /**
     * Called when re receive a call-answer from the person we called.
     * Completes our side of the WebRTC handshake.
     * 
     * @param {object} answer -> their SDP answer
     */
    const handleAnswer = useCallback(async (answer) => {
        try {
            console.log("Received call answer");
            await peerConnectionRef.current?.setRemoteDescription(
                new RTCSessionDescription(answer)
            );
        } catch (error) {
            console.error("Failed to handle answer", error);
        }
    }, []);

    /**
     * Called when we receive an ICE candidate from the other user.
     * Adds it to our peer connection so WebRTC can try that network path.
     */
    const handleIceCandidate = useCallback(async (candidate) => {
        try {
            // 1. CRITICAL GUARD: Check if peer connection exists AND remote description is set
            if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) {
                console.log("⏳ Connection not fully initialized yet. Buffering or ignoring candidate.");
                return;
            }

            console.log("Received ICE candidate - adding to peer connection");
            await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(candidate)
            );
        } catch (error) {
            console.error("Failed to add ICE candidate", error);
        }
    }, []);

    /**
     * Ends the call - stops the microphone and closes the connection.
     */
    const endCall = useCallback(() => {
        console.log("Ending call");

        /** Stop all microphone tracks */
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;

        /** Close the peer connection */
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;

        sendSignal('call-ended', recipientId, null);
    }, [recipientId, sendSignal]);

    /**
     * Clean up if the component unmounts mid-call.
     */
    useEffect(() => {
        return () => {
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            peerConnectionRef.current?.close();
        };
    }, []);

    return {
        startCall,
        endCall,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
    };
}