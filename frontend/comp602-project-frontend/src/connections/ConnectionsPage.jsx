import { useState, useEffect } from 'react';
import UserCardUI from "./UserCardUI";

export default function ConnectionsPage({currentUser}) {

  const [users, setUsers] = useState([]);                     // list of ranked users fetched from Spring Boot
  const [currentIndex, setCurrentIndex] = useState(0);        // which user in the list we are currently 


  // Runs once when the page loads; fetches the ranked user queue from Spring Boot (calls matching algorithm get queue)

  useEffect(() => {
    fetch('http://localhost:8080/api/connections/users', {
        headers: { 'userId': currentUser.userId }
      })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setCurrentIndex(0);
      });
  }, [currentUser]);

  const currentUserCard = users[currentIndex];                // Current displayed user

  // Check if the user has already requested the signed in user.
  const wantsToConnect = currentUserCard?.requestedUsers?.includes(currentUser.userId);

  function SwipeLeft() {
    if (currentIndex >= users.length - 1) return;
    setCurrentIndex(currentIndex + 1);

    // maybe add user to list to "blacklist" them
  }

  function SwipeRight() {
    if (currentIndex >= users.length - 1) return;

    fetch('http://localhost:8080/api/connections/connectUser', {
        method: 'POST',
        headers: {
            'signedInUserId': currentUser.userId,
            'requestedUserId': currentUserCard.userId
        }
    });
    setCurrentIndex(currentIndex + 1);
  }

  return (
    <div>
      <h1>Connect</h1>
      <p>Find and connect with others</p>

      <div className="CardContainer">
        {currentUserCard ? (                                  // Render card if there is a user
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
            SwipeLeft={SwipeLeft}                             // Pass the swiping for the css later on
            SwipeRight={SwipeRight}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>

    </div>
  );
}