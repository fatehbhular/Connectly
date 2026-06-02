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
  const startX = useRef(null);
  const dragXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const cooldownRef = useRef(false);
  const [isOnline, setIsOnline] = useState(false);

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

  function onMouseDown(e) {
    if (e.button !== 0) return;
    e.stopPropagation();
    startX.current = e.clientX;
    dragXRef.current = 0;
    setIsDragging(true);
  }

  function onTouchStart(e) {
    e.stopPropagation();
    startX.current = e.touches[0].clientX;
    dragXRef.current = 0;
    setIsDragging(true);
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (!isDragging || startX.current === null) return;
      var delta = e.clientX - startX.current;
      dragXRef.current = delta;
      setDragX(delta);
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
      if (dragXRef.current > 150) SwipeRight?.();
      else if (dragXRef.current < -150) SwipeLeft?.();
      dragXRef.current = 0;
      setDragX(0);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    function onKeyPressed(e) {
      if (e.repeat) return;
      if (cooldownRef.current) return;
      if (e.key === 'ArrowRight') { setDragX(50); SwipeRight?.(); }
      else if (e.key === 'ArrowLeft') { setDragX(-50); SwipeLeft?.(); }
      cooldownRef.current = true;
      setTimeout(() => { cooldownRef.current = false; setDragX(0); }, 200);
    }
    document.addEventListener('keydown', onKeyPressed);
    return () => document.removeEventListener('keydown', onKeyPressed);
  }, [SwipeLeft, SwipeRight]);

  const distance = calcDistance(currentUser?.latitude, currentUser?.longitude, latitude, longitude);

  const bgColor = dragX > 50
    ? `rgba(0, 180, 100, ${Math.min(dragX / 150, 0.08)})`
    : dragX < -50
      ? `rgba(220, 50, 50, ${Math.min(-dragX / 150, 0.08)})`
      : 'white';

  const boxShadow = dragX > 50
    ? `0 0 0 2px rgba(0,180,100,${Math.min(dragX / 150, 0.5)})`
    : dragX < -50
      ? `0 0 0 2px rgba(220,50,50,${Math.min(-dragX / 150, 0.5)})`
      : '0 1px 4px rgba(0,0,0,0.06)';

  return (
    <div
      className="w-80 rounded-2xl bg-white border border-[#E8E4DC] px-8 py-10 select-none min-h-[520px]"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        transform: `translateX(${dragX}px) rotate(${dragX * 0.005}deg)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 1 - Math.abs(dragX) / 300 : 1,
        backgroundColor: bgColor,
        boxShadow,
        // Lighter, softer orange outline for wants to connect
        outline: (hasPendingRequest || wantsToConnect) ? '2px solid rgba(251,146,60,0.3)' : 'none',
        outlineOffset: '-1px',
      }}
    >
      {/* Avatar + online dot — white ring matches DM list style */}
      <div className="relative w-14 h-14 mb-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white"
          style={{
            background: 'linear-gradient(135deg, #fdba74, #fb923c)',      // matches DM list: from-orange-300 to-orange-400
            boxShadow: '0 0 0 2px white',                                 // white ring border matching DM list aesthetic
          }}
        >
          {user?.[0]?.toUpperCase() || '?'}
        </div>
        {/* Online dot — same absolute position as DM list */}
        <span className="absolute bottom-0 right-0" style={{ transform: 'scale(1.4)', transformOrigin: 'bottom right' }}>
          <OnlineDot isOnline={isOnline} />
        </span>
      </div>

      {/* Name */}
      <h2 className="text-gray-900 font-bold text-xl leading-tight">{user}</h2>

      {/* Industry */}
      <p className="text-[#C4785A] text-sm font-semibold tracking-wide mt-0.5">{industry}</p>

      {/* Location + distance */}
      {distance && (
        <p className="text-[#B0A99F] text-xs mt-1.5">
          {location} · {distance} km away
        </p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap mt-3">
        {wantsToConnect && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-[#fb923c]">
            ✦ Wants to connect
          </span>
        )}
        {verified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]">
            ✓ Verified
          </span>
        )}
        {mutuals > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] border border-[#BFDBFE] text-[#3B82F6]">
            {mutuals} mutual{mutuals !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#E8E4DC] my-4" />

      {/* Bio */}
      {bio && (
        <p className="text-gray-700 text-sm leading-relaxed">{bio}</p>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {skills.map((skill, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full bg-[#F0EDE6] border border-[#E8E4DC] text-[#B0A99F] text-xs font-medium">
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserCardUI;