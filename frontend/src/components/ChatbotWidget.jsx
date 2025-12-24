import React, { useState, useRef, useEffect } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, IconButton, TextField, Button, Box, Typography, Paper } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chatbot/message', { message: input });
      setMessages((msgs) => [...msgs, { from: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { from: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      <Fab color="primary" aria-label="chat" onClick={handleOpen} sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 2000 }}>
        <ChatIcon />
      </Fab>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Chat
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Paper sx={{ height: 350, overflowY: 'auto', p: 2, bgcolor: '#f9f9f9' }}>
            {messages.map((msg, idx) => (
              <Box key={idx} display="flex" justifyContent={msg.from === 'user' ? 'flex-end' : 'flex-start'} mb={1}>
                <Box
                  sx={{
                    bgcolor: msg.from === 'user' ? 'primary.main' : 'grey.300',
                    color: msg.from === 'user' ? 'white' : 'black',
                    px: 2, py: 1, borderRadius: 2, maxWidth: '80%'
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Paper>
          <Box display="flex" p={2} gap={1}>
            <TextField
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Type your message..."
              fullWidth
              size="small"
              disabled={loading}
            />
            <Button variant="contained" onClick={handleSend} disabled={loading || !input.trim()}>
              Send
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatbotWidget; 