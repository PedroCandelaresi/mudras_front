'use client'
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import { CustomizerContext } from '@/app/context/customizerContext';
import { useContext } from 'react';
import { usePathname } from 'next/navigation';

type Props = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode | any;
  footer?: React.ReactNode;
  cardheading?: string | React.ReactNode;
  headtitle?: string | React.ReactNode;
  headsubtitle?: string | React.ReactNode;
  children?: React.ReactNode;
  middlecontent?: string | React.ReactNode;
};

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  cardheading,
  headtitle,
  headsubtitle,
  middlecontent,
}: Props) => {
  const { isCardShadow } = useContext(CustomizerContext);
  const pathname = usePathname();

  const theme = useTheme();
  let borderColor = theme.palette.divider;
  
  // Aplicar colores específicos según la ruta
  if (pathname?.includes('/rubros') || pathname?.includes('/proveedores/rubros')) {
    borderColor = '#f8bbd9'; // Rosa pastel para rubros
  } else if (pathname?.includes('/proveedores')) {
    borderColor = '#bbdefb'; // Azul pastel para proveedores
  } else if (pathname?.includes('/articulos')) {
    borderColor = '#c8e6c9'; // Verde oliva para artículos
  }

  return (
    <Card
      sx={{ 
        padding: 0, 
        border: !isCardShadow ? `2px solid ${borderColor}` : 'none',
        borderRadius: 2,
        ...((pathname?.includes('/rubros') || pathname?.includes('/proveedores/rubros')) && {
          backgroundColor: '#fdf2f8',
          '&:hover': {
            borderColor: '#f48fb1',
            boxShadow: '0 4px 12px rgba(244, 143, 177, 0.15)'
          }
        }),
        ...(pathname?.includes('/proveedores') && {
          backgroundColor: '#f3f8ff',
          '&:hover': {
            borderColor: '#2196f3',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
          }
        }),
        ...(pathname?.includes('/articulos') && {
          backgroundColor: '#f1f8e9',
          '&:hover': {
            borderColor: '#4caf50',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
          }
        })
      }}
      elevation={isCardShadow ? 9 : 0}
      variant={!isCardShadow ? 'outlined' : undefined}
    >
      {cardheading ? (
        <CardContent>
          <Typography variant="h5">{headtitle}</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {headsubtitle}
          </Typography>
        </CardContent>
      ) : (
        <CardContent sx={{ p: "30px" }}>
          {title ? (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems={'center'}
              mb={3}
            >
              <Box>
                {title ? <Typography variant="h5">{title}</Typography> : ''}

                {subtitle ? (
                  <Typography variant="subtitle2" color="textSecondary">
                    {subtitle}
                  </Typography>
                ) : (
                  ''
                )}
              </Box>
              {action}
            </Stack>
          ) : null}

          {children}
        </CardContent>
      )}

      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;
