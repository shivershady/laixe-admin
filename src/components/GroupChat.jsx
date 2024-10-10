import { useUser } from '@/hooks/UserContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaComments, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { socketService } from '../services/socketService';
let socket = null;

export default function GroupChat() {
  const { user } = useUser();
  const [groups, setGroups] = useState(user?.teacherClasses ? user?.teacherClasses.map(cls => ({ id: cls.id, name: cls.name, messages: [] })) : []);
  const [activeGroupId, setActiveGroupId] = useState('');
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
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
  }, [groups, isChatOpen, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() !== "" && socket && socket.readyState === WebSocket.OPEN) {
      const newMsg = {
        id: Date.now(),
        content: newMessage,
        userId: user.id,
        userName: user.userName,
        groupId: activeGroupId,
        sentAt: new Date().toISOString()
      };
      socket.send(JSON.stringify(newMsg));
      setNewMessage("");
    }
  }, [newMessage, activeGroupId]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(!isChatOpen);
  }, [isChatOpen]);

  const handleGroupClick = (groupId) => {
    disconnectWebSocket(); // Ngắt kết nối WebSocket hiện tại
    setActiveGroupId(groupId);
    connectWebSocket(groupId); // Kết nối WebSocket với groupId
  }

  const connectWebSocket = useCallback(async (groupId) => {
    const wsUrl = `${import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws')}ws/${groupId}`; // Thêm groupId vào URL
    socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log('WebSocket connected');
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setGroups(prevGroups => prevGroups.map(group =>
        group.id === message.ClassId
          ? { ...group, messages: [...group.messages, message] }
          : group
      ));
    };
    socket.onclose = () => console.log('WebSocket disconnected');
    socket.onerror = (error) => console.error('WebSocket error:', error);
    try {
      const response = await socketService.getHistory(groupId);
      setGroups(prevGroups => prevGroups.map(group =>
        group.id === groupId
          ? { ...group, messages: response }
          : group
      ));

    } catch (error) {
      console.error('Error fetching history:', error);
    }

  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
      socket = null;
    }
  }, []);

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
        <div className="w-[550px] h-[500px] flex flex-col bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-sm font-medium">Group Chat</h3>
            <button onClick={toggleChat} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="flex overflow-hidden flex-grow">
            <div className="overflow-y-auto w-1/3 border-r">
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => handleGroupClick(group.id)} // Sử dụng handleGroupClick
                  className={`w-full p-2 text-left ${activeGroupId === group.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                >
                  {group.name}
                </button>
              ))}
            </div>
            <div className="flex flex-col w-2/3">
              <div ref={chatContainerRef} className="overflow-y-auto flex-grow p-4">
                {groups.find(g => g.id === activeGroupId)?.messages.map((message) => (
                  <div key={message.id} className={`flex flex-col ${message.userName === user.userName ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-2 ${message.userName === user.userName ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                      <p className="text-sm font-semibold">{message.userName}</p>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="mt-1 text-xs text-gray-500">{new Date(message.sentAt).toLocaleString()}</span>
                  </div>
                ))}
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
          </div>
        </div>
      )}
    </div>
  );
}