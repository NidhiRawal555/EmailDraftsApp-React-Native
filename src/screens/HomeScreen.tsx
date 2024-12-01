import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setDrafts } from '../store/emailSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const drafts = useSelector((state: RootState) => state.email.drafts);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track if the user is logged in

  useEffect(() => {
    // Load drafts from AsyncStorage and set them in Redux
    const loadDrafts = async () => {
      const userLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (userLoggedIn === 'true') {
        setIsLoggedIn(true); // Set logged in state to true
        
        // Load drafts only if the user is logged in
        const savedDrafts = await AsyncStorage.getItem('drafts');
        if (savedDrafts) {
          dispatch(setDrafts(JSON.parse(savedDrafts)));
        }
      } else {
        setIsLoggedIn(false); // User is not logged in
      }
    };

    loadDrafts();
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn'); // Remove the login status
      await AsyncStorage.removeItem('drafts'); // Clear drafts from AsyncStorage
      dispatch(setDrafts([])); // Reset drafts in Redux
      setIsLoggedIn(false); // Set login state to false
      Alert.alert('Logged Out', 'You have been logged out and drafts cleared.');
      navigation.navigate('Home'); // Navigate to Home screen after logging out
    } catch (error) {
      Alert.alert('Error', 'An error occurred while logging out.');
    }
  };

  const handleLogin = async () => {
    // Simulate login process (You can replace this with actual login functionality)
    await AsyncStorage.setItem('isLoggedIn', 'true'); // Save login status in AsyncStorage
    setIsLoggedIn(true); // Update login state in the app
    Alert.alert('Logged In', 'You are now logged in.');
  };

  const renderDraft = ({ item }: any) => (
    <Card style={{ marginVertical: 8 }}>
      <Card.Content>
        <Title>{item.subject}</Title>
        <Paragraph>{item.recipient}</Paragraph>
        <Paragraph>Status: {item.status}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ padding: 20 }}>
      {isLoggedIn ? (
        <>
          {/* Show Create New Draft button only if user is logged in */}
          <Button mode="contained" onPress={() => navigation.navigate('EmailEditor')} style={{ marginBottom: 20 }}>
            Send Email
          </Button>

          {/* Show Logout button if user is logged in */}
          <Button mode="outlined" onPress={handleLogout} style={{ marginBottom: 20 }}>
            Logout
          </Button>
        </>
      ) : (
        // Show Login button if user is not logged in
        <Button mode="contained" onPress={handleLogin} style={{ marginBottom: 20 }}>
          Login
        </Button>
      )}

      <FlatList
        data={drafts}
        renderItem={renderDraft}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Paragraph>No drafts available</Paragraph>}
      />
    </View>
  );
};

export default HomeScreen;
