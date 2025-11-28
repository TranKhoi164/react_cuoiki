import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useAppSelector } from '../app/hooks';

const Home: React.FC = () => {
  const { account, isAuthenticated } = useAppSelector((state) => state.user);

  return (
    <Container>
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome
        </Typography>
        {isAuthenticated && account ? (
          <Typography variant="h5" component="p">
            Hello, {account.username}!
          </Typography>
        ) : (
          <Typography variant="h5" component="p">
            Please login or register to continue.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Home;

