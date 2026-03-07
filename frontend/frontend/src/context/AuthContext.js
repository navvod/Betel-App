import React, { createContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setUserToken(token);
        setUser(firebaseUser);
        await SecureStore.setItemAsync('userToken', token);
        
        // Check if onboarding is needed
        const hasSeenOnboarding = await AsyncStorage.getItem(`onboarding_${firebaseUser.uid}`);
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      } else {
        setUserToken(null);
        setUser(null);
        setShowOnboarding(false);
        await SecureStore.deleteItemAsync('userToken');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (e) {
      console.log(`Login error: ${e}`);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password) => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Mark for onboarding since it's a new signup
      await AsyncStorage.removeItem(`onboarding_${userCredential.user.uid}`);
      return userCredential.user;
    } catch (e) {
      console.log(`Signup error: ${e}`);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (user) {
      await AsyncStorage.setItem(`onboarding_${user.uid}`, 'true');
      setShowOnboarding(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
    } catch (e) {
      console.log(`Logout error: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      login, 
      signup, 
      logout, 
      completeOnboarding,
      isLoading, 
      userToken, 
      user,
      showOnboarding 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
