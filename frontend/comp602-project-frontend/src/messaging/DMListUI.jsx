import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnlineDot from '../components/OnlineStatusDot.jsx';
import BASE_URL from '../config.js';

// Formats a timestamp into a short relative label
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default function DMListUI({ dms, dmNames, namesLoaded, onSelectDM, lastMessages, userId, onNewGroup, unreadKeys }) {
    const [presenceMap, setPresenceMap] = useState({});

    useEffect(() => {
        if (!namesLoaded || dms.length === 0) return;
        const fetchPresence = async () => {
            const dmOnly = dms.filter(key => !key.startsWith('group_'));
            const entries = await Promise.all(
                dmOnly.map(async (key) => {
                    const otherUserId = key.split('_').find(id => String(id) !== String(userId));
                    try {
                        const res = await fetch(`${BASE_URL}/presence/${otherUserId}`);
                        const isOnline = await res.json();
                        return [otherUserId, isOnline];
                    } catch { return [otherUserId, false]; }
                })
            );
            setPresenceMap(Object.fromEntries(entries));
        };
        fetchPresence();
        const interval = setInterval(fetchPresence, 30000);
        return () => clearInterval(interval);
    }, [namesLoaded, dms, userId]);

    return (
        <div className="flex flex-col w-full h-dvh bg-[#F0EDE6]">

            {/* Header */}
            <div className="flex items-baseline gap-2 px-6 pt-6 pb-5">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-1">for you</p>
                <button onClick={onNewGroup} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 mb-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#E8E4DC]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0A99F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" placeholder="Search conversations…" className="flex-1 bg-transparent outline-none border-none text-sm text-gray-900 placeholder-[#B0A99F]" />
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 pb-25">
                <AnimatePresence>
                    {!namesLoaded ? (
                        <motion.p className="text-[#B0A99F] text-center mt-10 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Loading…</motion.p>
                    ) : dms.length === 0 ? (
                        <motion.div className="flex flex-col items-center justify-center mt-20 gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="w-14 h-14 rounded-full bg-white border border-[#E8E4DC] flex items-center justify-center">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4785A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <p className="text-[#B0A99F] text-sm">No conversations yet</p>
                        </motion.div>
                    ) : (
                        dms.map((dm, index) => {
                            const isGroup = dm.startsWith('group_');
                            const initials = dmNames[dm]?.[0]?.toUpperCase() || '?';
                            const displayName = dmNames[dm] || dm;
                            const last = lastMessages?.[dm];
                            const timeLabel = last?.timestamp ? formatTime(last.timestamp) : '';
                            const hasUnread = unreadKeys?.has(dm);

                            const otherUserId = isGroup ? null : dm.split('_').find(id => String(id) !== String(userId));
                            const isOnline = !isGroup && otherUserId ? (presenceMap[otherUserId] ?? false) : false;

                            return (
                                <motion.div
                                    key={dm}
                                    onClick={() => onSelectDM(dm)}
                                    className="flex items-center gap-4 px-4 py-3 mb-1 rounded-2xl bg-white border border-[#E8E4DC] cursor-pointer active:scale-[0.98]"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 320, damping: 26 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm text-white bg-gradient-to-br from-orange-300 to-orange-400">
                                            {initials}
                                        </div>
                                        {!isGroup && (
                                            <span className="absolute bottom-0 right-0">
                                                <OnlineDot isOnline={isOnline} />
                                            </span>
                                        )}
                                    </div>

                                    {/* Name + preview with inline time */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className={`text-sm leading-tight truncate ${hasUnread ? 'text-gray-900 font-bold' : 'text-gray-900 font-semibold'}`}>
                                            {displayName} {isGroup && <span style={{ fontSize: '11px', color: '#B0A99F', fontWeight: 400 }}>(Group)</span>}
                                        </span>
                                        {/* Preview with italic time appended */}
                                        <span className="text-[#B0A99F] text-xs truncate mt-0.5">
                                            {last ? (
                                                <>
                                                    {last.senderId === userId ? 'You' : displayName}: {last.content}
                                                    {timeLabel && (
                                                        <em style={{ marginLeft: 5, fontSize: '10px', opacity: 0.75, fontStyle: 'italic' }}>
                                                            {timeLabel}
                                                        </em>
                                                    )}
                                                </>
                                            ) : 'No messages yet'}
                                        </span>
                                    </div>

                                    {/* Right side — unread dot or chevron */}
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        {hasUnread && (
                                            /* Orange notification dot */
                                            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#3B82F6', display: 'block' }} />
                                        )}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                             stroke={hasUnread ? '#3B82F6' : '#D4CFCA'}
                                             strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}