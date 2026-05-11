import { motion } from 'framer-motion';

/**
 * Renders a single message bubble.
 * 
 * Display's differently based on whether the message was 'sent' or 'received'.
 * - Send: aligned to the right side, shows user's name
 * - Receive: aligned to the left side, shows receipient's name
 * 
 * @param {object} message - message object containing senderId and content
 * @param {number} userId - ID of the signed-in user
 * @param {string} senderName - display name of the receipient
 */
export default function DMPageRenderer({message, userId, senderName}) {
    const isSent = message.senderId === parseInt(userId);

    return (
        <motion.div
            className={`flex flex-col ${isSent ? 'self-end items-end' : 'self-start items-start'}`}
            initial={{ opacity: 0, x: isSent ? 40 : -40, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
            <span className="text-xs text-gray-400 mb-1">{isSent ? 'You' : senderName}</span>
            <motion.div
                className={`px-4 py-2 rounded-2xl text-white text-sm break-words max-w-[70vw] w-fit ${
                    isSent 
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 rounded-br-sm' 
                    : 'bg-gradient-to-br from-orange-400 to-orange-500 rounded-bl-sm'
                }`}
                whileTap={{ scale: 0.95 }}
            >
                {message.content}
            </motion.div>
        </motion.div>
    );
}