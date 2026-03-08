import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading } = useContext(AuthContext);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await signup(email, password);
      // Firebase automatically logs in the user after signup. 
      // To force manual login as requested, we sign out immediately.
      await signOut(auth);
      
      Alert.alert(
        'Success', 
        'Account created successfully! Please login with your credentials.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e) {
      const errorMsg = e.message || 'Registration failed';
      Alert.alert('Error', errorMsg);
    }
  };

  return (
    <LinearGradient colors={['#0f3d2e', '#145a32']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our Betel App community</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#a2d9ce"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#a2d9ce"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#a2d9ce" 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#a2d9ce"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#a2d9ce" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.signupBtn}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupBtnText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a2d9ce',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(162, 217, 206, 0.3)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(162, 217, 206, 0.3)',
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 10,
    marginRight: 5,
  },
  signupBtn: {
    backgroundColor: '#1e8449',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
  },
  signupBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#a2d9ce',
    fontSize: 14,
  },
  loginBold: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
