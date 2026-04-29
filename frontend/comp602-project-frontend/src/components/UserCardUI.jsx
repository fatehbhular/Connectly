import { useState, useRef, useEffect } from 'react';
import './UserCardUI.css'
import picture from './fatehthecutie.jpg';

function UserCardUI({ user, industry, bio, SwipeLeft, SwipeRight}) {
  const startX = useRef(null); //This is used to determine the pointer starting position
  const dragXRef =  useRef(0); //This is used to determine the pointer position
  const [isDragging, setIsDragging] = useState(false); //This is a boolean value to determine if the mouse is dragging or not
  const [dragX, setDragX] = useState(0); //This is used to find out the distance travelled on the pointer

  //This function is used to check of the left mouse button is clicked down
  function onMouseDown(e){
    if(e.button !== 0){ //if left mouse button is not clicked
      return;
    }
    startX.current = e.clientX;
    setIsDragging(true);
  }

  //Use effect to constanly check if isDragging changed
  useEffect(() => {
    //This function is used to check and set the drag value 
    function onMouseMove(e){
      if(isDragging == false){
        return;
      }
      var delta = e.clientX - startX.current;
      dragXRef.current = delta;
      setDragX(delta);
    }

    //This function checks if the mouse left click is release and check how much distance is travelled and react acordingly
    function onMouseUp(){
      setIsDragging(false);
      startX.current = null;
      if(dragXRef.current >150){ //Move Right so liked profile
        SwipeRight?.();
      }
      else if(dragXRef.current < -150){ //Move Left so next profile
        SwipeLeft?.();
      }
      dragXRef.current = 0;
      setDragX(0);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    //Remove the EventListerners once this useEffect is complete
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

  }, [isDragging]);

  return (
    <div className="card" onMouseDown={onMouseDown} style={{
      transform: `translateX(${dragX}px) rotate(${dragX * 0.005}deg)`,
      transition: isDragging ? 'none' : 'transform 0.2s ease',
      cursor: isDragging ? 'grabbing' : 'grab',
      opacity: isDragging ? 1 - Math.abs(dragX) / 300 : 1,
    }}>
      <h1>{user}</h1>
      <h3>{industry}</h3>
      <img src={picture} alt="Picture"></img>
      <div className="cardBio">
        <p>Read Description</p>
        <h4>{bio}</h4>
      <div></div>
      </div>
    </div>
  );
}

export default UserCardUI;