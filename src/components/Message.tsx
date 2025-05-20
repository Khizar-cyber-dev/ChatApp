import { List, Avatar, Typography } from 'antd'
import type { Message as MessageType } from '../pages/ChatPage'

const { Text } = Typography

interface MessageProps {
  messages: MessageType[]
  user: { uid: string } | null
}

const Message = ({ messages, user }: MessageProps) => {
  if(!user) return null;
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <List
        dataSource={messages}
        renderItem={(msg) => (
          <div
            className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg p-3 w-[200px] ${
                msg.senderId === user?.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {msg.senderId !== user?.uid && (
                <div className="flex items-center mb-1 w-[200px]">
                  <Avatar size="small" src={msg.senderAvatar}>
                    {msg.senderName?.charAt(0)}
                  </Avatar>
                </div>
              )}
              <Text className={msg.senderId === user?.uid ? 'text-white' : ''}>
                {msg.text}
              </Text>
              <div
                className={`text-xs mt-1 ${
                  msg.senderId === user?.uid ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default Message