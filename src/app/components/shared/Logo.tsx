'use client';
import { CustomizerContext } from '@/app/context/customizerContext';
import Link from 'next/link';
import { styled } from '@mui/material/styles';
import config from '@/app/context/config';
import { useContext } from 'react';

const Logo = () => {
  const { isCollapse, isSidebarHover, activeDir } = useContext(CustomizerContext);
  const TopbarHeight = config.topbarHeight;

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
            fill="#ed8236"
            fillRule="evenodd"
            d="M99.17,61.09c1.58,1.31.05,4.21-3.63,4-11.96-.66-15.17,1.45-15.04,5.58.13,4.04,8.46,9.68,16.84,9.87,7.76.17,15.38-6.51,18.02-4.98,3.31,1.92-11.58,11.72-18.24,11.72-15.11,0-27.49-11.98-27.49-20.01,0-6.04,13.17-7.88,22.16-7.81,2.97.02,6.34.76,7.39,1.63Z"
          />
          <path
            fill="#ed8236"
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
          width="50"
          height="50"
        >
          <path
            fill="#ed8236"
            fillRule="evenodd"
            d="M99.17,61.09c1.58,1.31.05,4.21-3.63,4-11.96-.66-15.17,1.45-15.04,5.58.13,4.04,8.46,9.68,16.84,9.87,7.76.17,15.38-6.51,18.02-4.98,3.31,1.92-11.58,11.72-18.24,11.72-15.11,0-27.49-11.98-27.49-20.01,0-6.04,13.17-7.88,22.16-7.81,2.97.02,6.34.76,7.39,1.63Z"
          />
          <path
            fill="#ed8236"
            fillRule="evenodd"
            d="M101.06,61.09c-1.58,1.31-.05,4.21,3.63,4,11.96-.66,15.17,1.45,15.04,5.58-.13,4.03-2.62,9.66-9.85,13.9-2.89,1.7-7.22,3.28-12.1,4.06-5.7.91-12.02-1.8-14.88.99-2.73,2.68,10.86,5.09,17.53,5.09,15.11,0,30.18-19.41,30.18-27.45,0-6.04-13.17-7.88-22.16-7.81-2.98.02-6.34.76-7.39,1.63Z"
          />
        </svg>
        <span
          style={{
            color: '#66655f',
            fontWeight: 'bold',
            fontSize: '24px',
            letterSpacing: '-0.5px',
          }}
        >
          Mudras
        </span>
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

