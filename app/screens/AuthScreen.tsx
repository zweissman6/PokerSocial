import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../context/UserContext';

const API_URL = 'http://192.168.1.240:4000/auth';

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
  const { setUser } = useUser();

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleAuth = async () => {
    if (!isLogin) {
      if (!form.userName.trim()) {
        return Alert.alert('Validation Error', 'Username is required.');
      }
      if (!form.firstName.trim()) {
        return Alert.alert('Validation Error', 'First Name is required.');
      }
      if (!form.password.trim()) {
        return Alert.alert('Validation Error', 'Password is required.');
      }
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

  const pickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "We need access to your camera roll.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('avatar', result.assets[0].uri);
    }
  };

  const takeAvatarPhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "We need access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('avatar', result.assets[0].uri);
    }
  };

  const chooseAvatar = () => {
    Alert.alert("Choose Avatar", "Select a photo or take a new one", [
      { text: "Take Photo", onPress: takeAvatarPhoto },
      { text: "Choose from Gallery", onPress: pickAvatar },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
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

              <Text style={styles.label}>Avatar</Text>
              <TouchableOpacity style={styles.avatarPicker} onPress={chooseAvatar}>
                {form.avatar ? (
                  <Image source={{ uri: form.avatar }} style={styles.avatarPreview} />
                ) : (
                  <Text style={{ color: '#aaa' }}>Tap to select photo</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.label}>Favorite Cardroom</Text>
              <TextInput
                value={form.favoriteCardroom}
                onChangeText={val => handleChange('favoriteCardroom', val)}
                style={styles.input}
              />
            </>
          ) : (
            <TextInput
              placeholder="Username"
              value={form.userName}
              onChangeText={val => handleChange('userName', val)}
              style={styles.input}
            />
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
  title: {
    color: '#ffd700',
    fontSize: 26,
    marginBottom: 16,
    alignSelf: 'center',
    fontWeight: 'bold',
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
  avatarPicker: {
    backgroundColor: '#232323',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
});
