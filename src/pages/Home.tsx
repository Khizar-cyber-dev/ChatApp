import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import ChatList from "../components/ChatList";
import { Layout, Menu, Dropdown, Avatar, Typography, theme } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item 
        key="logout" 
        icon={<LogoutOutlined />} 
        onClick={handleLogout}
        danger
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="h-screen">
      <Sider width={300} style={{ background: colorBgContainer }}>
        <ChatList />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="flex justify-end items-center h-full px-4">
            <Dropdown overlay={menu} placement="bottomRight">
              <div className="flex items-center cursor-pointer">
                <Text strong className="mr-2 hidden sm:inline">
                  {user?.displayName || user?.email?.split('@')[0]}
                </Text>
                <Avatar 
                  src={user?.photoURL} 
                  icon={<UserOutlined />} 
                  className="bg-blue-500"
                />
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
          }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h1 className="text-3xl font-bold mb-4">Welcome, {user?.displayName || 'User'}!</h1>
              <p className="text-gray-600 mb-6">
                Select a conversation from the sidebar to start chatting.
              </p>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomePage;