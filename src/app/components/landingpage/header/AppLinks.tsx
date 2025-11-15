'use client';
import React from 'react';
import { Avatar, Box, Typography, Grid } from '@mui/material';
import Link from 'next/link';
import { appsLink } from './data';

const AppLinks: React.FC = () => {
  return (
    <Grid container spacing={3} mb={4}>
      {appsLink.map((link) => (
        <Grid key={link.href} size={{ lg: 6 }}>
          <Link href={link.href} className="hover-text-primary">
            <Box display="flex" flexDirection="row" gap={2}>
              <Box
                minWidth="45px"
                height="45px"
                bgcolor="grey.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Avatar
                  src={link.avatar}
                  alt={link.title}
                  sx={{ width: 24, height: 24, borderRadius: 0 }}
                />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="textPrimary"
                  noWrap
                  className="text-hover"
                  sx={{ width: 240 }}
                >
                  {link.title}
                </Typography>
                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                  fontSize="12px"
                  sx={{ width: 240 }}
                  noWrap
                >
                  {link.subtext}
                </Typography>
              </Box>
            </Box>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default AppLinks;
