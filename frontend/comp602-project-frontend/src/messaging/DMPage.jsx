import { motion } from 'framer-motion';
import DMPageRenderer from './DMPageRenderer';
import OnlineDot from '../components/OnlineStatusDot.jsx';
import OrangeSpinner from '../components/OrangeSpinner.jsx';
import { useRef, useEffect, useState } from 'react';
import BASE_URL from '../config.js';

export default function DMPage({conversation, conversationLoading, conversationName, userId, dmNames, selectedKey, onSendMessage, onBack, sendSignal, recipientId, startCall, endCall, isGroup, onAddMember, senderNamesMap}) {
    const [newMessage, setNewMessage] = useState('');
    const shouldAutoScroll = useRef(true);
    const scrollContainerRef = useRef(null);
    const hasScrolled = useRef(false);
    const [isOnline, setIsOnline] = useState(false);

    // Fetch online presence for the other user in DMs
    useEffect(() => {
        if (isGroup || !recipientId) return;
        const fetchPresence = async () => {
            try {
                const res = await fetch(`${BASE_URL}/presence/${recipientId}`);
                setIsOnline(await res.json());
            } catch { setIsOnline(false); }
        };
        fetchPresence();
    }, [recipientId, isGroup]);

    useEffect(() => {
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const handleScroll = () => {
            shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        };
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        hasScrolled.current = false;
        shouldAutoScroll.current = true;
    }, [selectedKey]);

    useEffect(() => {
        if (!scrollContainerRef.current) return;
        if (conversation.length === 0) return;
        const el = scrollContainerRef.current;
        const scrollToBottom = (smooth = false) => {
            el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
        };
        if (!hasScrolled.current) {
            scrollToBottom(false);
            hasScrolled.current = true;
            return;
        }
        if (shouldAutoScroll.current) scrollToBottom(true);
    }, [conversation]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const handleInputFocus = () => {
        if (scrollContainerRef.current) scrollContainerRef.current.style.overflowY = 'hidden';
    };

    const handleInputBlur = () => {
        if (scrollContainerRef.current) scrollContainerRef.current.style.overflowY = 'auto';
    };

    return (
        <div className="w-full bg-[#F0EDE6]" style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E8E4DC]" style={{ flexShrink: 0 }}>
                <button onClick={onBack} className="text-xl text-[#C4785A] hover:text-[#E05C3A] transition">←</button>
                <div className="flex items-center gap-3 w-full">

                    {/* Avatar — matches DM list: from-orange-300 to-orange-400 with white ring and online dot */}
                    <div className="relative shrink-0">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{
                                background: 'linear-gradient(135deg, #fdba74, #fb923c)',
                                boxShadow: '0 0 0 2px white',
                            }}
                        >
                            {conversationName?.[0]?.toUpperCase() || '?'}
                        </div>
                        {!isGroup && (
                            <span className="absolute bottom-0 right-0" style={{ transform: 'scale(0.85)', transformOrigin: 'bottom right' }}>
                                <OnlineDot isOnline={isOnline} />
                            </span>
                        )}
                    </div>

                    <h2 className="text-base font-semibold text-gray-900">{conversationName}</h2>
                    <div className="flex-1 flex justify-end pr-5 gap-4">
                        {isGroup ? (
                            <motion.button
                                className="bg-transparent border-none"
                                whileTap={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                onClick={onAddMember}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <line x1="19" y1="8" x2="19" y2="14"/>
                                    <line x1="22" y1="11" x2="16" y2="11"/>
                                </svg>
                            </motion.button>
                        ) : (
                            <>
                                <motion.button
                                    className="bg-transparent border-none"
                                    whileTap={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    onClick={() => startCall(recipientId, false)}
                                >
                                    <i className="bi bi-telephone text-xl text-orange-600"></i>
                                </motion.button>
                                <motion.button
                                    className="bg-transparent border-none"
                                    whileTap={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    onClick={() => startCall(recipientId, true)}
                                >
                                    <i className="bi bi-camera-video text-2xl text-orange-600"></i>
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Scrollable message list */}
            <div
                ref={scrollContainerRef}
                className="flex flex-col gap-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 16px', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflowAnchor: 'none' }}
            >
                {conversationLoading ? (
                    <div className="flex flex-1 items-center justify-center py-8">
                        <OrangeSpinner label="Loading messages…" />
                    </div>
                ) : conversation.length === 0 ? (
                    <p className="text-[#B0A99F] text-center mt-4 text-sm">No messages yet</p>
                ) : (
                    conversation.map((message, index) => (
                        <DMPageRenderer
                            key={index}
                            message={message}
                            userId={userId}
                            senderName={dmNames[selectedKey]}
                            senderNamesMap={senderNamesMap}
                        />
                    ))
                )}
            </div>

            {/* Message input bar */}
            <div className="flex items-center gap-2 px-6 py-5 pb-8 bg-white border-t border-[#E8E4DC]" style={{ flexShrink: 0 }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Message..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-[#F0EDE6] border-none outline-none text-sm text-gray-900 placeholder-[#B0A99F]"
                />
                <button
                    onClick={handleSend}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-white active:scale-95 transition shrink-0 bg-gradient-to-br from-orange-400 to-orange-600"
                >
                    ↑
                </button>
            </div>
        </div>
    );
}