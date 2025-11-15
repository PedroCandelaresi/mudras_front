"use client";
import React from 'react';
import { Breadcrumbs, Link as MUILink, Typography } from '@mui/material';
import Link from 'next/link';

export interface BreadcrumbItem {
  to?: string;
  title: string;
}

interface Props {
  title?: string;
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<Props> = ({ title, items }) => {
  const trail = items ?? [];

  return (
    <>
      {title && (
        <Typography variant="h5" fontWeight={700} mb={1}>
          {title}
        </Typography>
      )}
      {trail.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          {trail.map((item, idx) =>
            item.to && idx < trail.length - 1 ? (
              <MUILink
                key={`${item.to}-${item.title}`}
                component={Link}
                href={item.to}
                underline="hover"
                color="inherit"
              >
                {item.title}
              </MUILink>
            ) : (
              <Typography key={`${item.to ?? 'current'}-${item.title}`} color="text.primary">
                {item.title}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
    </>
  );
};

export default Breadcrumb;

