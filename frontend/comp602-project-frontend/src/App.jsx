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
  
  // Save the current user if the user chooses "rememeber me"
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [page, setPage] = useState("profile");
  const [inDM, setInDM] = useState(false);

  // Tracks who the current user is in call with.
  const [activeRecipientId, setActiveRecipientId] = useState(null);

  // Keeps a fresh reference pointer to the active recipient ID to bypass stale execution closures in hooks
  const activeRecipientIdRef = useRef(null);

  // Keep the mutable ref perfectly aligned whenever the reactive state variable changes
  useEffect(() => {
    activeRecipientIdRef.current = activeRecipientId;
  }, [activeRecipientId]);

  // Incoming call state - shown when someone calls the user.
  const [incomingCall, setIncomingCall] = useState(null); // { callerId, offer }

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

  // Voice call hook at App level
  const { startCall, endCall, handleOffer, handleAnswer, handleIceCandidate } = useVoiceCall(
    currentUser?.userId, 
    activeRecipientId, 
    stableSendSignal, 
    handleIncomingCall
  );

  /**
   * Routes incoming signalling messages to the right handler.
   * Sits at App level because signals can arrive at any time, regardless of which page the user is in.
   */
  const handleSignal = useCallback((signal) => {
    console.log("Incoming signal:", signal);
    
    switch (signal.type) {
      case 'call-offer':
        console.log("Processing call-offer from", signal.senderId);
        setIncomingCall({
          callerId: signal.senderId,
          offer: signal.payload
        });
        break;
      
      case 'call-answer':
        // The person we called accepted - handshake is complete
        handleAnswer(signal.payload);
        break;

      case 'ice-candidate':
        // If the receiver hasn't dismissed the incoming call banner yet, 
        // it means the call is still initializing, so keep buffering!
        if (incomingCall !== null) {
          console.log("Buffering early ICE candidate from caller...");
          pendingIceCandidatesRef.current.push(signal.payload);
        } else {
          // The banner is gone (setIncomingCall(null) has run), so the connection is fully live!
          handleIceCandidate(signal.payload);
        }
        break;

      case 'call-ended':
        // Other person hung up or cancelled the dial
        console.log("Other person ended the call");
        pendingIceCandidatesRef.current = []; // Clear the buffer
        setIncomingCall(null); // Clear the banner if they hang up before we answer
        endCall();
        break;

      default:
        console.warn("Unknown signal type", signal.type);
    }
  }, [handleAnswer, handleIceCandidate, endCall]);

  // Connect to WebSocket signalling server once user is logged in.
  const { sendSignal } = useWebSocket(currentUser?.userId, handleSignal);

  // Track incomingCall state changes for debugging
  useEffect(() => {
    console.log("incomingCall state changed to:", incomingCall);
  }, [incomingCall]);

  // Keep the ref updated with the real live socket function once it connects
  useEffect(() => {
    if (sendSignal) {
      sendSignalRef.current = sendSignal;
    }
  }, [sendSignal])

  // Runs ffor the whole session once logged in
  UserHeatbeat(currentUser?.userId);

  // If nobody is logged in, show the login page
  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  // New user, run them through onboarding before the main app
  if (!currentUser.profileComplete) {
    return <OnboardingPage currentUser={currentUser} onComplete={setCurrentUser} />;
  }

  // Otherwise show the main app
  return (
    <div>
      {page === "profile" && <ProfilePage currentUser={currentUser} onProfileUpdate={setCurrentUser} />}
      {page === "connections" && <ConnectionsPage currentUser={currentUser} />}
      {page === "messages" && (
        <MessagingPage 
          currentUser={currentUser} 
          onDMOpen={setInDM} 
          sendSignal={sendSignal}
          onRecipientChange={(id) => setActiveRecipientId(id ? Number(id) : null)}
          startCall={(id) => {
            setActiveRecipientId(id ? Number(id) : null);
            startCall(id);
          }}
          endCall={() => {
            setActiveRecipientId(null);
            endCall();
          }}
        />
      )}
      {page === "settings" && (
        <SettingsPage
          onSignOut={() => { setCurrentUser(null); setPage("profile"); }}
          user={currentUser}
          onUserUpdate={setCurrentUser}
        />
      )}

      {/* Incoming call banner - Rendered via createPortal to sit above everything visually */}
      {incomingCall ? (
        createPortal(
          (() => {
            console.log("🟢 CRITICAL: The incomingCall condition evaluated to TRUE. Rendering HTML banner element now!");
            return (
              <div className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-[#E8E4DC] px-6 py-4 flex items-center justify-between shadow-md">
                <p className="text-sm font-semibold text-gray-900">
                  📞 Incoming call from user {incomingCall.callerId}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      const callerId = incomingCall.callerId;
                      
                      // 1. Set the active recipient ID state
                      setActiveRecipientId(callerId);
                      
                      // 2. Await the complete setup of the WebRTC Peer Connection and Remote Description
                      await handleOffer(callerId, incomingCall.offer);
                      
                      // 3. Now that the peer connection is officially ready, safely flush the early candidates
                      if (pendingIceCandidatesRef.current.length > 0) {
                        console.log(`Flushing ${pendingIceCandidatesRef.current.length} buffered candidates safely.`);
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
                    onClick={() => {
                      sendSignal('call-rejected', incomingCall.callerId, null);
                      pendingIceCandidatesRef.current = [];
                      setIncomingCall(null);
                    }}
                    className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-semibold"
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })(),
          document.body
        )
      ) : (
        // Inline execution log for when state remains blank
        console.log("🔴 BANNER NOT RENDERING: incomingCall state is null or undefined.")
      )}

      {/* only show the full nav if not im msg */}  
      {!inDM
        ? <NavigationBar setPage={setPage} currentPage={page} currentUser={currentUser} />
        : null
      }
    </div>
  );
}

export default App;