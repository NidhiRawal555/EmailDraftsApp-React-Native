import React, { useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { addDraft, updateDraft } from '../store/emailSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput as PaperTextInput } from 'react-native-paper';

interface Draft {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'Draft' | 'Sent';
}

const EmailEditorScreen = ({ route, navigation }: any) => {
  const { draft }: { draft?: Draft } = route.params || {};
  const dispatch = useDispatch();

  const [recipient, setRecipient] = useState(draft ? draft.recipient : '');
  const [subject, setSubject] = useState(draft ? draft.subject : '');
  const [body, setBody] = useState(draft ? draft.body : '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const newDraft = {
      id: Date.now().toString(),
      recipient,
      subject,
      body,
      status: 'Draft' as 'Draft',
    };

    if (draft) {
      dispatch(updateDraft({ ...newDraft, id: draft.id }));
    } else {
      dispatch(addDraft(newDraft));
    }

    const updatedDrafts = await AsyncStorage.getItem('drafts');
    const draftsArray = updatedDrafts ? JSON.parse(updatedDrafts) : [];
    draftsArray.push(newDraft);
    await AsyncStorage.setItem('drafts', JSON.stringify(draftsArray));

    navigation.goBack();
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      const emailData = {
        personalizations: [{ to: [{ email: recipient }] }],
        from: { email: 'your-email@example.com' },
        subject: subject,
        content: [{ type: 'text/plain', value: body }],
      };
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_SENDGRID_API_KEY`, // Replace with your actual SendGrid API key
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        const newDraft = {
          id: draft?.id || Date.now().toString(),
          recipient,
          subject,
          body,
          status: 'Sent' as 'Sent',
        };

        dispatch(updateDraft(newDraft));

        const updatedDrafts = await AsyncStorage.getItem('drafts');
        const draftsArray = updatedDrafts ? JSON.parse(updatedDrafts) : [];
        const updatedDraftsArray = draftsArray.map((draft: { id: string }) =>
          draft.id === newDraft.id ? { ...draft, status: 'Sent' } : draft
        );
        await AsyncStorage.setItem('drafts', JSON.stringify(updatedDraftsArray));

        Alert.alert('Success', 'Email sent successfully!');
        navigation.goBack();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <PaperTextInput
        label="Recipient"
        value={recipient}
        onChangeText={setRecipient}
        style={{ marginBottom: 10 }}
      />
      <PaperTextInput
        label="Subject"
        value={subject}
        onChangeText={setSubject}
        style={{ marginBottom: 10 }}
      />
      <PaperTextInput
        label="Body"
        value={body}
        onChangeText={setBody}
        style={{ marginBottom: 10 }}
        multiline
        numberOfLines={4}
      />
      <Button mode="contained" onPress={handleSave} style={{ marginBottom: 10 }}>
        Save Draft
      </Button>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button mode="contained" onPress={handleSendEmail}>
          Send Email
        </Button>
      )}
    </View>
  );
};

export default EmailEditorScreen;
