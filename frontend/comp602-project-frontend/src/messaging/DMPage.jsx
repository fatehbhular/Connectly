import { motion } from 'framer-motion';
import DMPageRenderer from './DMPageRenderer';
import { useRef, useEffect, useState } from 'react';

/**
 * Full screen conversation page.
 * 
 * Works for both regular DMs and group chats.
 * 
 * @param {object[]} conversation - array of message objects
 * @param {string} conversationName - display name of the other user or group
 * @param {number} userId - ID of the signed-in user
 * @param {object} dmNames - map of conversationKey -> displayName
 * @param {string} selectedKey - active conversation key
 * @param {Function} onSendMessage - handler for sending a message
 * @param {Function} onBack - handler for going back to DMs List
 * @param {boolean} isGroup - true if this is a group conversation
 * @param {Function} onAddMember - handler for opening the add member modal (group only)
 */
export default function DMPage({conversation, conversationName, userId, dmNames, selectedKey, onSendMessage, onBack, sendSignal, recipientId, startCall, endCall, isGroup, onAddMember, senderNamesMap}) {
    const [newMessage, setNewMessage] = useState('');
    const shouldAutoScroll = useRef(true);
    const scrollContainerRef = useRef(null);
    const hasScrolled = useRef(false);

    useEffect(() => {
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const handleScroll = () => {
            const threshold = 100;
            shouldAutoScroll.current =
                el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
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
            el.scrollTo({
                top: el.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        };

        if (!hasScrolled.current) {
            scrollToBottom(false);
            hasScrolled.current = true;
            return;
        }

        if (shouldAutoScroll.current) {
            scrollToBottom(true);
        }
    }, [conversation]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    // Disable scrolling on the message list when the input is focused
    // This prevents the input bar from being pushed down on short conversations
    const handleInputFocus = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.overflowY = 'hidden';
        }
    };

    const handleInputBlur = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.overflowY = 'auto';
        }
    };

    return (
        <div className="w-full bg-[#F0EDE6]" style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E8E4DC]" style={{ flexShrink: 0 }}>
                <button onClick={onBack} className="text-xl text-[#C4785A] hover:text-[#E05C3A] transition">←</button>
                <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 bg-gradient-to-br from-orange-400 to-orange-600">
                        {conversationName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">{conversationName}</h2>
                    <div className="flex-1 flex justify-end pr-5 gap-4">
                        {isGroup ? (
                            <button onClick={onAddMember}>Add Member</button>
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
                {conversation.length === 0 ? (
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