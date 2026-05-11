import BASE_URL from '../config.js';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserCardUI from "./UserCardUI";

export default function ConnectionsPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(`${BASE_URL}/api/connections/users`, {
      headers: { 'userId': currentUser.userId }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setCurrentIndex(0);
      });
  }, [currentUser]);

  const currentUserCard = users[currentIndex];
  const wantsToConnect = currentUserCard?.requestedUsers?.includes(currentUser.userId);

  function SwipeLeft() {
    if (currentIndex >= users.length - 1) return;
    setCurrentIndex(currentIndex + 1);
  }

  function SwipeRight() {
    if (currentIndex >= users.length - 1) return;
    fetch(`${BASE_URL}/api/connections/connectUser`, {
      method: 'POST',
      headers: {
        'signedInUserId': currentUser.userId,
        'requestedUserId': currentUserCard.userId
      }
    });
    setCurrentIndex(currentIndex + 1);
  }

  return (
    <div className="flex flex-col w-full h-dvh bg-[#F0EDE6]">

      {/* Header — fades down on mount */}
      <motion.div
        className="flex items-baseline gap-2 px-6 pt-14 pb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Connect</h1>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-1">
          discover people
        </p>
      </motion.div>

      {/* Card area */}
      <div className="flex flex-col flex-1 items-center justify-start px-6 pt-10 gap-6">
        <AnimatePresence mode="wait">
          {currentUserCard ? (
            // key changes with each new card so AnimatePresence re-animates it
            <motion.div
              key={currentUserCard.userId}
              className="flex flex-col items-center gap-6 w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <UserCardUI
                user={currentUserCard.displayName}
                industry={currentUserCard.industry}
                bio={currentUserCard.bio}
                skills={currentUserCard.skills}
                latitude={currentUserCard.latitude}
                longitude={currentUserCard.longitude}
                location={currentUserCard.location}
                currentUser={currentUser}
                wantsToConnect={wantsToConnect}
                SwipeLeft={SwipeLeft}
                SwipeRight={SwipeRight}
              />

              {/* Hint text */}
              <p className="text-[#B0A99F] text-xs">
                ← pass &nbsp;&nbsp;·&nbsp;&nbsp; connect →
              </p>
            </motion.div>
          ) : (
            // Empty state fades in when the queue runs out
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
              <p className="text-[#B0A99F] text-sm">No more people to show</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}