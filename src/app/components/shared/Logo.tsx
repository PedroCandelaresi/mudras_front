'use client';
import { CustomizerContext } from '@/app/context/customizerContext';
import Link from 'next/link';
import { styled, useTheme } from '@mui/material/styles';
import config from '@/app/context/config';
import { useContext } from 'react';

interface LogoProps {
  color?: string;
}

const Logo = ({ color }: LogoProps) => {
  const { isCollapse, isSidebarHover } = useContext(CustomizerContext);
  const TopbarHeight = config.topbarHeight;
  const theme = useTheme();

  const primaryColor = color || '#ed8236';
  const secondaryColor = color || '#66655f';

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,
    width: isCollapse == 'mini-sidebar' && !isSidebarHover ? '40px' : '180px',
    overflow: 'hidden',
    display: 'block',
  }));

  const content = (short: boolean) =>
    short ? (
      <div
        style={{
          width: '40px',
          height: `${TopbarHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 198.43 198.43"
          width="40"
          height="40"
        >
          <path
            fill={primaryColor}
            fillRule="evenodd"
            d="M99.17,61.09c1.58,1.31.05,4.21-3.63,4-11.96-.66-15.17,1.45-15.04,5.58.13,4.04,8.46,9.68,16.84,9.87,7.76.17,15.38-6.51,18.02-4.98,3.31,1.92-11.58,11.72-18.24,11.72-15.11,0-27.49-11.98-27.49-20.01,0-6.04,13.17-7.88,22.16-7.81,2.97.02,6.34.76,7.39,1.63Z"
          />
          <path
            fill={primaryColor}
            fillRule="evenodd"
            d="M101.06,61.09c-1.58,1.31-.05,4.21,3.63,4,11.96-.66,15.17,1.45,15.04,5.58-.13,4.03-2.62,9.66-9.85,13.9-2.89,1.7-7.22,3.28-12.1,4.06-5.7.91-12.02-1.8-14.88.99-2.73,2.68,10.86,5.09,17.53,5.09,15.11,0,30.18-19.41,30.18-27.45,0-6.04-13.17-7.88-22.16-7.81-2.98.02-6.34.76-7.39,1.63Z"
          />
        </svg>
      </div>
    ) : (
      <div
        style={{
          height: `${TopbarHeight}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 198.43 198.43"
          width="180"
          height="50"
          preserveAspectRatio="xMidYMid meet"
        >
          <g>
            <path
              fill={primaryColor}
              fillRule="evenodd"
              d="M99.17,61.09c1.58,1.31.05,4.21-3.63,4-11.96-.66-15.17,1.45-15.04,5.58.13,4.04,8.46,9.68,16.84,9.87,7.76.17,15.38-6.51,18.02-4.98,3.31,1.92-11.58,11.72-18.24,11.72-15.11,0-27.49-11.98-27.49-20.01,0-6.04,13.17-7.88,22.16-7.81,2.97.02,6.34.76,7.39,1.63Z"
            />
            <path
              fill={primaryColor}
              fillRule="evenodd"
              d="M101.06,61.09c-1.58,1.31-.05,4.21,3.63,4,11.96-.66,15.17,1.45,15.04,5.58-.13,4.03-2.62,9.66-9.85,13.9-2.89,1.7-7.22,3.28-12.1,4.06-5.7.91-12.02-1.8-14.88.99-2.73,2.68,10.86,5.09,17.53,5.09,15.11,0,30.18-19.41,30.18-27.45,0-6.04-13.17-7.88-22.16-7.81-2.98.02-6.34.76-7.39,1.63Z"
            />
          </g>
          <g transform="translate(0, -20) scale(1.2)">
            <path fill={secondaryColor} d="M47.83,128.4c0-4.51.07-8.99.07-9.03h-.07s-.8,1.87-2.64,5.68l-3.81,7.72h-1.7l-3.74-7.62c-1.91-3.91-2.67-5.78-2.71-5.78h-.07s.07,4.51.07,9.03v10.16h-2.57v-23.4h2.98l6.95,14.07h.07l6.92-14.07h2.87v23.4h-2.61v-10.16Z" />
            <path fill={secondaryColor} d="M74.64,129.74c0,6.08-2.94,9.23-8.39,9.23s-8.36-3.14-8.36-9.23v-14.58h2.64v14.61c0,4.41,1.77,6.69,5.75,6.69s5.82-2.27,5.82-6.69v-14.61h2.54v14.58Z" />
            <path fill={secondaryColor} d="M89.32,115.16c6.79,0,11.07,4.51,11.07,11.83s-4.25,11.57-10.83,11.57h-7.42v-23.4h7.19ZM89.35,136.09c4.88,0,8.36-3.01,8.36-9.06s-3.48-9.39-8.52-9.39h-4.45v18.45h4.61Z" />
            <path fill={secondaryColor} d="M113.85,129.2h-4.28v9.36h-2.61v-23.4h6.42c5.15,0,8.06,2.74,8.06,7.19,0,3.61-1.91,5.65-4.91,6.35l5.28,9.86h-3.08l-4.88-9.36ZM113.65,127.03c3.04,0,5.15-1.2,5.15-4.61,0-3.21-2.04-4.81-5.42-4.81h-3.81v9.43h4.08Z" />
            <path fill={secondaryColor} d="M131.81,132.41l-2.17,6.15h-2.74l8.52-23.4h3.11l8.56,23.4h-2.77l-2.21-6.15h-10.3ZM138.96,123.59c-.77-2.14-1.94-5.55-1.97-5.58h-.07s-1.2,3.41-1.97,5.55l-2.27,6.45h8.59l-2.31-6.42Z" />
            <path fill={secondaryColor} d="M154.44,131.94c.23,3.08,2.47,4.61,5.82,4.61,3.04,0,4.85-1.3,4.85-3.98,0-3.61-3.28-4.05-5.98-4.95-2.98-.97-6.62-2.24-6.62-6.79,0-3.88,2.67-6.12,7.22-6.12,3.94,0,6.99,1.67,7.82,5.72l-2.51.67c-.57-2.57-2.21-3.98-5.28-3.98s-4.58,1.3-4.58,3.64c0,2.94,2.54,3.74,5.65,4.71,3.28.97,6.95,2.17,6.95,7.02,0,4.28-2.77,6.45-7.56,6.45-3.81,0-7.69-1.4-8.29-6.35l2.51-.67Z" />
          </g>
        </svg>
      </div>
    );

  const isMini = isCollapse == 'mini-sidebar' && !isSidebarHover;

  return (
    <LinkStyled href="/panel">
      {content(isMini)}
    </LinkStyled>
  );
};

export default Logo;

