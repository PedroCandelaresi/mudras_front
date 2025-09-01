import ListSubheader from '@mui/material/ListSubheader';
import { Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { IconDots } from '@tabler/icons-react';
import React from 'react';

type NavGroup = {
  navlabel?: boolean;
  subheader?: string;
};

interface ItemType {
  item: NavGroup;
  hideMenu: string | boolean;
}

const NavGroup = ({ item, hideMenu }: ItemType) => {
  const ListSubheaderStyle = styled((props: Theme | any) => (
    <ListSubheader disableSticky {...props} />
  ))(({ theme }) => ({
    ...theme.typography.overline,
    fontWeight: '600',
    fontSize: '0.7rem',
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
    color: 'text.Primary',
    lineHeight: '20px',
    padding: '2px 8px',
    marginLeft: hideMenu ? '' : '-8px',
  }));

  return (
    <ListSubheaderStyle>{hideMenu ? <IconDots size="14" /> : item?.subheader}</ListSubheaderStyle>
  );
};

export default NavGroup;
