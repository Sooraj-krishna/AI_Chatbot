import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, Stack, TextField, Typography, Paper, Avatar,
  ThemeProvider, createTheme, useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const ChatTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function formatMessage(content) {
  return content.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Deepz your support assistant. How can I help you today?" },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    const userMessage = { role: 'user', content: message };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...messages, userMessage]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: data },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ThemeProvider theme={ChatTheme}>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '90%',
            maxWidth: '800px',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h4" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            Chat Assistant
          </Typography>
          <Stack
            direction="column"
            spacing={2}
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 2,
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                  mb: 2,
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    <SmartToyIcon />
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: msg.role === 'assistant' ? 'primary.light' : 'secondary.light',
                    borderRadius: msg.role === 'assistant' ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {formatMessage(msg.content)}
                  </Typography>
                </Paper>
                {msg.role === 'user' && (
                  <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
                    <PersonIcon />
                  </Avatar>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={sendMessage}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}