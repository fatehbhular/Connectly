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
 * Manages the full WebRTC voice and video call lifecycle.
 * 
 * @param {string} userId -> current user's ID
 * @param {Function} sendSignal -> sends signalling messages via WebSocket
 * @param {Function} onIncomingCall -> called when an incoming call comes through
 */
export function useVoiceCall(userId, sendSignal, onIncomingCall) {
    /** Holds the RTC PeerConnection instance across re-renders */
    const peerConnectionRef = useRef(null);

    /** Holds our local microphone/camera stream */
    const localStreamRef = useRef(null);

    /**
     * Crates and configures new RTCPeerConnection.
     * Wired up once and reused for the duration of the call.
     */
    const createPeerConnection = useCallback((targetId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        /**
         * Fires whenever browser discovers new ICE candidate (possible network path to reach us).
         * We send it to the other user immediately.
         */
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sending ICE candidate");
                sendSignal('ice-candidate', targetId, event.candidate);
            }
        };

        /**
         * Fires when the other user's audio/video stream arrives.
         * For audio calls: attaches to the hidden audio element.
         * For video calls: attaches to the fullscreen video element.
         */
        pc.ontrack = (event) => {
            console.log("🟢 Remote stream received!");
            
            // Try video element first (video call), fall back to audio element (voice call)
            const remoteVideo = document.getElementById("remote-video-player");
            const remoteAudio = document.getElementById("remote-audio-player");

            if (remoteVideo && remoteVideo.offsetParent !== null) {
                // Video element is visible in the DOM - this is a video call
                remoteVideo.srcObject = event.streams[0];
                remoteVideo.play().catch((error) => {
                    console.error("Browser blocked video autoplay:", error);
                });
            } else if (remoteAudio) {
                // Fall back to audio element for voice calls
                remoteAudio.srcObject = event.streams[0];
                remoteAudio.play().catch((error) => {
                    console.error("Browser blocked audio autoplay:", error);
                });
            } else {
                console.error("CRITICAL: No remote media player element found in the DOM.");
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
        }

        return pc;
    }, [sendSignal]);

    /**
     * Called when the user taps the call or video button.
     * Creates the peer connection, gets the mic (and camera if video), and sends an offer.
     * 
     * @param {string} targetId -> user to call
     * @param {boolean} isVideo -> true for video call, false for voice only
     */
    const startCall = useCallback(async (targetId, isVideo = false) => {
        try {
            console.log(`Starting ${isVideo ? 'video' : 'voice'} call to`, targetId);

            // Step 1: Ask the browser for microphone access (and camera if video call)
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true, 
                video: isVideo 
            });
            localStreamRef.current = stream;

            // Step 2: Create the peer connection
            const pc = createPeerConnection(targetId);
            peerConnectionRef.current = pc;

            // Step 3: Add our tracks to the connection
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // Step 4: Create an SDP offer describing what we support
            const offer = await pc.createOffer();

            // Step 5: Set it as our local description (commits it)
            await pc.setLocalDescription(offer);

            // Step 6: Send the offer via the correct signal type so the receiver knows call type
            const signalType = isVideo ? 'video-call-offer' : 'call-offer';
            console.log(`Sending ${signalType} to`, targetId);
            sendSignal(signalType, targetId, offer);
        } catch (error) {
            console.error("Failed to start call:", error);
        }
    }, [sendSignal, createPeerConnection]);

    /**
     * Called when we receive a call-offer or video-call-offer from another user.
     * Creates a peer connection, sets the offer, and sends back an answer.
     * 
     * @param {string} callerId -> user who is calling us
     * @param {object} offer -> their SDP offer
     * @param {boolean} isVideo -> true if this is a video call
     */
    const handleOffer = useCallback(async (callerId, offer, isVideo = false) => {
        try {
            console.log(`handleOffer CALLED - isVideo: ${isVideo}, callerId:`, callerId);

            // Step 1: Get our microphone (and camera if video call)
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true, 
                video: isVideo 
            });
            localStreamRef.current = stream;

            // Step 2: Create our peer connection
            const pc = createPeerConnection(callerId);
            peerConnectionRef.current = pc;

            // Step 3: Add our tracks
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
     * Called when we receive a call-answer from the person we called.
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
            console.log("Received ICE candidate");
            await peerConnectionRef.current?.addIceCandidate(
                new RTCIceCandidate(candidate)
            );
        } catch (error) {
            console.error("Failed to add ICE candidate", error);
        }
    }, []);

    /**
     * Ends the call - stops the microphone/camera and closes the connection.
     * 
     * @param {string|null} targetId -> pass the peer's ID to notify them, or null to skip the signal
     */
    const endCall = useCallback((targetId) => {
        console.log("Ending call");

        /** Stop all microphone and camera tracks */
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;

        /** Close the peer connection */
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;

        // Only send the signal if we have a target - prevents the receiver from
        // sending a redundant call-ended signal back after the sender already hung up
        if (targetId) {
            sendSignal('call-ended', targetId, null);
        }
    }, [sendSignal]);

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
        localStreamRef, // Exposed so App.jsx can attach local camera preview to a <video> element
    };
}