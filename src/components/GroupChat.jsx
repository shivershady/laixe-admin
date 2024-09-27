import { useCallback, useEffect, useRef, useState } from 'react';
import { FaComments, FaPaperPlane, FaTimes } from 'react-icons/fa';

import { useUser } from '@/hooks/UserContext';
import { socketService } from '@/services/socketService';

let socket;

export default function GroupChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useUser();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() !== "" && socket && socket.readyState === WebSocket.OPEN) {
      const newMsg = {
        content: newMessage,
        userId: user.id,
        userName: user.userName,
      };
      socket.send(JSON.stringify(newMsg));
      // setMessages(prevMessages => [...prevMessages, newMsg]);
      setNewMessage("");
    }
  }, [newMessage, user.id, user.userName]);

  const toggleChat = useCallback(async () => {
    if (!isChatOpen) {
      try {
        const response = await socketService.getHistory();
        setMessages(response);
        connectWebSocket();
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    } else {
      disconnectWebSocket();
    }
    setIsChatOpen(!isChatOpen);
  }, [isChatOpen]);

  const connectWebSocket = useCallback(() => {
    const wsUrl = `${import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws')}ws`;
    socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log('WebSocket connected');
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, message]);
    };
    socket.onclose = () => console.log('WebSocket disconnected');
    socket.onerror = (error) => console.error('WebSocket error:', error);
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (socket) {
      socket.close();
      socket = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return (
    <div className="fixed bottom-4 right-4 z-[99999]">
      {!isChatOpen ? (
        <button
          onClick={toggleChat}
          className="p-3 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaComments className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-[350px] h-[500px] flex flex-col bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-sm font-medium text-black">Group Chat</h3>
            <button onClick={toggleChat} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="overflow-hidden flex-grow">
            <div ref={chatContainerRef} className="overflow-y-auto p-4 h-full">
              <div className="flex flex-col space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex flex-col ${message.userName === user.userName ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-2 ${message.userName === user.userName ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                      <p className="text-sm font-semibold">{message.userName}</p>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="mt-1 text-xs text-gray-500">{new Date(message.sentAt).toLocaleString()}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-grow px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaPaperPlane className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}