// pages/api/chat.js
const Groq = require('groq-sdk');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const groq = new Groq({
    apiKey: process.env.LLUMA_API_KEY,
  });

  try {
    console.log('Received messages:', req.body);

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: req.body,
      max_tokens: 1500,
      temperature: 0.7,
    });

    console.log('Groq API response:', response);

    if (response && response.choices && response.choices.length > 0) {
      const assistantMessage = response.choices[0].message.content;
      console.log('Assistant message:', assistantMessage);
      res.status(200).json(assistantMessage);
    } else {
      console.error('Unexpected response structure:', response);
      res.status(500).json({ error: 'Internal Server Error: Unexpected response structure' });
    }
  } catch (error) {
    console.error('Error during completion request:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}