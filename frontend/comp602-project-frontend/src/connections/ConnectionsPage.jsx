import BASE_URL from '../config.js';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserCardUI from "./UserCardUI";

export default function ConnectionsPage({ currentUser }) {
  const [queue, setQueue] = useState([]);                                   // combined queue: pending request cards first, then normal users
  const [introPopupVisible, setIntroPopupVisible] = useState(false);        // popup shown over the card when it is a pending request
  const [showIntroModal, setShowIntroModal] = useState(false);              // modal shown when swiping right on a normal card
  const [showReplyModal, setShowReplyModal] = useState(false);              // modal shown when swiping right on a pending card
  const [introMessage, setIntroMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  // Returns number of mutual connections between the signed-in user and another user
  const getMutualCount = (user) => {
    if (!currentUser.connectionKeys || !user?.connectionKeys) return 0;
    return currentUser.connectionKeys.filter(id => user.connectionKeys.includes(id)).length;
  };

  useEffect(() => {
    const load = async () => {
      const pendingRes = await fetch(`${BASE_URL}/api/connections/requests/pending`, {
        headers: { 'userId': currentUser.userId }
      });
      const pendingData = await pendingRes.json();
      const pendingItems = pendingData.map(p => ({ ...p, type: 'pending', mutuals: getMutualCount(p.sender) }));

      const usersRes = await fetch(`${BASE_URL}/api/connections/users`, {
        headers: { 'userId': currentUser.userId }
      });
      const usersData = await usersRes.json();
      const normalItems = usersData.map(u => ({ ...u, type: 'normal', mutuals: getMutualCount(u) }));

      setQueue([...pendingItems, ...normalItems]);                          // pending requests always come first
    };
    load();
  }, [currentUser]);

  // Show the intro popup automatically whenever the front card is a pending request
  useEffect(() => {
    setIntroPopupVisible(queue[0]?.type === 'pending');
  }, [queue]);

  const currentItem = queue[0];                                             // always read from the front of the queue
  const isPending = currentItem?.type === 'pending';
  const cardUser = isPending ? currentItem?.sender : currentItem;           // pending cards nest the user under .sender
  const wantsToConnect = isPending || (!isPending && currentItem?.requestedUsers?.includes(currentUser.userId));

  const advance = () => setQueue(prev => prev.slice(1));                    // removes the front item and moves to the next card

  function SwipeLeft() {
    if (isPending) {                                                        // declining a pending request
      fetch(`${BASE_URL}/api/connections/request/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: currentItem.requestId })
      }).catch(e => console.log('Failed to decline:', e));
    }
    advance();
  }

  function SwipeRight() {
    if (isPending) {
      setShowReplyModal(true);                                              // pending card: open reply modal to accept
    } else {
      setShowIntroModal(true);                                              // normal card: open intro modal to send request
    }
  }

  const handleSendIntro = async () => {                                     // sends the intro message and advances to the next card
    if (!introMessage.trim()) return;
    try {
      await fetch(`${BASE_URL}/api/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.userId, receiverId: currentItem.userId, message: introMessage })
      });
    } catch (e) { console.log('Failed to send request:', e); }
    setShowIntroModal(false);
    setIntroMessage('');
    advance();
  };

  const handleAccept = async () => {                                        // accepts the pending request with a reply and advances
    if (!replyMessage.trim()) return;
    try {
      await fetch(`${BASE_URL}/api/connections/request/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: currentItem.requestId, replyMessage: replyMessage })
      });
    } catch (e) { console.log('Failed to accept:', e); }
    setShowReplyModal(false);
    setReplyMessage('');
    advance();
  };

  return (
    <div className="flex flex-col w-full h-dvh bg-[#F0EDE6]">

      {/* Header */}
      <motion.div
        className="flex items-baseline gap-2 px-6 pt-14 pb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Connect</h1>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-1">
          discover people
        </p>
      </motion.div>

      {/* Intro modal - shown when the user swipes right on a normal card */}
      {showIntroModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ width: '100%', maxWidth: '360px', background: 'white', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p>Connect with {cardUser?.displayName}</p>
            <p>Write a message to introduce yourself.</p>
            <textarea
              rows={4}
              placeholder="Introduce yourself..."
              value={introMessage}
              onChange={e => setIntroMessage(e.target.value)}
              style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ flex: 1, padding: '12px' }} onClick={() => { setShowIntroModal(false); setIntroMessage(''); }}>Cancel</button>
              <button style={{ flex: 1, padding: '12px' }} onClick={handleSendIntro}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Reply modal - shown when the user swipes right on a pending card */}
      {showReplyModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ width: '100%', maxWidth: '360px', background: 'white', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p>Accept and reply</p>
            <div>
              <p>Their message:</p>
              <p>"{currentItem?.senderMessage}"</p>
            </div>
            <textarea
              rows={4}
              placeholder="Write your reply..."
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ flex: 1, padding: '12px' }} onClick={() => { setShowReplyModal(false); setReplyMessage(''); }}>Cancel</button>
              <button style={{ flex: 1, padding: '12px' }} onClick={handleAccept}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Card area */}
      <div className="flex flex-col flex-1 items-center justify-start px-6 pt-10 gap-6">
        <AnimatePresence mode="wait">
          {cardUser ? (
            <motion.div
              key={isPending ? `pending-${currentItem.requestId}` : cardUser.userId}
              className="flex flex-col items-center gap-6 w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              {/* Wrapper with relative positioning so the intro popup overlays the card exactly */}
              <div style={{ position: 'relative', width: '320px' }}>

                {/* Intro popup - covers the card for pending requests until the user clicks View Profile */}
                {introPopupVisible && isPending && (
                  <div className="absolute inset-0 rounded-2xl" style={{ background: 'white', padding: '24px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                    <p>{cardUser?.displayName} wants to connect</p>
                    <p>"{currentItem?.senderMessage}"</p>
                    <button style={{ padding: '12px' }} onClick={() => setIntroPopupVisible(false)}>View Profile</button>
                  </div>
                )}

                <UserCardUI
                  userId={cardUser.userId}
                  user={cardUser.displayName}
                  industry={cardUser.industry}
                  bio={cardUser.bio}
                  skills={cardUser.skills}
                  latitude={cardUser.latitude}
                  longitude={cardUser.longitude}
                  location={cardUser.location}
                  currentUser={currentUser}
                  wantsToConnect={wantsToConnect}
                  mutuals={currentItem.mutuals}
                  verified={cardUser.verified || false}
                  hasPendingRequest={isPending}
                  SwipeLeft={SwipeLeft}
                  SwipeRight={SwipeRight}
                />
              </div>

              <p className="text-[#B0A99F] text-xs">pass - connect</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <div className="w-14 h-14 rounded-full bg-white border border-[#E8E4DC] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#C4785A" strokeWidth="1.8" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <p className="text-[#B0A99F] text-sm">No more people to show</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}