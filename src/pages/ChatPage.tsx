import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../Firebase/client';
import { Input, Button, Avatar, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import Message from '../components/Message';

const { Text } = Typography;

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
  senderName: string;
  senderAvatar?: string;
}

const ChatPage = () => {
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchConversation = async () => {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      
      if (conversationSnap.exists()) {
        setConversation(conversationSnap.data());
      } else {
        message.error("Conversation not found");
        window.location.href = '/home';
      }
    };

    fetchConversation();

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId, user]);

 const handleSendMessage = async () => {
  if (!newMessage.trim() || !user || !conversationId) return;

  setLoading(true);
  try {
    const messageData = {
      text: newMessage,
      senderId: user.uid,
      senderName: user.displayName || user.email || 'Anonymous',
      senderAvatar: user.photoURL || null,
      createdAt: new Date(),
      type: 'text'
    };

    await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);
    
    await setDoc(doc(db, 'conversations', conversationId), {
      lastUpdated: new Date(),
      lastMessage: {
        text: newMessage,
        senderId: user.uid,
        senderName: messageData.senderName,
        createdAt: new Date()
      }
    }, { merge: true });
    
    setNewMessage('');
  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof Error) {
      message.error(error.message || "Failed to send message");
    } else {
      message.error("Failed to send message");
    }
  } finally {
    setLoading(false);
  }
};

  const otherParticipant = conversation?.participantsData?.find(
    (p: any) => p.uid !== user?.uid
  );

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <Avatar src={otherParticipant?.photoURL} size="large">
          {otherParticipant?.displayName?.charAt(0)}
        </Avatar>
        <Text strong className="ml-3 text-lg">
          {otherParticipant?.displayName}
        </Text>
      </div>
      
     <Message messages={messages} user={user} />
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={handleSendMessage}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={loading}
            className="ml-2"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;