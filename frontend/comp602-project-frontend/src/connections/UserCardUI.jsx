import { useState, useRef, useEffect } from 'react';
import './UserCardUI.css'

// Haversine formula — calculates the distance in km between two GPS coordinates
// Returns null if either coordinate is missing
function calcDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;                                             // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(0);
}

function UserCardUI({ user, industry, bio, skills, latitude, longitude, location, currentUser, wantsToConnect, SwipeLeft, SwipeRight }) {
  const startX = useRef(null);       // stores where the mouse was when the drag started
  const dragXRef = useRef(0);        // stores how far the mouse has moved — useRef so it doesn't cause re-renders
  const [isDragging, setIsDragging] = useState(false);  // true while the mouse is held down
  const [dragX, setDragX] = useState(0);                // how far the card has been dragged — useState so the card visually moves
  const cooldownRef = useRef(false); // prevents arrow keys from firing too fast

  // Fires when the left mouse button is pressed down on the card
  function onMouseDown(e) {
    if (e.button !== 0) return;      // only respond to left click
    startX.current = e.clientX;      // record where the drag started
    setIsDragging(true);
  }

  // This useEffect adds and removes mouse listeners while dragging
  // It re-runs whenever isDragging changes
  useEffect(() => {
    function onMouseMove(e) {
      if (!isDragging) return;
      var delta = e.clientX - startX.current;  // how far we've moved from the start
      dragXRef.current = delta;                // store in ref for use in onMouseUp
      setDragX(delta);                         // store in state to visually move the card
    }
    function onMouseUp() {
      setIsDragging(false);
      startX.current = null;
      if (dragXRef.current > 150) SwipeRight?.();        // dragged far enough right → connect
      else if (dragXRef.current < -150) SwipeLeft?.();   // dragged far enough left → pass
      dragXRef.current = 0;
      setDragX(0);                             // snap card back to center
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    // cleanup — remove listeners when this effect re-runs or component unmounts
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // This useEffect adds keyboard support — left/right arrow keys trigger swipes
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

  // Card background gradually turns green when dragging right, red when dragging left
  // Math.min clamps the opacity so it never goes above 0.6
  const bgColor = dragX > 50  ? `rgba(0, 200, 100, ${Math.min(dragX / 150, 0.6)})`
                : dragX < -50 ? `rgba(220, 50, 50, ${Math.min(-dragX / 150, 0.6)})`
                : 'white';

  return (
    <div className="card" onMouseDown={onMouseDown} style={{
      transform: `translateX(${dragX}px) rotate(${dragX * 0.005}deg)`,  // moves and slightly rotates the card as you drag
      transition: isDragging ? 'none' : 'transform 0.2s ease',           // smooth snap back when released, no transition while dragging
      cursor: isDragging ? 'grabbing' : 'grab',
      opacity: isDragging ? 1 - Math.abs(dragX) / 300 : 1,              // card fades slightly as you drag further
      backgroundColor: bgColor,
    }}>
      {wantsToConnect && (
          <div className="wants-to-connect-badge">
              Wants to connect
          </div>
      )}
      <h1>{user}</h1>
      <h3>{industry}</h3>
      {distance && <p>{location} ({distance} km away)</p>}
      <div className="cardBio">
        <h4>{bio}</h4>
        {skills && skills.length > 0 && <p>Skills: {skills.join(', ')}</p>}  {/* only shown if user has skills */}
      </div>
    </div>
  );
}

export default UserCardUI;