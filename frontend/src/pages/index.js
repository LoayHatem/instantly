import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { EmailCompose } from "../components/modules/emailCompose";
import { EmailView } from "../components/modules/emailView";
import { EmailList } from "../components/modules/emailList";

export default function Home() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEmails(searchText);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  const fetchEmails = async (search = "") => {
    try {
      const response = await fetch(`http://localhost:3001/emails?search=${search}`);
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const closeAndReload = () => {
    setIsComposeOpen(false);
    fetchEmails();
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#ffffff" }}>
      <EmailList
        emails={emails}
        selectedEmail={selectedEmail}
        onSelectEmail={setSelectedEmail}
        searchText={searchText}
        onSearchChange={setSearchText}
      />
      <Box sx={{ flexGrow: 1, p: 2 }}>
        {selectedEmail ? <EmailView email={selectedEmail} /> : <Typography variant="h6">Select an email to view</Typography>}
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsComposeOpen(true)}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        Compose
      </Button>
      <EmailCompose
        open={isComposeOpen}
        onClose={() => closeAndReload()}
      />
    </Box>
  );
}