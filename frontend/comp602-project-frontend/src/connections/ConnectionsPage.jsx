import BASE_URL from '../config.js';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserCardUI from "./UserCardUI";

export default function ConnectionsPage({ currentUser }) {
  const [queue, setQueue] = useState([]);
  const [introPopupVisible, setIntroPopupVisible] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [introMessage, setIntroMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [sending, setSending] = useState(false);

  // filter state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const getMutualCount = (user) => {
    if (!currentUser.connectionKeys || !user?.connectionKeys) return 0;
    return currentUser.connectionKeys.filter(id => user.connectionKeys.includes(id)).length;
  };

  // fetch the queue, optionally with filter params
  const loadQueue = async (filters = {}) => {
    const pendingRes = await fetch(`${BASE_URL}/api/connections/requests/pending`, {
      headers: { 'userId': currentUser.userId }
    });
    const pendingData = await pendingRes.json();
    const pendingItems = pendingData.map(p => ({ ...p, type: 'pending', mutuals: getMutualCount(p.sender) }));

    const params = new URLSearchParams();
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.location) params.append('location', filters.location);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const usersRes = await fetch(`${BASE_URL}/api/connections/users${queryString}`, {
      headers: { 'userId': currentUser.userId }
    });
    const usersData = await usersRes.json();
    const normalItems = usersData.map(u => ({ ...u, type: 'normal', mutuals: getMutualCount(u) }));

    // pending requests always go first
    setQueue([...pendingItems, ...normalItems]);
  };

  useEffect(() => {
    loadQueue();
  }, [currentUser]);

  // show the intro popup whenever the front card is a pending request
  useEffect(() => {
    setIntroPopupVisible(queue[0]?.type === 'pending');
  }, [queue]);

  const handleApplyFilters = () => {
    const filters = {};
    if (skillInput.trim()) filters.skill = skillInput.trim();
    if (industryInput.trim()) filters.industry = industryInput.trim();
    if (locationInput.trim()) filters.location = locationInput.trim();
    setActiveFilters(filters);
    setShowFilterPanel(false);
    loadQueue(filters);
  };

  const handleClearFilters = () => {
    setSkillInput('');
    setIndustryInput('');
    setLocationInput('');
    setActiveFilters({});
    setShowFilterPanel(false);
    loadQueue({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const currentItem = queue[0];
  const isPending = currentItem?.type === 'pending';
  const cardUser = isPending ? currentItem?.sender : currentItem;
  const wantsToConnect = isPending || (!isPending && currentItem?.requestedUsers?.includes(currentUser.userId));

  const advance = () => setQueue(prev => prev.slice(1));

  function SwipeLeft() {
    if (isPending) {
      fetch(`${BASE_URL}/api/connections/request/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: currentItem.requestId })
      }).catch(e => console.log('Failed to decline:', e));
    }
    // record a left swipe on the card owner's analytics
    if (cardUser?.userId) {
      fetch(`http://localhost:8080/analytics/${cardUser.userId}/swipe?direction=left`, {
        method: 'POST'
      }).catch(e => console.log('Failed to record left swipe:', e));
    }
    advance();
  }

  function SwipeRight() {
    // record a right swipe on the card owner's analytics
    if (cardUser?.userId) {
      fetch(`http://localhost:8080/analytics/${cardUser.userId}/swipe?direction=right`, {
        method: 'POST'
      }).catch(e => console.log('Failed to record right swipe:', e));
    }
    if (isPending) {
      setShowReplyModal(true);
    } else {
      setShowIntroModal(true);
    }
  }

  const handleSendIntro = async () => {
    if (!introMessage.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`${BASE_URL}/api/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.userId, receiverId: currentItem.userId, message: introMessage })
      });
    } catch (e) { console.log('Failed to send request:', e); }
    setSending(false);
    setShowIntroModal(false);
    setIntroMessage('');
    advance();
  };

  const handleAccept = async () => {
    if (!replyMessage.trim() || accepting) return;
    setAccepting(true);
    try {
      await fetch(`${BASE_URL}/api/connections/request/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: currentItem.requestId, replyMessage: replyMessage })
      });
    } catch (e) { console.log('Failed to accept:', e); }
    setAccepting(false);
    setShowReplyModal(false);
    setReplyMessage('');
    advance();
  };

  return (
    <div className="flex flex-col w-full h-dvh bg-[#F0EDE6]">

      {/* Header */}
      <motion.div
        className="flex items-center justify-between px-6 pt-14 pb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <div className="flex items-baseline gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Connect</h1>
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-1">
            discover people
          </p>
        </div>

        {/* filter button — orange dot shows when filters are active */}
        <button
          onClick={() => setShowFilterPanel(prev => !prev)}
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', zIndex: 10 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          {hasActiveFilters && (
            <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#C4785A' }} />
          )}
        </button>
      </motion.div>

      {/* filter panel */}
      {showFilterPanel && (
        <div style={{ background: 'white', borderBottom: '1px solid #E8E4DC' }}>
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 4 }}>Skill</label>
              <input type="text" placeholder="e.g. React" value={skillInput} onChange={e => setSkillInput(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E8E4DC', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 4 }}>Industry</label>
              <input type="text" placeholder="e.g. Software Engineering" value={industryInput} onChange={e => setIndustryInput(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E8E4DC', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 4 }}>Location</label>
              <input type="text" placeholder="e.g. Auckland" value={locationInput} onChange={e => setLocationInput(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E8E4DC', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleApplyFilters} style={{ flex: 1, padding: '10px', background: '#C4785A', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Apply Filters</button>
              <button onClick={handleClearFilters} style={{ flex: 1, padding: '10px', background: 'none', color: '#888', border: '1px solid #E8E4DC', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Clear Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* active filter tags */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 24px' }}>
          {activeFilters.skill && (
            <span style={{ background: '#FDF0EA', color: '#C4785A', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
              Skill: {activeFilters.skill}
            </span>
          )}
          {activeFilters.industry && (
            <span style={{ background: '#FDF0EA', color: '#C4785A', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
              Industry: {activeFilters.industry}
            </span>
          )}
          {activeFilters.location && (
            <span style={{ background: '#FDF0EA', color: '#C4785A', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
              Location: {activeFilters.location}
            </span>
          )}
        </div>
      )}

      {/* intro modal */}
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

      {/* reply modal for pending requests */}
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

      {/* card area */}
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
              <div style={{ position: 'relative', width: '320px' }}>

                {/* overlay shown on pending cards before the user clicks View Profile */}
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
              <p className="text-[#B0A99F] text-sm">
                {hasActiveFilters ? 'No profiles match your filters' : 'No more people to show'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
