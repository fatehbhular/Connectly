import { motion } from 'framer-motion';

/**
 * Bottom navigation bar.
 * 
 * Displays tabs for navigating between main pages.
 * Active tab is highlighted with an orange indicator.
 * 
 * @param {Function} setPage -> handler for changing the current page
 * @param {string} currentPage -> name of the currently active page
 */

export default function NavigationBar({ setPage, currentPage }) {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E4DC] flex justify-around items-center px-2"
            style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', paddingTop: '10px' }}
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
                <i className={`bi bi-person text-2xl relative z-10 ${currentPage === 'profile' ? 'text-orange-500' : 'text-orange-400'}`}></i>
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
                <i className={`bi bi-diagram-3 text-2xl relative z-10 ${currentPage === 'connections' ? 'text-orange-500' : 'text-orange-400'}`}></i>
            </motion.button>

            {/** Messages */}
            <motion.button
                onClick={() => setPage('messages')}
                className="flex flex-col items-center px-4 py-1 rounded-xl relative bg-transparent border-none"
                whileTap={{ scale: 0.9 }}
                animate={{ scale: currentPage === 'messages' ? 1.2 : 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                {console.log(currentPage)}
                {currentPage === 'messages' && (
                    <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-orange-50 rounded-xl" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <i className={`bi bi-envelope text-2xl relative z-10 ${currentPage === 'messages' ? 'text-orange-500' : 'text-orange-400'}`}></i>
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
                <i className={`bi bi-gear text-2xl relative z-10 ${currentPage === 'settings' ? 'text-orange-500' : 'text-orange-400'}`}></i>
            </motion.button>
        </div>
    );
}