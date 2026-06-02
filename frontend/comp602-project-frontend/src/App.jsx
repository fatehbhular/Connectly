import { useCallback, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import LoginPage from "./auth/LoginPage";
import OnboardingPage from "./auth/OnboardingPage";
import ProfilePage from "./profile/ProfilePage";
import SettingsPage from "./settings/SettingsPage";
import ConnectionsPage from "./connections/ConnectionsPage";
import MessagingPage from "./messaging/MessagingPage";
import NavigationBar from "./components/NavigationBar";
import UserHeatbeat from "./hooks/UserHearbeat";
import { useWebSocket } from "./hooks/useWebSocket";
import { useVoiceCall } from "./hooks/useVoiceCall";

function App() {
  // Save the current user if the user chooses "remember me"
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const persistCurrentUser = useCallback((user) => {
    setCurrentUser(user);
    if (user && localStorage.getItem("currentUser") !== null) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
  }, []);

  const [page, setPage] = useState("profile");
  const [inDM, setInDM] = useState(false);

  // Tracks who the current user is in call with.
  const [activeRecipientId, setActiveRecipientId] = useState(null);

  const [isCallActive, setIsCallActive] = useState(false);

  // Tracks whether the active call is a video call
  const [isVideoCall, setIsVideoCall] = useState(false);

  // Keeps a fresh reference pointer to the active recipient ID to bypass stale execution closures in hooks
  const activeRecipientIdRef = useRef(null);

  // Keep the mutable ref perfectly aligned whenever the reactive state variable changes
  useEffect(() => {
    activeRecipientIdRef.current = activeRecipientId;
  }, [activeRecipientId]);

  // Incoming call state - shown when someone calls the user.
  const [incomingCall, setIncomingCall] = useState(null); // { callerId, offer, isVideo }

  // FIX: Ref to always give handleSignal a fresh incomingCall value, avoiding stale closures
  const incomingCallRef = useRef(null);

  // Keep the mutable ref perfectly aligned whenever incomingCall state changes
  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  // Holds early ICE candidates arriving before the user clicks "Accept"
  const pendingIceCandidatesRef = useRef([]);

  /**
   * Called when an incoming call-offer arrives.
   * Stores it in state so we can show an incoming call UI.
   */
  const handleIncomingCall = useCallback((callerId, offer) => {
    console.log("handleIncomingCall CALLED with callerId:", callerId, "offer:", offer);
    setIncomingCall({ callerId, offer });
  }, []);

  // Safe mutable container to hold WebSocket sender function across renders.
  const sendSignalRef = useRef(null);

  const stableSendSignal = useCallback((type, targetId, payload) => {
    if (sendSignalRef.current) {
      sendSignalRef.current(type, targetId, payload);
    } else {
      console.warn("sendSignal invoked before WebSocket was connected.");
    }
  }, []);

  const resetCallState = useCallback(() => {
    pendingIceCandidatesRef.current = [];
    setIncomingCall(null);
    setActiveRecipientId(null);
    setIsCallActive(false);
    setIsVideoCall(false);
  }, []);

  // Voice/video call hook at App level
  const { startCall, endCall, handleOffer, handleAnswer, handleIceCandidate, localStreamRef, localStreamVersion } = useVoiceCall(
    currentUser?.userId,
    stableSendSignal,
    handleIncomingCall,
  );

  // Callback ref for the local camera preview - attaches stream as soon as the element mounts
  const localVideoRef = useCallback((node) => {
    if (node && localStreamRef.current) {
      node.srcObject = localStreamRef.current;
    }
  }, [isCallActive, localStreamVersion]); // re-runs when call becomes active and when the camera stream arrives

  /**
   * Routes incoming signalling messages to the right handler.
   * Sits at App level because signals can arrive at any time, regardless of which page the user is in.
   */
  const handleSignal = useCallback((signal) => {
    switch (signal.type) {
      case 'call-offer':
        setIncomingCall({
          callerId: signal.senderId,
          offer: signal.payload,
          isVideo: false,
        });
        break;

      // Video call offer - same flow as voice but sets isVideo flag so the receiver renders video UI
      case 'video-call-offer':
        setIncomingCall({
          callerId: signal.senderId,
          offer: signal.payload,
          isVideo: true,
        });
        break;

      case 'call-answer':
        // The person we called accepted - handshake is complete
        handleAnswer(signal.payload);
        break;

      case 'ice-candidate':
        // Use incomingCallRef instead of stale incomingCall state value
        // If the receiver hasn't dismissed the incoming call banner yet, 
        // it means the call is still initializing, so keep buffering
        if (incomingCallRef.current !== null) {
          pendingIceCandidatesRef.current.push(signal.payload);
        } else {
          // The banner is gone (setIncomingCall(null) has run), so the connection is fully live!
          handleIceCandidate(signal.payload);
        }
        break;

      case 'call-ended':
        // Other person hung up or cancelled the dial
        resetCallState();
        endCall(null); // Pass null so the receiver doesn't re-send a call-ended signal
        break;

      case 'call-rejected':
        resetCallState();
        endCall(null);
        break;

      default:
        console.warn("Unknown signal type", signal.type);
    }
  }, [handleAnswer, handleIceCandidate, endCall, resetCallState]);

  // Connect to WebSocket signalling server once user is logged in.
  const { sendSignal } = useWebSocket(currentUser?.userId, handleSignal);

  // Keep the ref updated with the real live socket function once it connects
  useEffect(() => {
    if (sendSignal) {
      sendSignalRef.current = sendSignal;
    }
  }, [sendSignal]);

  // Runs for the whole session once logged in
  UserHeatbeat(currentUser?.userId);

  // If nobody is logged in, show the login page
  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  // New user, run them through onboarding before the main app
  if (!currentUser.profileComplete) {
    return <OnboardingPage currentUser={currentUser} onComplete={persistCurrentUser} />;
  }

  // Shared hang up handler used by both the voice widget and video overlay
  const handleHangUp = () => {
    const peerId = activeRecipientId;
    setActiveRecipientId(null);
    setIsCallActive(false);
    setIsVideoCall(false);
    endCall(peerId);
  };

  // Otherwise show the main app
  return (
    <div>
      {page === "profile" && <ProfilePage currentUser={currentUser} onProfileUpdate={persistCurrentUser} />}
      {page === "connections" && (
        <ConnectionsPage currentUser={currentUser} onUserUpdate={persistCurrentUser} />
      )}
      {page === "messages" && (
      <MessagingPage
        currentUser={currentUser} 
        onDMOpen={setInDM} 
        sendSignal={sendSignal}
        onRecipientChange={(id) => setActiveRecipientId(id ? Number(id) : null)}
        startCall={(id, isVideo = false) => {
          setActiveRecipientId(id ? Number(id) : null);
          setIsVideoCall(isVideo);
          setIsCallActive(true); // Mark call active when dialing
          startCall(id, isVideo);
        }}
        endCall={() => {
          const peerId = activeRecipientId; // Capture before clearing state
          setActiveRecipientId(null);
          setIsCallActive(false);
          setIsVideoCall(false);
          endCall(peerId); // Pass captured ID so endCall sends the signal before state is cleared
        }}
      />
      )}

      {page === "settings" && (
        <SettingsPage
          onSignOut={() => { setCurrentUser(null); setPage("profile"); }}
          user={currentUser}
          onUserUpdate={persistCurrentUser}
        />
      )}

      {/* Incoming call banner - Rendered via createPortal to sit above everything visually */}
      {incomingCall && createPortal(
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-[#E8E4DC] px-6 py-4 flex items-center justify-between shadow-md">
          <p className="text-sm font-semibold text-gray-900">
            {incomingCall.isVideo ? "📹" : "📞"} Incoming {incomingCall.isVideo ? "video" : "voice"} call from user {incomingCall.callerId}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={async () => {
                const callerId = incomingCall.callerId;
                const isVideo = incomingCall.isVideo;

                // 1. Set the active recipient ID and call type state
                setActiveRecipientId(callerId);
                setIsVideoCall(isVideo);
                setIsCallActive(true);

                // Give React one frame to mount the video element before the remote track can arrive.
                await new Promise((resolve) => requestAnimationFrame(resolve));

                // 2. Await the complete setup of the WebRTC Peer Connection and Remote Description
                await handleOffer(callerId, incomingCall.offer, isVideo);

                // 3. Now that the peer connection is officially ready, safely flush the early candidates
                if (pendingIceCandidatesRef.current.length > 0) {
                  pendingIceCandidatesRef.current.forEach((candidate) => {
                    handleIceCandidate(candidate);
                  });
                  pendingIceCandidatesRef.current = [];
                }

                // 4. Finally, dismiss the banner
                setIncomingCall(null);
              }}
              className="px-4 py-2 rounded-full bg-green-500 text-white text-sm font-semibold"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => {
                stableSendSignal("call-rejected", incomingCall.callerId, null);
                pendingIceCandidatesRef.current = [];
                setIncomingCall(null);
              }}
              className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-semibold"
            >
              Decline
            </button>
          </div>
        </div>,
        document.body,
      )}

      {/* only show the full nav if not in msg */}  
      {!inDM
        ? <NavigationBar setPage={setPage} currentPage={page} currentUser={currentUser} />
        : null
      }

      {/* Fullscreen Video Call Overlay - Only shown during active video calls */}
      {isCallActive && isVideoCall && (
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
            
            {/* Remote video feed - fills the whole screen */}
            <video
              id="remote-video-player"
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local camera preview - picture-in-picture in bottom right corner */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // Always mute local preview to prevent feedback
              className="absolute bottom-8 right-6 w-32 h-44 object-cover rounded-2xl border-2 border-white shadow-xl"
            />

            {/* Hang up button */}
            <button
              onClick={handleHangUp}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 p-5 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-full shadow-2xl"
              title="End Call"
            >
              <svg className="w-7 h-7 transform rotate-135" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.01 21.675c2.396-.142 4.673-1.077 6.554-2.67a1 1 0 00.261-1.214l-2.344-4.343a1 1 0 00-1.31-.411l-2.112 1.056a15.148 15.148 0 01-6.9-6.9l1.056-2.112a1 1 0 00-.411-1.31L6.46 1.43a1 1 0 00-1.214.261C3.653 3.573 2.718 5.85 2.575 8.246c-.22 3.665 1.034 7.288 3.541 10.204 2.916 3.385 6.84 5.438 10.97 5.234z" />
              </svg>
            </button>
          </div>,
          document.body
        )
      )}

      {/* Persistent Floating Voice Call Widget - Only shown during active voice calls */}
      {isCallActive && !isVideoCall && (
        createPortal(
          <div className="fixed bottom-6 right-6 z-[9999] bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-4 animate-fade-in">
            <div className="flex flex-col">
              <span className="text-xs text-green-400 font-bold tracking-wider uppercase animate-pulse">
                ● Live Voice Call
              </span>
              <span className="text-sm text-gray-300 font-medium">
                Connected with User {activeRecipientId}
              </span>
            </div>
            
            <button
              type="button"
              onClick={handleHangUp}
              className="p-3 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-full flex items-center justify-center shadow-lg"
              title="End call"
            >
              <svg className="w-5 h-5 transform rotate-135" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.01 21.675c2.396-.142 4.673-1.077 6.554-2.67a1 1 0 00.261-1.214l-2.344-4.343a1 1 0 00-1.31-.411l-2.112 1.056a15.148 15.148 0 01-6.9-6.9l1.056-2.112a1 1 0 00-.411-1.31L6.46 1.43a1 1 0 00-1.214.261C3.653 3.573 2.718 5.85 2.575 8.246c-.22 3.665 1.034 7.288 3.541 10.204 2.916 3.385 6.84 5.438 10.97 5.234z" />
              </svg>
            </button>
          </div>
        ,document.body
      ))}

      {/* Persistent HTML Audio Player for WebRTC voice streams */}
      <audio 
        id="remote-audio-player" 
        autoPlay 
        playsInline 
        style={{ display: 'none' }} 
      />
    </div>
  );
}

export default App;
