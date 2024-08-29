import React from "react";
import { Box, TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar, Tooltip } from "@mui/material";

export default function EmailList({ emails, selectedEmail, onSelectEmail, searchText, onSearchChange }) {
  const getInitials = (email) => {
    const leadData = getLeadData(email);
    if (!leadData || leadData.length === 0) return "?";
    const { firstName, lastName } = leadData[0];
    return `${firstName?.[0]}${lastName?.[0]}`.toUpperCase();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getLeadData = (email) => {
    try {
        const leadData = JSON.parse(`[${email.lead_data}]`);
        return leadData;
    } catch (error) {
      console.error("Error parsing lead_data:", error);
      return [];
    }
  };

  const getRecipients = (email) => {
    return email.to_recipients || email.cc_recipients || email.bcc_recipients || "";
  };

  const formatRecipients = (email) => {
    const leadData = getLeadData(email);
    if (leadData.length === 0) return "";
    if (leadData.length === 1) {
      return `${leadData[0].firstName} ${leadData[0].lastName}`;
    }
    return `${leadData[0].firstName} ${leadData[0].lastName} +${leadData.length - 1}`;
  };

  return (
    <Box sx={{ minWidth: 400, maxWidth: 400, borderRight: "1px solid #e0e0e0", bgcolor: "#f5f5f5", overflow: "auto" }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search emails"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ m: 2, width: "calc(100% - 32px)" }}
      />
      <List sx={{ p: 0 }}>
        {emails.map((email) => (
          <ListItem
            key={email.id}
            button
            onClick={() => onSelectEmail(email)}
            selected={selectedEmail && selectedEmail.id === email.id}
            sx={{
              borderBottom: "1px solid #e0e0e0",
              "&:hover": { bgcolor: "#e8e8e8" },
              "&.Mui-selected": { bgcolor: "#d1d1d1" },
            }}
          >
            <ListItemAvatar>
              <Avatar>{getInitials(email)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Tooltip title={getRecipients(email)}>
                    <span style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formatRecipients(email)}
                    </span>
                  </Tooltip>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>{formatDate(email.created_at)}</span>
                </Box>
              }
              secondary={
                <React.Fragment>
                  <Box component="span" sx={{ fontWeight: 'bold', display: 'block' }}>{email.subject}</Box>
                  <Box component="span" sx={{ color: '#666', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.body.substring(0, 50)}...
                  </Box>
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}