import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/client';
import { Avatar, Badge, Input, List, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface User {
  id: string;
  username?: string;
  email: string;
  photoURL?: string;
}

const ChatList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCol = collection(db, 'users');
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as User));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
        message.error("Failed to load users");
      }
    };
    
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleUserClick = async (otherUser: User) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const conversationId = [currentUser.uid, otherUser.id]
        .sort()
        .join('_');
      
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      
      if (!conversationSnap.exists()) {
        await setDoc(conversationRef, {
          participants: [currentUser.uid, otherUser.id],
          participantsData: [
            { 
              uid: currentUser.uid, 
              displayName: currentUser.displayName || currentUser.email,
              photoURL: currentUser.photoURL || null
            },
            { 
              uid: otherUser.id, 
              displayName: otherUser.username || otherUser.email,
              photoURL: otherUser.photoURL || null
            }
          ],
          createdAt: new Date().toISOString(),
          lastMessage: null,
          lastUpdated: new Date().toISOString()
        });
      }
      
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      message.error("Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter(user => user.id !== currentUser?.uid)
    .filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.username?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aUsernameMatch = a.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const bUsernameMatch = b.username?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (aUsernameMatch && !bUsernameMatch) return -1;
      if (!aUsernameMatch && bUsernameMatch) return 1;
      
      return (a.username || a.email).localeCompare(b.username || b.email);
    });

  return (
    <div className='h-screen w-full md:w-80 flex flex-col border-r border-gray-200 bg-white'>
      <div className='p-4 border-b border-gray-200'>
        <Text strong className='text-xl'>Messages</Text>
      </div>
      
      <div className='p-3 border-b border-gray-200'>
        <Input 
          placeholder="Search users..."
          prefix={<SearchOutlined className='text-gray-400' />}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          value={searchTerm}
        />
      </div>
      
      <List
        className='flex-1 overflow-y-auto'
        dataSource={filteredUsers}
        loading={loading}
        renderItem={(user) => (
          <List.Item 
            key={user.id} 
            className='hover:bg-gray-50 cursor-pointer px-4 py-3'
            onClick={() => handleUserClick(user)}
          >
            <List.Item.Meta
              avatar={
                <Badge dot color="green" offset={[-5, 30]}>
                  <Avatar src={user.photoURL} className='bg-blue-500'>
                    {user.username?.charAt(0) || user.email?.charAt(0)}
                  </Avatar>
                </Badge>
              }
              title={<Text strong>{user.username || user.email.split('@')[0]}</Text>}
              description={<Text type="secondary" ellipsis>Click to start chatting</Text>}
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No users found' }}
      />
    </div>
  );
};

export default ChatList;