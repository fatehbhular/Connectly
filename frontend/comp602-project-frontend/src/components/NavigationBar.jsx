import { motion } from 'framer-motion';

/**
 * Bottom navigation bar.
 *
 * Displays tabs for navigating between main pages.

 *
 * @param {Function} setPage -> handler for changing the current page
 * @param {string} currentPage -> name of the currently active page
 */

export default function NavigationBar({ setPage, currentPage }) {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E4DC] flex justify-around items-center px-2"
            style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))', paddingTop: '17px' }}
        >
            {/** Profile */}
            <motion.button
                onClick={() => setPage('profile')}
                className="flex flex-col items-center px-4 py-1 rounded-xl relative bg-transparent border-none"
                whileTap={{ scale: 0.9 }}
                animate={{ scale: currentPage === 'profile' ? 1.2 : 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                {currentPage === 'profile' && (
                    <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-orange-50 rounded-xl" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke={currentPage === 'profile' ? "#f97040" : "#fb923c"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="relative z-10">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
            </motion.button>

            {/** Discover */}
            <motion.button
                onClick={() => setPage('connections')}
                className="flex flex-col items-center px-4 py-1 rounded-xl relative bg-transparent border-none"
                whileTap={{ scale: 0.9 }}
                animate={{ scale: currentPage === 'connections' ? 1.2 : 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                {currentPage === 'connections' && (
                    <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-orange-50 rounded-xl" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke={currentPage === 'connections' ? "#f97040" : "#fb923c"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="relative z-10">
                    <circle cx="6" cy="12" r="2.5" />
                    <circle cx="18" cy="6" r="2.5" />
                    <circle cx="18" cy="18" r="2.5" />
                    <line x1="8.2" y1="11" x2="15.8" y2="7" />
                    <line x1="8.2" y1="13" x2="15.8" y2="17" />
                    <line x1="18" y1="8.5" x2="18" y2="15.5" />
                </svg>
            </motion.button>

            {/** Messages */}
            <motion.button
                onClick={() => setPage('messages')}
                className="flex flex-col items-center px-4 py-1 rounded-xl relative bg-transparent border-none"
                whileTap={{ scale: 0.9 }}
                animate={{ scale: currentPage === 'messages' ? 1.2 : 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                {currentPage === 'messages' && (
                    <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-orange-50 rounded-xl" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke={currentPage === 'messages' ? "#f97040" : "#fb923c"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="relative z-10">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </motion.button>

            {/** Settings */}
            <motion.button
                onClick={() => setPage('settings')}
                className="flex flex-col items-center px-4 py-1 rounded-xl relative bg-transparent border-none"
                whileTap={{ scale: 0.9 }}
                animate={{ scale: currentPage === 'settings' ? 1.2 : 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                {currentPage === 'settings' && (
                    <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-orange-50 rounded-xl" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke={currentPage === 'settings' ? "#f97040" : "#fb923c"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="relative z-10">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            </motion.button>
        </div>
    );
}