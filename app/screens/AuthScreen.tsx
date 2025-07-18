import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUser } from '../context/UserContext';

// Use your backend's public URL if testing on device!
const API_URL = 'http://192.168.1.240:4000/auth'; // Change if using phone (see earlier messages)

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
    if (!isLogin) {
      // Validate required fields
      if (!form.userName.trim()) {
        return Alert.alert('Validation Error', 'Username is required.');
      }
      if (!form.firstName.trim()) {
        return Alert.alert('Validation Error', 'First Name is required.');
      }
      if (!form.password.trim()) {
        return Alert.alert('Validation Error', 'Password is required.');
      }

      // Disallow spaces in username and password
      if (/\s/.test(form.userName)) {
        return Alert.alert('Validation Error', 'Username cannot contain spaces.');
      }
      if (/\s/.test(form.password)) {
        return Alert.alert('Validation Error', 'Password cannot contain spaces.');
      }
    }

    try {
      const url = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
      const data = isLogin
        ? { userName: form.userName, password: form.password }
        : form;

      const res = await axios.post(url, data);

      if (res.data.user) {
        Alert.alert('Success', `${isLogin ? 'Logged in' : 'Registered'} as ${res.data.user.userName}`);
        setUser(res.data.user);
        router.replace('/');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Unknown error');
    }
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text style={styles.title}>{isLogin ? 'Login' : 'Register'}</Text>

          {!isLogin ? (
            <>
              <Text style={styles.label}>
                Username <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                value={form.userName}
                onChangeText={val => handleChange('userName', val)}
                style={styles.input}
              />

              <Text style={styles.label}>
                First Name <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                value={form.firstName}
                onChangeText={val => handleChange('firstName', val)}
                style={styles.input}
              />

              <Text style={styles.label}>Last Name</Text>
              <TextInput
                value={form.lastName}
                onChangeText={val => handleChange('lastName', val)}
                style={styles.input}
              />

              <Text style={styles.label}>Avatar URL</Text>
              <TextInput
                value={form.avatar}
                onChangeText={val => handleChange('avatar', val)}
                style={styles.input}
              />

              <Text style={styles.label}>Favorite Cardroom</Text>
              <TextInput
                value={form.favoriteCardroom}
                onChangeText={val => handleChange('favoriteCardroom', val)}
                style={styles.input}
              />
            </>
          ) : (
            <>
              <TextInput
                placeholder="Username"
                value={form.userName}
                onChangeText={val => handleChange('userName', val)}
                style={styles.input}
              />
            </>
          )}

          {!isLogin ? (
            <>
              <Text style={styles.label}>
                Password <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                secureTextEntry
                value={form.password}
                onChangeText={val => handleChange('password', val)}
                style={styles.input}
              />

              <Text style={styles.requiredNote}>
                <Text style={styles.asterisk}>*</Text> Required fields
              </Text>
            </>
          ) : (
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={form.password}
              onChangeText={val => handleChange('password', val)}
              style={styles.input}
            />
          )}

          <Button title={isLogin ? 'Login' : 'Register'} onPress={handleAuth} />
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switch}>
            <Text style={{ color: '#2196F3' }}>
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1a1a1a',
  },
  title: {
    color: '#ffd700',
    fontSize: 26,
    marginBottom: 16,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
  },
  asterisk: {
    color: 'red',
  },
  input: {
    backgroundColor: '#232323',
    color: '#fff',
    marginBottom: 12,
    padding: 10,
    borderRadius: 7,
    fontSize: 16,
  },
  requiredNote: {
    color: '#aaa',
    marginVertical: 8,
    alignSelf: 'flex-start',
    fontSize: 13,
  },
  switch: {
    marginTop: 18,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1a1a1a',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
  }
});
