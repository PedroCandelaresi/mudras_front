import React from 'react';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { keyframes } from '@mui/system';
import Typography from '@mui/material/Typography';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

interface MudrasLoaderProps {
    size?: number;
    text?: string;
}

const MudrasLoader: React.FC<MudrasLoaderProps> = ({ size = 80, text }) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ p: 4 }}
        >
            <Box
                sx={{
                    animation: `${pulse} 1.5s infinite ease-in-out`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Image
                    src="/logo.svg"
                    alt="Cargando..."
                    width={size}
                    height={size}
                    priority
                />
            </Box>
            {text && (
                <Typography
                    mt={2}
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        letterSpacing: 0.5,
                        animation: `${pulse} 1.5s infinite ease-in-out`
                    }}
                >
                    {text}
                </Typography>
            )}
        </Box>
    );
};

export default MudrasLoader;
