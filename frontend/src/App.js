import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:3001');

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Socket.io: Listening for new messages and clean up on component unmount
    const handleNewMessage = (data) => {
      // Checking if the message is from the current user or other users
  const isCurrentUserMessage = data.userId._id === userId;

  // a new message object with the appropriate CSS class
  const newMessage = {
    ...data,
    isCurrentUserMessage: isCurrentUserMessage,
  };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };
  
    socket.on('messageReceived', handleNewMessage);
  
    return () => {
      socket.off('messageReceived', handleNewMessage);
    };
  }, [userId]);

  


  // Fetch previous messages from the server
useEffect(() => {
  // Checking if the token exists before fetching messages
  if (token) {
    fetch('http://localhost:3001/api/messages', {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Authorization failed.'); // Handling unauthorized or other errors
        }
        return response.json();
      })
      .then((data) => {
        setMessages(data);
      })
      .catch((error) => {
        // Handle error (e.g., token expired, unauthorized)
        console.error('Error fetching messages:', error);

      });
  }
}, [token]);


  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert(error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      setUserId(data.userId);
      setToken(data.token);
      alert(data.message);
    } catch (error) {
      alert(error);
    }
  };

  const handleSendMessage = () => {
    if (!userId || !token) {
      return;
    }
    fetch('http://localhost:3001/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({ userId, text: message }),
    })
    setMessage('');
  };

  return (
    <div>
      <h1>Group Chat App</h1>
      {userId ? (
        // If the user is logged in, show the chat module
        <div>
          <h2>Chat</h2>
          <div className="message-wrapper">
            {messages.map((msg) => (
              <p
                key={msg._id}
                className={
                  msg.userId._id === userId
                    ? 'current-user-message'
                    : 'other-user-message'
                }
              >
                <strong>{msg.userId.username}:</strong> {msg.text}
              </p>
            ))}
          </div>
          <input style= {{minHeight:'30px',minWidth:'580px'}}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button  style= {{minHeight:'35px'}} onClick={handleSendMessage}>Send</button>
        </div>
      ) : (
        // If the user is not logged in, show the login module
        <div>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
      };

export default App;
