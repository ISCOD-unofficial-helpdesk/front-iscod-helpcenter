// App.tsx
import React, { useEffect, useState } from 'react';
import {
  useSubscription,
  useStompClient
} from "react-stomp-hooks";
import '../../App.css';
import './Discussions.css';

interface Message {
  username: string;
  is_support: boolean;
  text: string;
  timestamp: number;
}

interface MessageDTO{
  username: string;
  text: string;
}

interface Discussion {
  username: string;
  messages: Message[];
}

function Assist() {
  const [newMessage, setNewMessage] = useState('');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | undefined>(undefined);

  const stompClient = useStompClient();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:8080/history');
        const data = await response.json(); // assuming the response body is the JSON object shown
        
        const fetchedDiscussions = Object.entries(data).map(([username, messages]) => ({
          username,
          messages: messages.map(message => ({
            ...message,
            is_support: message.isSupport,
            text: message.content,
            timestamp: new Date(message.createAt).getTime(),
            // Assuming `id` is not required here as it's not present in your initial structure
          }))
        }));
  
        setDiscussions(fetchedDiscussions);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
  
    fetchHistory();
  }, []); // Empty dependency array to run only once on mount
  

  const Subscribe = () => {
    useSubscription("/listen/assist", (data) => handleNewMessage(data.body));
    return null;
  }

  const handleNewMessage = (data: string) => {
    const incomingMessagesArray: any[] = JSON.parse(data);
    console.log(incomingMessagesArray);
    if (incomingMessagesArray.length === 0) return;
  
    const updatedMessages: Message[] = incomingMessagesArray.map((msg: any) => ({
      id: msg.id,
      timestamp: new Date(msg.createAt).getTime(),
      username: msg.username,
      text: msg.content,
      is_support: msg.support,
    }));
  
    const username = incomingMessagesArray[0].username;
  
    setDiscussions(prevDiscussions => {
      // Remove the updated user's discussion from the list
      const filteredDiscussions = prevDiscussions.filter(d => d.username !== username);
      // Create or update the discussion for the user
      const updatedDiscussion = { username, messages: updatedMessages };
      // Add the updated discussion to the top of the list
      return [updatedDiscussion, ...filteredDiscussions];
    });
  };
    
  

  const handleDiscussionSelection = (username: string) => {
    setSelectedDiscussion(username);
  };

  const handleMessageSend = () => {
    if (newMessage.trim() === '' || selectedDiscussion === undefined) return;
  
    const messageDTO: MessageDTO = {
      username: selectedDiscussion,
      text: newMessage,
    };
  
    if (stompClient) {
      stompClient.publish({
        destination: `/send/user-message-${selectedDiscussion}`,
        body: messageDTO.text, 
      });
    }
  
    setNewMessage('');
  };

  return (
    
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Subscribe/>
      <div className="discussionsContainer">
        <h2>Discussions</h2>
        <ul className="discussionList">
          {discussions.map((discussion, index) => (
            <li key={index} 
                onClick={() => handleDiscussionSelection(discussion.username)} 
                className="discussionItem">
              {discussion.username} ({discussion.messages.length})
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ padding: '20px' }}>{selectedDiscussion ? selectedDiscussion : 'Sélectionnez une discussion'}</h2>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {selectedDiscussion && discussions.find(d => d.username === selectedDiscussion)?.messages
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((message, index) => (
              <div key={index} style={{ 
                    backgroundColor: !message.is_support ? '#e0e0e0' : 'lightblue', 
                    textAlign: !message.is_support ? 'left' : 'right',
                    marginBottom: '10px', 
                    padding: '10px',
                    margin: message.is_support ? '10px 0px 10px 30px' : '10px 30px 10px 0px',
                  }}>
                {message.text}
              </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
          <input
            type="text"
            placeholder= {selectedDiscussion === undefined ? "Sélectionnez une discussion" : "Entrez votre message" }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flex: 1, marginRight: '10px', padding: '10px', border: '1px solid #ccc' }}
          />
          {selectedDiscussion !== undefined ?
              <button
              onClick={handleMessageSend}
              style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer'}}
            > Envoyer
              </button>
              :
              <div></div>
          }          
        </div>
      </div>
    </div>
    
  );
}

export default Assist
