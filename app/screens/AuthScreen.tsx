import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../context/UserContext';

// Use your backend's public URL if testing on device!
const API_URL = 'http://192.168.68.77:4000/auth'; // Change if using phone (see earlier messages)

export default function AuthScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    avatar: '',
    favoriteCardroom: '',
    password: '',
  });
  const { user, setUser } = useUser();


  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleAuth = async () => {
    try {
      const url = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
      const data = isLogin
        ? { userName: form.userName, password: form.password }
        : form;

      const res = await axios.post(url, data);

      if (res.data.user) {
        Alert.alert('Success', `${isLogin ? 'Logged in' : 'Registered'} as ${res.data.user.userName}`);
        // store user info globally
        setUser(res.data.user)
        router.replace('/');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Register'}</Text>
      <TextInput
        placeholder="Username"
        value={form.userName}
        onChangeText={val => handleChange('userName', val)}
        style={styles.input}
      />
      {!isLogin && (
        <>
          <TextInput
            placeholder="First Name"
            value={form.firstName}
            onChangeText={val => handleChange('firstName', val)}
            style={styles.input}
          />
          <TextInput
            placeholder="Last Name"
            value={form.lastName}
            onChangeText={val => handleChange('lastName', val)}
            style={styles.input}
          />
          <TextInput
            placeholder="Avatar URL"
            value={form.avatar}
            onChangeText={val => handleChange('avatar', val)}
            style={styles.input}
          />
          <TextInput
            placeholder="Favorite Cardroom"
            value={form.favoriteCardroom}
            onChangeText={val => handleChange('favoriteCardroom', val)}
            style={styles.input}
          />
        </>
      )}
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={val => handleChange('password', val)}
        style={styles.input}
      />
      <Button
        title={isLogin ? 'Login' : 'Register'}
        onPress={handleAuth}
      />
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switch}>
        <Text style={{ color: '#2196F3' }}>
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#1a1a1a' },
  title: { color: '#ffd700', fontSize: 26, marginBottom: 16, alignSelf: 'center', fontWeight: 'bold' },
  input: { backgroundColor: '#232323', color: '#fff', marginBottom: 12, padding: 10, borderRadius: 7, fontSize: 16 },
  switch: { marginTop: 18, alignItems: 'center' },
});
