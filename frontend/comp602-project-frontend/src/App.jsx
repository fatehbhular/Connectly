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
import { getDisplayName } from "./services/MessagingService";
import BASE_URL from "./config.js";

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

  // Keep session in sync with the server (e.g. social link saved on another device).
  useEffect(() => {
    if (!currentUser?.userId) return;

    let cancelled = false;

    const syncProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/profile`, {
          headers: { userId: currentUser.userId },
        });
        if (!res.ok || cancelled) return;
        persistCurrentUser(await res.json());
      } catch {
        // Offline — keep the cached session.
      }
    };

    syncProfile();

    const onVisible = () => {
      if (document.visibilityState === "visible") syncProfile();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [currentUser?.userId, persistCurrentUser]);

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

  const [callDisplayNames, setCallDisplayNames] = useState({});
  const callNameCacheRef = useRef({});

  useEffect(() => {
    const ids = [incomingCall?.callerId, activeRecipientId].filter(Boolean);
    let cancelled = false;

    ids.forEach((id) => {
      if (callNameCacheRef.current[id] !== undefined) return;

      getDisplayName(id)
        .then((name) => {
          if (cancelled) return;
          callNameCacheRef.current[id] = name;
          setCallDisplayNames({ ...callNameCacheRef.current });
        })
        .catch(() => {
          if (cancelled) return;
          callNameCacheRef.current[id] = `User ${id}`;
          setCallDisplayNames({ ...callNameCacheRef.current });
        });
    });

    return () => {
      cancelled = true;
    };
  }, [incomingCall?.callerId, activeRecipientId]);

  const formatCallName = (userId) => {
    if (!userId) return "";
    return callDisplayNames[userId] ?? `User ${userId}`;
  };

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
    return <LoginPage onLogin={persistCurrentUser} />;
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
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-[#E8E4DC] px-5 py-4 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#F0EDE6] border border-[#E8E4DC] flex items-center justify-center">
              {incomingCall.isVideo ? (
                <svg className="w-5 h-5 text-[#C4785A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[#C4785A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-0.5">
                Incoming {incomingCall.isVideo ? "video" : "voice"} call
              </p>
              <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                {formatCallName(incomingCall.callerId)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 ml-3">
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
              className="px-4 py-2 rounded-full bg-[#fb923c] hover:opacity-90 text-white text-sm font-semibold transition-opacity"
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
              className="px-4 py-2 rounded-full bg-[#F0EDE6] text-[#B0A99F] border border-[#E8E4DC] text-sm font-semibold hover:bg-[#E8E4DC] transition-colors"
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

            {/* Call info header */}
            <div
              className="absolute top-0 left-0 right-0 bg-black pointer-events-none"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
              <div className="px-6 py-5">
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#fdba74] mb-0.5">
                  Live video call
                </p>
                <p className="text-lg font-semibold text-white">
                  {formatCallName(activeRecipientId)}
                </p>
              </div>
            </div>

            {/* Local camera preview - picture-in-picture in bottom right corner */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // Always mute local preview to prevent feedback
              className="absolute bottom-8 right-6 w-32 h-44 object-cover rounded-2xl border-2 border-[#E8E4DC] shadow-xl"
            />

            {/* End call button — matches voice call popup */}
            <button
              onClick={handleHangUp}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center rounded-full text-white active:scale-95 transition bg-gradient-to-br from-orange-400 to-orange-600 shadow-2xl"
              title="End Call"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>,
          document.body
        )
      )}

      {/* Persistent Floating Voice Call Widget - Only shown during active voice calls */}
      {isCallActive && !isVideoCall && (
        createPortal(
          <div
            className={`fixed right-4 z-[9999] bg-white px-5 py-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#E8E4DC] flex items-center gap-4 animate-fade-in ${inDM ? "top-16" : "top-24"}`}
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-[#C4785A] font-semibold tracking-[0.12em] uppercase flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#fb923c] animate-pulse shrink-0" />
                Live voice call
              </span>
              <span className="text-sm text-[#1a1a1a] font-medium truncate">
                {formatCallName(activeRecipientId)}
              </span>
            </div>
            
            <button
              type="button"
              onClick={handleHangUp}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white active:scale-95 transition shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg"
              title="End call"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
