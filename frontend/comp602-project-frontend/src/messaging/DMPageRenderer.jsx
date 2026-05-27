import { motion } from 'framer-motion';

/**
 * Renders a single message bubble.
 * 
 * Sent messages align right, received align left.
 * Intro messages are labelled above the bubble.
 * In group chats, senderNamesMap provides per-sender names.
 */
export default function DMPageRenderer({message, userId, senderName, senderNamesMap}) {
    const isSent = message.senderId === parseInt(userId);

    const displaySenderName = !isSent
        ? (senderNamesMap?.[message.senderId] || senderName)
        : 'You';

    return (
        <motion.div
            className={`flex flex-col ${isSent ? 'self-end items-end' : 'self-start items-start'}`}
            initial={{ opacity: 0, x: isSent ? 40 : -40, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
            {/* Connection intro label */}
            {message.isIntro && (
                <span style={{ fontSize: '11px', color: '#C4785A', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', paddingLeft: '4px' }}>
                    Connection intro
                </span>
            )}

            <span className="text-xs text-gray-400 mb-1">{displaySenderName}</span>

            <motion.div
                className={`px-4 py-2 rounded-2xl text-white text-sm break-words max-w-[70vw] w-fit ${
                    isSent
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 rounded-br-sm'    // sent — original darker orange
                        : 'bg-gradient-to-br from-orange-300 to-orange-400 rounded-bl-sm'    // received — lighter pfp orange
                }`}
                style={message.isIntro ? { outline: '1px solid rgba(255,255,255,0.4)', outlineOffset: '-1px' } : {}}
                whileTap={{ scale: 0.95 }}
            >
                {message.content}
            </motion.div>
        </motion.div>
    );
}