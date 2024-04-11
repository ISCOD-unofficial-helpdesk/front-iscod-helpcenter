// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  useSubscription,
  useStompClient
} from "react-stomp-hooks";
import '../../App.css';

interface Message {
  id: number;
  timestamp: number;
  username: string;
  text: string;
  is_support: boolean;
}

interface MessageDTO {
  username: string;
  text: string;
}

function User() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>("");
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const stompClient = useStompClient();

  const askUsername = () => {
    if(username)return;
    const inputUsername = window.prompt("Please enter your username:", "");
    if (inputUsername === null) {
      alert("You must enter a username to continue.");
    } else if (inputUsername.trim() === "") {
      alert("Username cannot be blank. Please enter a valid username.");
      askUsername();
    } else {
      setUsername(inputUsername.trim());
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleMessageSend = () => {
    if (newMessage.trim() === '') return;

    const newMessageObj: Message = {
      id: 0, //bullshit
      timestamp: new Date().getTime(),
      username: username,
      text: newMessage,
      is_support: false
    };

    const newMessageDTO: MessageDTO = {
      username: username,
      text: newMessage,
    };

    if(stompClient) {
      stompClient.publish({destination: '/send/assist', body: JSON.stringify(newMessageDTO)})
    }
    
    setMessages([...messages, newMessageObj]);
    setNewMessage('');
  };


  const Subscribe = () => {
    useSubscription("/listen/reply-" + username, (data) => handleNewMessage(data.body));
    return null;
  }

  const handleNewMessage = (data: string) => {
    const incomingMessages = JSON.parse(data);
    
    const mappedMessages: Message[] = incomingMessages.map((msg: any) => ({
      id: msg.id,
      timestamp: new Date(msg.create_at).getTime(),
      username: msg.username,
      text: msg.content,
      is_support: msg.support,
    }));
  
    console.log(mappedMessages)
    setMessages(mappedMessages);
  };
  

    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <Subscribe />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ padding: '15px', margin: '5px', borderRadius: '5px', backgroundColor:'lightcyan' }}>Bienvenue sur le Helpdesk {username} !</h2>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {messages.sort((a, b) => a.timestamp - b.timestamp).map((message) => (
              <div key={message.timestamp} style={{ backgroundColor: message.is_support ? '#e0e0e0' : 'lightblue', 
                                                    textAlign: message.is_support ? 'left' : 'right',
                                                    marginBottom: '10px', 
                                                    padding:'10px',
                                                    margin: message.is_support ? '10px 30px 10px 0px': '10px 0px 10px 30px',
                                                  }}>
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
              onClick={(e) => askUsername()}
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
