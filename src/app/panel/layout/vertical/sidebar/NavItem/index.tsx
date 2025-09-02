import React, { useContext } from "react";
import Link from "next/link";

// mui imports
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';
import { CustomizerContext } from "@/app/context/customizerContext";
import { useTranslation } from "react-i18next";
import { ItemType } from "@/app/(DashboardLayout)/types/layout/sidebar";




export default function NavItem({
  item,
  level,
  pathDirect,
  hideMenu,
  onClick,
}: ItemType) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const { isBorderRadius } = useContext(CustomizerContext);
  const Icon = item?.icon;
  const theme = useTheme();
  const { t } = useTranslation();
  

  const itemIcon = Icon ? (
    (level ?? 1) > 1 ? (
      <Icon stroke={1.5} size="0.9rem" />
    ) : (
      <Icon stroke={1.5} size="1.1rem" />
    )
  ) : null;

  const ListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: "nowrap",
    marginBottom: "1px",
    padding: "4px 8px",
    borderRadius: `${isBorderRadius}px`,
    backgroundColor: (level ?? 1) > 1 ? "transparent !important" : "inherit",
    color:
      (level ?? 1) > 1 && pathDirect === item?.href
        ? `${theme.palette.primary.main}!important`
        : theme.palette.text.secondary,
    paddingLeft: "8px", // Padding fijo para evitar desplazamientos
    minHeight: "32px",
    display: "flex",
    alignItems: "center",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
    },
    "&.Mui-selected": {
      color: "white",
      backgroundColor: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
        color: "white",
      },
    },
  }));


  return (
    <List component="li" disablePadding key={item?.id && item.title}>
      <Link href={item.href || ''}>
        <ListItemStyled
          disabled={item?.disabled}
          selected={pathDirect === item?.href}
          onClick={lgDown ? onClick : undefined}
        >
          <ListItemIcon
            sx={{
              minWidth: "40px",
              maxWidth: "40px",
              p: "2px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              color:
                (level ?? 1) > 1 && pathDirect === item?.href
                  ? `${theme.palette.primary.main}!important`
                  : "inherit",
            }}
          >
            {itemIcon}
          </ListItemIcon>
          <ListItemText
            sx={{
              overflow: 'hidden',
              '& .MuiListItemText-primary': {
                fontSize: '0.8rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }
            }}>
            {hideMenu ? "" : <>{t(`${item?.title}`)}</>}
            <br />
            {item?.subtitle ? (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                }}
              >
                {hideMenu ? "" : item?.subtitle}
              </Typography>
            ) : (
              ""
            )}
          </ListItemText>


          {!item?.chip || hideMenu ? null : (
            <Chip
              color={(item?.chipColor as "default" | "error" | "primary" | "secondary" | "info" | "success" | "warning") || "default"}
              variant={(item?.variant as "filled" | "outlined") || "filled"}
              size="small"
              label={item?.chip}
            />
          )}

        </ListItemStyled>
      </Link>
    </List>
  );
}
