import DMPageRenderer from './DMPageRenderer';
import { useRef, useEffect, useState } from 'react';

/**
 * Full screen conversation page.
 * 
 * Shows the message history for the selected conversation and the input bar for sending new messages.
 * 
 * @param {object[]} conversation - array of message objects
 * @param {string} conversationName - display name of the other user
 * @param {number} userId - ID of the signed-in user
 * @param {object} dmNames - map of conversationKey -> displayName
 * @param {string} selectedKey - active conversation key
 * @param {Function} onSendMessage - handler for sending a message
 * @param {Function} onBack - handler for going back to DMs List
 */
export default function DMPage({conversation, conversationName, userId, dmNames, selectedKey, onSendMessage, onBack}) {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const hasScrolled = useRef(false);

    /** Scroll to the bottom when conversation is loaded */
    useEffect(() => {
        if (!hasScrolled.current && conversation.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behaviour: 'instant' });
            hasScrolled.current = true;
        }
    }, [conversation]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col w-full h-dvh bg-[#F0EDE6]" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E8E4DC]">
                <button onClick={onBack} className="text-xl text-[#C4785A] hover:text-[#E05C3A] transition">←</button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 bg-gradient-to-br from-orange-400 to-orange-600">
                        {conversationName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">{conversationName}</h2>
                </div>
            </div>

            {/* Scrollable message list */}
            <div className="flex flex-col flex-1 overflow-y-auto px-4 py-3 gap-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {conversation.length === 0 ? (
                    <p className="text-[#B0A99F] text-center mt-4 text-sm">No messages yet</p>
                ) : (
                    conversation.map((message, index) => (
                        <DMPageRenderer
                            key={index}
                            message={message}
                            userId={userId}
                            senderName={dmNames[selectedKey]}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input bar */}
            <div className="flex items-center gap-2 px-4 py-4 pb-8 bg-white border-t border-[#E8E4DC]">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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