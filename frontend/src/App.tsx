import React, { useState } from 'react';
import RisetPengembanganTable from './components/RisetPengembanganTable';
import DashboardTable from './components/Dashboardtable';
import { Container, Typography, Tabs, Tab, Box } from '@mui/material';

function App() {
  const [currentTab, setCurrentTab] = useState('risetPengembangan');

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg">
    
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        aria-label="tabs"
      >
        <Tab label="Riset Pengembangan" value="risetPengembangan" />
        <Tab label="Dashboard" value="dashboard" />
      </Tabs>

      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)', // Adjust based on your header height
          mt: 2
        }}
      >
        {currentTab === 'risetPengembangan' ? <RisetPengembanganTable /> : <DashboardTable />}
      </Box>
    </Container>
  );
}

export default App;
