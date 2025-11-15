"use client";
import React from 'react';
import { Typography, Stack } from '@mui/material';
import Link from 'next/link';
import { pageLinks } from './data';

const QuickLinks: React.FC = () => (
  <>
    <Typography variant="h5">Enlaces rápidos</Typography>
    <Stack spacing={2} mt={2}>
      {pageLinks.map((link) => (
        <Link href={link.href} key={link.href} className="hover-text-primary">
          <Typography
            variant="subtitle2"
            color="textPrimary"
            className="text-hover"
            fontWeight={600}
          >
            {link.title}
          </Typography>
        </Link>
      ))}
    </Stack>
  </>
);

export default QuickLinks;

