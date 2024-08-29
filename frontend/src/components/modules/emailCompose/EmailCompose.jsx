import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Autocomplete, Box, IconButton, Typography, Collapse } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function EmailCompose({ open, onClose }) {
  const [email, setEmail] = useState({ to: [], cc: [], bcc: [], subject: "", body: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [expandRecipients, setExpandRecipients] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch("http://localhost:3001/email-suggestions");
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.map(lead => ({
          label: `${lead.firstName} ${lead.lastName} <${lead.email}>`,
          value: lead.email
        })));
      }
    } catch (error) {
      console.error("Error fetching email suggestions:", error);
    }
  };

  const handleChange = (e, value, reason, fieldName) => {
    if (fieldName === 'to' || fieldName === 'cc' || fieldName === 'bcc') {
      setEmail({ ...email, [fieldName]: value });
    } else {
      setEmail({ ...email, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailCopy = JSON.parse(JSON.stringify(email));
    emailCopy.to = emailCopy.to.map(to => to.value);
    emailCopy.cc = emailCopy.cc.map(cc => cc.value);
    emailCopy.bcc = emailCopy.bcc.map(bcc => bcc.value);
    try {
      const response = await fetch("http://localhost:3001/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailCopy),
      });
      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const toggleRecipients = () => {
    setExpandRecipients(!expandRecipients);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', padding: '16px 24px' }}>
        New Message
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: '24px' }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <Typography sx={{ minWidth: '60px' }}>To:</Typography>
            <Autocomplete
              multiple
              options={suggestions}
              renderInput={(params) => <TextField {...params} variant="standard" />}
              value={email.to}
              onChange={(e, value) => handleChange(e, value, null, 'to')}
              sx={{ flexGrow: 1 }}
            />
            <IconButton onClick={toggleRecipients}>
              {expandRecipients ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandRecipients}>
            {showCC && (
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <Typography sx={{ minWidth: '60px' }}>Cc:</Typography>
                <Autocomplete
                  multiple
                  options={suggestions}
                  renderInput={(params) => <TextField {...params} variant="standard" />}
                  value={email.cc}
                  onChange={(e, value) => handleChange(e, value, null, 'cc')}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            )}
            {showBCC && (
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <Typography sx={{ minWidth: '60px' }}>Bcc:</Typography>
                <Autocomplete
                  multiple
                  options={suggestions}
                  renderInput={(params) => <TextField {...params} variant="standard" />}
                  value={email.bcc}
                  onChange={(e, value) => handleChange(e, value, null, 'bcc')}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, marginBottom: 2 }}>
              {!showCC && <Button onClick={() => setShowCC(true)}>Add Cc</Button>}
              {!showBCC && <Button onClick={() => setShowBCC(true)}>Add Bcc</Button>}
            </Box>
          </Collapse>
          <TextField
            fullWidth
            name="subject"
            placeholder="Subject"
            value={email.subject}
            onChange={handleChange}
            variant="standard"
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            name="body"
            multiline
            rows={10}
            value={email.body}
            onChange={handleChange}
            variant="standard"
            sx={{ marginBottom: 2 }}
          />
        </form>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #e0e0e0', padding: '16px 24px' }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}