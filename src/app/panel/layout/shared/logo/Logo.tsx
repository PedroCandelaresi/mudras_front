'use client'
import { CustomizerContext } from "@/app/context/customizerContext";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import config from '@/app/context/config'
import Image from "next/image";
import { useContext } from "react";

const Logo = () => {
  const { isCollapse, isSidebarHover, activeDir, activeMode } = useContext(CustomizerContext);

  const TopbarHeight = config.topbarHeight;

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,

    width: isCollapse == "mini-sidebar" && !isSidebarHover ? '40px' : '180px',
    overflow: "hidden",
    display: "block",
  }));

  if (activeDir === "ltr") {
    return (
      <LinkStyled href="/panel">
        {isCollapse == "mini-sidebar" && !isSidebarHover ? (
          <div style={{ 
            width: '40px', 
            height: `${TopbarHeight}px`, 
            backgroundColor: '#FF6B35', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            M
          </div>
        ) : (
          <div style={{ 
            height: `${TopbarHeight}px`, 
            display: 'flex',
            alignItems: 'center',
            color: '#FF6B35',
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            Mudras Gestión
          </div>
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/panel">
      {isCollapse == "mini-sidebar" && !isSidebarHover ? (
        <div style={{ 
          width: '40px', 
          height: `${TopbarHeight}px`, 
          backgroundColor: '#FF6B35', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          M
        </div>
      ) : (
        <div style={{ 
          height: `${TopbarHeight}px`, 
          display: 'flex',
          alignItems: 'center',
          color: '#FF6B35',
          fontWeight: 'bold',
          fontSize: '20px'
        }}>
          Mudras Gestión
        </div>
      )}
    </LinkStyled>
  );
};

export default Logo;
