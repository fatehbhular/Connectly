import { useState, useRef, useEffect } from 'react';
import OnlineDot from '../components/OnlineStatusDot.jsx';
import BASE_URL from '../config.js';

// Haversine formula - calculates the distance in km between two GPS coordinates
// Returns null if either coordinate is missing
function calcDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;                                             // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(0);
}

function UserCardUI({ user, userId, industry, bio, skills, latitude, longitude, location, currentUser, wantsToConnect, mutuals, verified, hasPendingRequest, SwipeLeft, SwipeRight }) {
  const startX = useRef(null);       // stores where the mouse was when the drag started
  const dragXRef = useRef(0);        // stores how far the mouse has moved - useRef so it doesn't cause re-renders
  const [isDragging, setIsDragging] = useState(false);  // true while the mouse is held down
  const [dragX, setDragX] = useState(0);                // how far the card has been dragged - useState so the card visually moves
  const cooldownRef = useRef(false); // prevents arrow keys from firing too fast
  const [isOnline, setIsOnline] = useState(false);      // fetch presence for this card's user

  useEffect(() => {
    if (!userId) return;
    const fetchPresence = async () => {
      try {
        const res = await fetch(`${BASE_URL}/presence/${userId}`);
        const online = await res.json();
        setIsOnline(online);
      } catch {
        setIsOnline(false);
      }
    };
    fetchPresence();
  }, [userId]);

  // Fires when the left mouse button is pressed down on the card
  function onMouseDown(e) {
    if (e.button !== 0) return;      // only respond to left click
    e.stopPropagation();
    startX.current = e.clientX;      // record where the drag started
    dragXRef.current = 0;
    setIsDragging(true);
  }

  // Fires when the user touches the card on mobile
  function onTouchStart(e) {
    e.stopPropagation();             // prevent nav bar from receiving the touch
    startX.current = e.touches[0].clientX;
    dragXRef.current = 0;
    setIsDragging(true);
  }

  // This useEffect adds and removes mouse listeners while dragging
  // It re-runs whenever isDragging changes
  useEffect(() => {
    function onMouseMove(e) {
      if (!isDragging || startX.current === null) return;
      var delta = e.clientX - startX.current;  // how far we've moved from the start
      dragXRef.current = delta;                // store in ref for use in onMouseUp
      setDragX(delta);                         // store in state to visually move the card
    }

    function onTouchMove(e) {
      if (!isDragging || startX.current === null) return;
      var delta = e.touches[0].clientX - startX.current;
      dragXRef.current = delta;
      setDragX(delta);
    }

    function onMouseUp() {
      if (!isDragging) return;
      setIsDragging(false);
      startX.current = null;
      if (dragXRef.current > 150) SwipeRight?.();        // dragged far enough right - connect
      else if (dragXRef.current < -150) SwipeLeft?.();   // dragged far enough left - pass
      dragXRef.current = 0;
      setDragX(0);                             // snap card back to center
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onMouseUp);

    // cleanup - remove listeners when this effect re-runs or component unmounts
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  // This useEffect adds keyboard support - left/right arrow keys trigger swipes
  // Re-runs whenever SwipeLeft or SwipeRight changes
  useEffect(() => {
    function onKeyPressed(e) {
      if (e.repeat) return;              // ignore held-down keys
      if (cooldownRef.current) return;   // ignore if still in cooldown
      if (e.key === 'ArrowRight') {
        setDragX(50);
        SwipeRight?.();
      }
      else if (e.key === 'ArrowLeft'){
        setDragX(-50);
        SwipeLeft?.();
      }
      cooldownRef.current = true;
      setTimeout(() => { cooldownRef.current = false; setDragX(0)}, 200);  // 200ms cooldown between key presses
    }
    document.addEventListener('keydown', onKeyPressed);
    return () => document.removeEventListener('keydown', onKeyPressed);
  }, [SwipeLeft, SwipeRight]);

  // Calculate distance between the signed in user and the card's user
  const distance = calcDistance(currentUser?.latitude, currentUser?.longitude, latitude, longitude);

  // Card border glows green when dragging right, red when dragging left
  // Card background tints subtly - Math.min clamps opacity so it never goes above 0.08
  const bgColor = dragX > 50
    ? `rgba(0, 180, 100, ${Math.min(dragX / 150, 0.08)})`
    : dragX < -50
      ? `rgba(220, 50, 50, ${Math.min(-dragX / 150, 0.08)})`
      : 'white';

  // Ring outline intensifies as the drag distance increases, capped at 0.5 opacity
  const boxShadow = dragX > 50
    ? `0 0 0 2px rgba(0,180,100,${Math.min(dragX / 150, 0.5)})`
    : dragX < -50
      ? `0 0 0 2px rgba(220,50,50,${Math.min(-dragX / 150, 0.5)})`
      : '0 1px 4px rgba(0,0,0,0.06)';

  return (
    <div
      className="w-80 rounded-2xl bg-white border border-[#E8E4DC] px-8 py-16 select-none min-h-[520px]"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        transform: `translateX(${dragX}px) rotate(${dragX * 0.005}deg)`,  // moves and slightly rotates the card as you drag
        transition: isDragging ? 'none' : 'transform 0.2s ease',           // smooth snap back when released, no transition while dragging
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 1 - Math.abs(dragX) / 300 : 1,              // card fades slightly as you drag further
        backgroundColor: bgColor,
        boxShadow,
        outline: (hasPendingRequest || wantsToConnect) ? '2px solid #f97040' : 'none', // orange border for users who want to connect
        outlineOffset: '-1px',
      }}
    >
      {/* Badges row - wants to connect, verified, and mutuals all sit inline */}
      <div className="flex items-center gap-2 flex-wrap mb-4">

        {/* Wants to connect badge */}
        {wantsToConnect && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF3EE] border border-[#F0CBB8] text-[#C4785A] text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4785A] inline-block" />
            Wants to connect
          </div>
        )}

        {/* Verified badge - placeholder until the feature is built */}
        {verified && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />
            Verified
          </div>
        )}

        {/* Mutuals badge - same style as wants to connect but blue */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#3B82F6] text-xs font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] inline-block" />
          {mutuals} mutual{mutuals !== 1 ? 's' : ''}
        </div>

      </div>

      {/* Avatar - initials circle matching the DM list style */}
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm text-white bg-gradient-to-br from-orange-300 to-orange-400">
          {user?.[0]?.toUpperCase() || '?'}
        </div>
        {/* Online dot pinned to bottom-right */}
        <span className="absolute bottom-0 right-0">
          <OnlineDot isOnline={isOnline} />
        </span>
      </div>

      {/* Name + industry */}
      <h2 className="text-gray-900 font-bold text-xl leading-tight">{user}</h2>
      <p className="text-[#C4785A] text-sm font-semibold tracking-wide mt-0.5">{industry}</p>

      {/* Location + distance - only shown if distance can be calculated */}
      {distance && (
        <p className="text-[#B0A99F] text-xs mt-2">
          {location} · {distance} km away
        </p>
      )}

      {/* Divider */}
      <div className="border-t border-[#E8E4DC] my-4" />

      {/* Bio */}
      {bio && (
        <p className="text-gray-700 text-sm leading-relaxed">{bio}</p>
      )}

      {/* Skills - only shown if user has skills */}
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {skills.map((skill, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full bg-[#F0EDE6] border border-[#E8E4DC] text-[#B0A99F] text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserCardUI;