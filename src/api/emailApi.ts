import axios from 'axios';

export const sendEmail = async (emailData: { recipient: string, subject: string, body: string }) => {
  try {
    const response = await axios.post('https://mockapi.io/send-email', emailData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to send email');
  }
};
