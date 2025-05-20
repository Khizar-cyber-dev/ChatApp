import React, { useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from "firebase/auth";
import { auth, db } from "../Firebase/client";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Typography, Divider, Alert, message } from 'antd';
import { GoogleOutlined, GithubOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AuthForm: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [form] = Form.useForm();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState({
        google: false,
        github: false
    });
   
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate("/home");
    }, [user]);

    const handleSubmit = async (values: any) => {
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                const user = userCredential.user;

                await updateProfile(user, { displayName: values.name });
                await user.reload();

                try {
                    await setDoc(doc(db, "users", user.uid), {
                        uid: user.uid,
                        name: values.name,
                        email: values.email,
                        createdAt: new Date().toISOString(),
                    });
                    message.success('Account created successfully!');
                    navigate("/home");
                } catch (firestoreError: any) {
                    setError("Firestore error: " + firestoreError.message);
                    setLoading(false);
                    return;
                }
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
                const user = userCredential.user;
                
                const userDoc = await getDoc(doc(db, "users", user.uid));
                
                if (!userDoc.exists()) {
                    await setDoc(doc(db, "users", user.uid), {
                        uid: user.uid,
                        name: user.displayName || "",
                        email: user.email,
                        createdAt: new Date().toISOString(),
                    });
                    message.info('Your account information has been updated in our system.');
                }
                
                message.success('Logged in successfully!');
                navigate("/home");
            }
        } catch (err: any) {
            console.error("Error in Auth:", err);
            let errorMessage = err.message;
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered.';
            } else if (err.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (err.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            }
            setError(errorMessage);
            message.error(errorMessage);
        }

        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setSocialLoading(prev => ({ ...prev, google: true }));
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: user.displayName || "",
                    email: user.email || "",
                    photoURL: user.photoURL || "",
                    createdAt: new Date().toISOString(),
                    provider: "google"
                });
            }
            
            message.success('Logged in with Google successfully!');
            navigate("/home");
        } catch (error: any) {
            console.error("Google login error:", error);
            let errorMessage = error.message;
            if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account already exists with the same email but different sign-in method.';
            }
            message.error(errorMessage || 'Google login failed');
        } finally {
            setSocialLoading(prev => ({ ...prev, google: false }));
        }
    };

    const handleGithubLogin = async () => {
        setSocialLoading(prev => ({ ...prev, github: true }));
        try {
            const provider = new GithubAuthProvider();
            provider.addScope('user:email');
            
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const email = user.email || (result as any)._tokenResponse?.email;
            
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: user.displayName || "",
                    email: email || "",
                    photoURL: user.photoURL || "",
                    createdAt: new Date().toISOString(),
                    provider: "github"
                });
            }
            
            message.success('Logged in with GitHub successfully!');
            navigate("/home");
        } catch (error: any) {
            console.error("GitHub login error:", error);
            let errorMessage = error.message;
            if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account already exists with the same email but different sign-in method.';
            }
            message.error(errorMessage || 'GitHub login failed');
        } finally {
            setSocialLoading(prev => ({ ...prev, github: false }));
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
            <Card 
                className="w-full max-w-[420px] shadow-xl rounded-xl"
                bodyStyle={{ padding: '2rem' }}
            >
                <div className="text-center mb-6">
                    <Title level={3} className="mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </Title>
                    <Text type="secondary">
                        {isSignUp ? 'Join us today' : 'Sign in to continue'}
                    </Text>
                </div>

                {error && (
                    <Alert 
                        message={error} 
                        type="error" 
                        showIcon 
                        className="mb-6" 
                        closable 
                        onClose={() => setError(null)}
                    />
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    {isSignUp && (
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: 'Please input your name!' }]}
                        >
                            <Input 
                                prefix={<UserOutlined />} 
                                placeholder="Full Name" 
                                size="large"
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input 
                            prefix={<MailOutlined />} 
                            placeholder="Email" 
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Password" 
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            block
                            size="large"
                        >
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>or</Divider>

                <Space direction="vertical" className="w-full">
                    <Button 
                        icon={<GoogleOutlined />} 
                        block 
                        size="large"
                        onClick={handleGoogleLogin}
                        loading={socialLoading.google}
                    >
                        Continue with Google
                    </Button>
                    <Button 
                        icon={<GithubOutlined />} 
                        block 
                        size="large"
                        onClick={handleGithubLogin}
                        loading={socialLoading.github}
                    >
                        Continue with GitHub
                    </Button>
                </Space>

                <div className="text-center mt-6">
                    <Text type="secondary">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </Text>{' '}
                    <Button 
                        type="link" 
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            form.resetFields();
                            setError(null);
                        }}
                        className="p-0"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AuthForm;