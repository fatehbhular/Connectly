import BASE_URL from '../config.js';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserCardUI from "./UserCardUI";
import { getUserSocial } from "../utils/socialUrl.js";

export default function ConnectionsPage({ currentUser, onUserUpdate }) {
  const [queue, setQueue] = useState([]);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [introMessage, setIntroMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [sending, setSending] = useState(false);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const getMutualCount = (user) => {
    if (!currentUser.connectionKeys || !user?.connectionKeys) return 0;
    return currentUser.connectionKeys.filter(id => user.connectionKeys.includes(id)).length;
  };

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

    setQueue([...pendingItems, ...normalItems]);
  };

  useEffect(() => { loadQueue(); }, [currentUser]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadQueue(activeFilters);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [currentUser?.userId, activeFilters]);

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

  const preventViewportJump = (e) => {
    e.target.setAttribute('readonly', true);
    setTimeout(() => e.target.removeAttribute('readonly'), 100);
  };

  // ✅ NEW: block handler — calls backend then removes card from queue
  const handleBlock = async (targetUserId) => {
    try {
      await fetch(`${BASE_URL}/users/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', userId: currentUser.userId },
        body: JSON.stringify({ targetUserId }),
      });
    } catch (e) { console.log('Failed to block:', e); }
    advance();
  };

  function SwipeLeft() {
    if (isPending) {
      fetch(`${BASE_URL}/api/connections/request/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: currentItem.requestId })
      }).catch(e => console.log('Failed to decline:', e));
    }
    if (cardUser?.userId) {
      fetch(`${BASE_URL}/analytics/${cardUser.userId}/swipe?direction=left`, { method: 'POST' }).catch(() => {});
    }
    advance();
  }

  function SwipeRight() {
    if (cardUser?.userId) {
      fetch(`${BASE_URL}/analytics/${cardUser.userId}/swipe?direction=right`, { method: 'POST' }).catch(() => {});
    }
    if (isPending) setShowReplyModal(true);
    else setShowIntroModal(true);
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
      const res = await fetch(`${BASE_URL}/users/profile`, { headers: { 'userId': currentUser.userId } });
      const updated = await res.json();
      onUserUpdate(updated);
    } catch (e) { console.log('Failed to accept:', e); }
    setAccepting(false);
    setShowReplyModal(false);
    setReplyMessage('');
    advance();
  };

  const filterInputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #E8E4DC', borderRadius: 12,
    fontSize: 14, boxSizing: 'border-box', background: '#F0EDE6', outline: 'none',
    color: '#1a1a1a', fontFamily: 'inherit',
  };

  const filterLabelStyle = {
    fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#B0A99F', display: 'block', marginBottom: 6,
  };

  const modalCard = {
    width: '100%', maxWidth: 400,
    background: 'white', borderRadius: 24,
    padding: '28px', border: '1px solid #E8E4DC',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    display: 'flex', flexDirection: 'column', gap: '18px',
  };

  const modalTextarea = {
    width: '100%', padding: '14px', background: '#F0EDE6',
    border: '1px solid #E8E4DC', borderRadius: 14,
    fontSize: 14, color: '#1a1a1a', resize: 'none',
    outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
    boxSizing: 'border-box',
  };

  const primaryBtn = {
    flex: 2, padding: '14px', background: '#fb923c', color: 'white',
    border: 'none', borderRadius: 12, fontWeight: 700,
    cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
  };

  const secondaryBtn = {
    flex: 1, padding: '14px', background: '#F0EDE6', color: '#B0A99F',
    border: '1px solid #E8E4DC', borderRadius: 12, fontWeight: 600,
    cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
  };

  const modalAvatar = (name) => (
    <div style={{
      width: 46, height: 46, borderRadius: '50%',
      background: 'linear-gradient(135deg, #fdba74, #fb923c)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: 19, flexShrink: 0,
      boxShadow: '0 0 0 2px white',
    }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );

  const gradientBlurBackdrop = {
    position: 'fixed', inset: 0, zIndex: 50,
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
    maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)',
    pointerEvents: 'none',
  };

  return (
    <div className="flex flex-col w-full h-dvh bg-[#F0EDE6]" style={{ position: 'relative' }}>

      <motion.div
        className="flex items-baseline justify-between px-6 pt-6 pb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        style={{ position: 'relative', zIndex: 60 }}
      >
        <div className="flex items-baseline gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Connect</h1>
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-1">
            discover people
          </p>
        </div>

        <button
          onClick={() => setShowFilterPanel(prev => !prev)}
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', zIndex: 50 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          {hasActiveFilters && (
            <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#fb923c' }} />
          )}
        </button>
      </motion.div>

      {showFilterPanel && (
        <div onClick={() => setShowFilterPanel(false)} style={{ position: 'absolute', inset: 0, top: 80, zIndex: 30, backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', background: 'rgba(240,237,230,0.3)' }} />
      )}
      {showFilterPanel && (
        <div style={{ position: 'absolute', top: 80, left: 16, right: 16, zIndex: 40, background: 'white', borderRadius: 20, border: '1px solid #E8E4DC', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={filterLabelStyle}>Skill</label>
              <input type="text" placeholder="e.g. React" value={skillInput} onChange={e => setSkillInput(e.target.value)} onFocus={preventViewportJump} style={filterInputStyle} />
            </div>
            <div>
              <label style={filterLabelStyle}>Industry</label>
              <input type="text" placeholder="e.g. Software Engineering" value={industryInput} onChange={e => setIndustryInput(e.target.value)} onFocus={preventViewportJump} style={filterInputStyle} />
            </div>
            <div>
              <label style={filterLabelStyle}>Location</label>
              <input type="text" placeholder="e.g. Auckland" value={locationInput} onChange={e => setLocationInput(e.target.value)} onFocus={preventViewportJump} style={filterInputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <button onClick={handleApplyFilters} style={{ flex: 1, padding: '11px', background: '#fb923c', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Apply</button>
              <button onClick={handleClearFilters} style={{ flex: 1, padding: '11px', background: '#F0EDE6', color: '#B0A99F', border: '1px solid #E8E4DC', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div style={{ position: 'absolute', top: 80, left: 16, right: 16, zIndex: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {activeFilters.skill && <span style={{ background: 'white', color: '#C4785A', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: '1px solid #E8E4DC', letterSpacing: '0.04em' }}>Skill: {activeFilters.skill}</span>}
          {activeFilters.industry && <span style={{ background: 'white', color: '#C4785A', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: '1px solid #E8E4DC', letterSpacing: '0.04em' }}>Industry: {activeFilters.industry}</span>}
          {activeFilters.location && <span style={{ background: 'white', color: '#C4785A', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: '1px solid #E8E4DC', letterSpacing: '0.04em' }}>Location: {activeFilters.location}</span>}
        </div>
      )}

      {showIntroModal && (
        <>
          <div style={gradientBlurBackdrop} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 51, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 32px' }}>
            <motion.div
              style={modalCard}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {modalAvatar(cardUser?.displayName)}
                <div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>Connect with {cardUser?.displayName}</p>
                  <p style={{ fontSize: 12, color: '#B0A99F', margin: '3px 0 0 0' }}>Write to introduce yourself.</p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #E8E4DC' }} />
              <textarea rows={5} placeholder="Write a short intro about yourself..." value={introMessage} onChange={e => setIntroMessage(e.target.value)} style={modalTextarea} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={secondaryBtn} onClick={() => { setShowIntroModal(false); setIntroMessage(''); }}>Cancel</button>
                <button style={{ ...primaryBtn, opacity: sending ? 0.7 : 1 }} onClick={handleSendIntro} disabled={sending}>
                  {sending ? 'Sending…' : 'Send Introduction'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {showReplyModal && (
        <>
          <div style={gradientBlurBackdrop} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 51, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 32px' }}>
            <motion.div
              style={modalCard}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {modalAvatar(cardUser?.displayName)}
                <div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>Accept & Reply</p>
                  <p style={{ fontSize: 12, color: '#B0A99F', margin: '3px 0 0 0' }}>Write a reply to complete the connection.</p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #E8E4DC' }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B0A99F', margin: '0 0 8px 0' }}>Their intro</p>
                <div style={{ background: '#F0EDE6', borderRadius: 14, padding: '13px 15px', border: '1px solid #E8E4DC' }}>
                  <p style={{ fontSize: 13, color: '#1a1a1a', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{currentItem?.senderMessage}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B0A99F', margin: '0 0 8px 0' }}>Your reply</p>
                <textarea rows={4} placeholder="Write your reply..." value={replyMessage} onChange={e => setReplyMessage(e.target.value)} style={modalTextarea} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={secondaryBtn} onClick={() => { setShowReplyModal(false); setReplyMessage(''); }}>Cancel</button>
                <button style={{ ...primaryBtn, opacity: accepting ? 0.7 : 1 }} onClick={handleAccept} disabled={accepting}>
                  {accepting ? 'Connecting…' : 'Accept & Connect'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}

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
                <UserCardUI
                  userId={cardUser.userId}
                  user={cardUser.displayName}
                  industry={cardUser.industry}
                  bio={cardUser.bio}
                  skills={cardUser.skills}
                  latitude={cardUser.latitude}
                  longitude={cardUser.longitude}
                  location={cardUser.location}
                  social={getUserSocial(cardUser)}
                  currentUser={currentUser}
                  wantsToConnect={wantsToConnect}
                  mutuals={currentItem.mutuals}
                  verified={cardUser.verified || false}
                  hasPendingRequest={isPending}
                  SwipeLeft={SwipeLeft}
                  SwipeRight={SwipeRight}
                  onBlock={handleBlock}
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4785A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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