import { router } from 'expo-router';
import { Button, Text, TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';

import { useSession } from '../ctx';
import { useState } from 'react';
import axios from 'axios';

export default function SignIn() {
    const { signIn } = useSession();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async () => {
        if (username == '' && password == '') {
            setMessage('Fill up credentials')
        }
        else {
            try {
                const res = await axios.post('http://192.168.186.16:5000/api/auth/login', {
                    username,
                    password,
                });
                setMessage(`Welcome ${res.data.user.username}`);
                // Navigate to home screen or other secure screen after successful login
                signIn();
                router.replace('/');
            } catch (err) {
                setMessage('Invalid credentials');
            }
        }
    };

    const handleSignup = async () => {
        if (username == '' && password == '') {
            setMessage('Fill up credentials')
        }
        else {
            try {
                const res = await axios.post('http://192.168.186.16:5000/api/auth/signup', {
                    username,
                    password,
                });
                setMessage(`Welcome ${res.data.user.username}`);
                // Navigate to login or home screen after successful signup
                signIn();
                router.replace('/');
            } catch (err: any) {
                setMessage(err.response.data.message || 'Error occurred');
            }
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
                <Text style={styles.buttonText}>Signup</Text>
            </TouchableOpacity>
            {message ? <Text style={{textAlign: 'center', color: 'gold'}}>{message}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        textAlign: 'center'
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        padding: 8,
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    signUpButton: {
        backgroundColor: '#F4CD77',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    link: {
        marginTop: 10,
        alignItems: 'center',
    },
    linkText: {
        color: '#1E90FF',
        fontSize: 16,
    },
});