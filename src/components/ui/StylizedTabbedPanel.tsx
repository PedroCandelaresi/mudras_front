'use client';

import React from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface StylizedTabDefinition {
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    color?: string;
}

interface Props {
    tabs: StylizedTabDefinition[];
    activeKey: string;
    onChange: (key: string) => void;
    children: React.ReactNode;
}

export default function StylizedTabbedPanel({ tabs, activeKey, onChange, children }: Props) {
    const activeTabColor = tabs.find(t => t.key === activeKey)?.color || '#1976d2';

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 0,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid #e0e0e0',
                    mb: 0
                }}
            >
                <Tabs
                    value={activeKey}
                    onChange={(_, newValue) => onChange(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 48,
                        '& .MuiTabs-indicator': {
                            backgroundColor: activeTabColor,
                            height: 3,
                        },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            minHeight: 48,
                            minWidth: 120,
                            color: 'text.secondary',
                            transition: 'color 0.2s',
                            '&.Mui-selected': {
                                color: activeTabColor,
                            },
                            '&:hover': {
                                color: activeTabColor,
                                bgcolor: alpha(activeTabColor, 0.04),
                            },
                        },
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.key}
                            value={tab.key}
                            label={tab.label}
                            icon={tab.icon ? <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>{tab.icon}</Box> : undefined}
                            iconPosition="start"
                            sx={{ borderRadius: 0 }}
                        />
                    ))}
                </Tabs>
            </Paper>

            <Box sx={{ flex: 1, position: 'relative' }}>
                {children}
            </Box>
        </Box>
    );
}
