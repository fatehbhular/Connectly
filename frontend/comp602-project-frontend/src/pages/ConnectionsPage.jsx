import { useState, useEffect } from 'react';
import UserCardUI from "../components/UserCardUI";
import './ConnectionsPage.css'

export default function ConnectionsPage() {

  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8080/api/connections/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setCurrentIndex(0);
      });
  }, []);

  const currentUser = users[currentIndex];

  function SwipeLeft(){
    if(currentIndex <= 0){
      return;
    }
    setCurrentIndex(currentIndex - 1);
  }

  function SwipeRight(){
    if(currentIndex >= users.length - 1){
      return;
    }
    setCurrentIndex(currentIndex + 1);
  }

  return (
    <div>
      <h1>Connect</h1>
      <p>Find and connect with others</p>

      <div className="CardContainer">
        {currentUser ? (
          <UserCardUI
            user={currentUser.displayName} 
            industry={currentUser.industry}
            SwipeLeft={SwipeLeft}
            SwipeRight={SwipeRight}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>

    </div>
  );
}