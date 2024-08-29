import React from "react";
import { Typography, Box, Avatar, Divider, Paper, Chip } from "@mui/material";
import { styled } from "@mui/system";

const EmailContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
}));

const EmailHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const EmailDetails = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const RecipientInfo = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  marginBottom: theme.spacing(1),
}));

const RecipientChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function EmailView({ email }) {
  const leadData = JSON.parse(`[${email.lead_data}]`);
  const sender = leadData[0];

  const renderRecipients = (recipients, type) => {
    return recipients?.split(',').map((recipient, index) => (
      <RecipientChip key={`${type}-${index}`} label={recipient} size="small" />
    ));
  };

  return (
    <EmailContainer>
      <EmailHeader>
        <Avatar alt={sender.firstName}>
          {sender.firstName?.charAt(0)}
        </Avatar>
        <EmailDetails>
          <Typography variant="h6">{`${sender.firstName} ${sender.lastName}`}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {sender.email}
          </Typography>
        </EmailDetails>
      </EmailHeader>
      <Typography variant="h5" gutterBottom>
        {email.subject}
      </Typography>
      <RecipientInfo>To: {renderRecipients(email.to_recipients, 'to')}</RecipientInfo>
      {email.cc_recipients && (
        <RecipientInfo>CC: {renderRecipients(email.cc_recipients, 'cc')}</RecipientInfo>
      )}
      {email.bcc_recipients && (
        <RecipientInfo>BCC: {renderRecipients(email.bcc_recipients, 'bcc')}</RecipientInfo>
      )}
      <Divider sx={{ my: 2 }} />
      <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
        {email.body}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Sent: {new Date(email.created_at).toLocaleString()}
      </Typography>
    </EmailContainer>
  );
}