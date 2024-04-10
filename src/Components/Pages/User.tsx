// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  useSubscription,
  useStompClient
} from "react-stomp-hooks";
import '../../App.css';

interface Message {
  id: number;
  username: string;
  text: string;
}

function User() {
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>("utilisateur");
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const discussions = ['Discussion 1', 'Discussion 2', 'Discussion 3'];

  const stompClient = useStompClient();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {

  }, [])
  
  const handleDiscussionSelection = (discussion: string) => {
    setSelectedDiscussion(discussion);
  };

  const handleMessageSend = () => {
    if (newMessage.trim() === '') return;
    const newMessageObj: Message = {
      id: messages.length + 1,
      username: username,
      text: newMessage,
    };

    if(stompClient) {
      stompClient.publish({destination: '/send/assist', body: JSON.stringify(newMessageObj)})
    }
    
    setMessages([...messages, newMessageObj]);
    setNewMessage('');
  };

  function SubscribingComponent() {
    const [lastMessage, setLastMessage] = useState("No message received yet");
  
    //Subscribe to /topic/test, and use handler for all received messages
    //Note that all subscriptions made through the library are automatically removed when their owning component gets unmounted.
    //If the STOMP connection itself is lost they are however restored on reconnect.
    //You can also supply an array as the first parameter, which will subscribe to all destinations in the array
    useSubscription("/listen/reply-" + username, (message) => setLastMessage(message.body));
  
    return (
      <div>Last Message: {lastMessage}</div>
    );
  }

  return (
    
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
  
      <SubscribingComponent />
    
      <div style={{ width: '30%', backgroundColor: '#f0f0f0', padding: '20px' }}>
        <h2>Discussions</h2>
        <ul>
          {discussions.map((discussion, index) => (
            <li key={index} onClick={() => handleDiscussionSelection(discussion)} style={{ cursor: 'pointer' }}>
              {discussion}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ padding: '20px' }}>{selectedDiscussion ? selectedDiscussion : 'Sélectionnez une discussion'}</h2>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.map((message) => (
            <div key={message.id} style={{ backgroundColor: '#e0e0e0', marginBottom: '10px', padding: '10px' }}>
              {message.text}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
          <input
            type="text"
            placeholder="Entrez votre message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flex: 1, marginRight: '10px', padding: '10px', border: '1px solid #ccc' }}
          />
          <button
            onClick={handleMessageSend}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
    
  );
}

export default User