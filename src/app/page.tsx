'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Stack,
  Chip,
  useTheme,
  alpha,
  Badge,
  IconButton,
  AppBar,
  Toolbar,
  InputBase,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  IconShoppingCart,
  IconSearch,
  IconUser,
  IconHeart,
  IconStar,
  IconTruck,
  IconShield,
  IconLeaf,
  IconSparkles,
  IconMoon,
  IconSun
} from '@tabler/icons-react';
import Link from 'next/link';
import { CarruselDestacados } from '@/components/tienda/CarruselDestacados';
import Logo from '@/app/components/shared/Logo';

const categorias = [
  {
    icono: <IconSparkles size={40} />,
    titulo: 'Cristales y Gemas',
    descripcion: 'Cuarzos, amatistas y piedras energéticas para armonizar tu espacio.',
    productos: 45
  },
  {
    icono: <IconLeaf size={40} />,
    titulo: 'Aceites Esenciales',
    descripcion: 'Aceites puros y naturales para aromaterapia y bienestar.',
    productos: 32
  },
  {
    icono: <IconMoon size={40} />,
    titulo: 'Inciensos y Sahumerios',
    descripcion: 'Fragancias naturales para meditación y relajación.',
    productos: 28
  },
  {
    icono: <IconSun size={40} />,
    titulo: 'Velas Aromáticas',
    descripcion: 'Velas artesanales con esencias naturales y cera de soja.',
    productos: 24
  }
];

const productosDestacados = [
  {
    id: 1,
    nombre: 'Cuarzo Rosa',
    precio: 2500,
    imagen: '/placeholder-crystal.jpg',
    categoria: 'Cristales',
    rating: 4.8,
    enOferta: true,
    precioOriginal: 3200
  },
  {
    id: 2,
    nombre: 'Aceite de Lavanda',
    precio: 1800,
    imagen: '/placeholder-oil.jpg',
    categoria: 'Aceites',
    rating: 4.9,
    enOferta: false
  },
  {
    id: 3,
    nombre: 'Incienso Sándalo',
    precio: 800,
    imagen: '/placeholder-incense.jpg',
    categoria: 'Inciensos',
    rating: 4.7,
    enOferta: true,
    precioOriginal: 1200
  },
  {
    id: 4,
    nombre: 'Vela de Eucalipto',
    precio: 1500,
    imagen: '/placeholder-candle.jpg',
    categoria: 'Velas',
    rating: 4.6,
    enOferta: false
  }
];

const beneficios = [
  {
    icono: <IconTruck size={24} />,
    texto: 'Envío gratis en compras mayores a $5000'
  },
  {
    icono: <IconShield size={24} />,
    texto: 'Garantía de calidad en todos nuestros productos'
  },
  {
    icono: <IconHeart size={24} />,
    texto: 'Productos seleccionados con amor y consciencia'
  },
  {
    icono: <IconLeaf size={24} />,
    texto: '100% naturales y sustentables'
  }
];

export default function TiendaMudras() {
  const theme = useTheme();
  const [carritoItems, setCarritoItems] = useState(0);

  const agregarAlCarrito = () => {
    setCarritoItems(prev => prev + 1);
  };

  return (
    <Box>
      {/* Header E-commerce */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Logo />
            </Box>

            {/* Barra de búsqueda */}
            <Box sx={{
              flexGrow: 1,
              mx: 4,
              display: { xs: 'none', md: 'block' }
            }}>
              <Box sx={{
                position: 'relative',
                backgroundColor: alpha(theme.palette.secondary.light, 0.2),
                borderRadius: 2,
                '&:hover': { backgroundColor: alpha(theme.palette.secondary.light, 0.3) }
              }}>
                <Box sx={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  width: 50
                }}>
                  <IconSearch color={theme.palette.secondary.main} />
                </Box>
                <InputBase
                  placeholder="Buscar productos holísticos..."
                  sx={{
                    color: 'text.primary',
                    width: '100%',
                    '& .MuiInputBase-input': {
                      padding: '12px 12px 12px 50px',
                      '&::placeholder': { color: 'text.secondary' }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Iconos de navegación */}
            <Stack direction="row" spacing={1}>
              <IconButton sx={{ color: 'text.primary' }}>
                <IconUser />
              </IconButton>
              <IconButton
                sx={{ color: 'text.primary' }}
                component={Link}
                href="https://www.instagram.com/mudras_/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconHeart />
              </IconButton>
              <IconButton sx={{ color: 'text.primary' }}>
                <Badge badgeContent={carritoItems} color="primary">
                  <IconShoppingCart />
                </Badge>
              </IconButton>
              <Button
                variant="outlined"
                component={Link}
                href="/login"
                size="small"
                sx={{
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section - Tienda Holística */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha('#ffffff', 1)} 100%)`
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Chip
                  label="🌟 Productos Holísticos Auténticos"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
                <Typography
                  variant="h2"
                  fontWeight={900}
                  gutterBottom
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    mb: 3,
                    color: 'secondary.main'
                  }}
                >
                  Eleva tu{' '}
                  <Typography
                    component="span"
                    variant="inherit"
                    color="primary"
                    sx={{ fontWeight: 'inherit' }}
                  >
                    energía
                  </Typography>{' '}
                  con Mudras
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 4, fontWeight: 300 }}
                >
                  Descubre nuestra colección de cristales, aceites esenciales, inciensos y velas aromáticas.
                  Productos seleccionados para tu bienestar y armonía espiritual.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    href="#productos"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Explorar Productos
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    href="#categorias"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Ver Categorías
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 400 },
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 70%)`,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    overflow: 'hidden'
                  }}
                >
                  <Stack alignItems="center" spacing={2}>
                    <Box sx={{
                      width: '120px',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main'
                    }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 198.43 198.43"
                        width="100%"
                        height="100%"
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
                    </Box>
                    <Typography variant="h5" color="primary" fontWeight={600} textAlign="center">
                      Productos Holísticos
                    </Typography>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      Cristales • Aceites • Inciensos • Velas
                    </Typography>
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Categorías de Productos */}
      <Box id="categorias" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" fontWeight={700} gutterBottom color="secondary.main">
              Nuestras Categorías
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={300}>
              Explora nuestra selección de productos holísticos cuidadosamente elegidos
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {categorias.map((categoria, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[12],
                        '& .categoria-icono': {
                          transform: 'scale(1.1)',
                          color: 'primary.main'
                        }
                      }
                    }}
                  >
                    <Box
                      className="categoria-icono"
                      sx={{
                        color: 'primary.main',
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      {categoria.icono}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {categoria.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {categoria.descripcion}
                    </Typography>
                    <Chip
                      label={`${categoria.productos} productos`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Productos Destacados */}
      <Box id="productos" sx={{ py: { xs: 8, md: 12 }, backgroundColor: alpha(theme.palette.secondary.light, 0.1) }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" fontWeight={700} gutterBottom color="secondary.main">
              Productos Destacados
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={300}>
              Los favoritos de nuestra comunidad
            </Typography>
          </Box>
          {/* Carrusel de destacados */}
          <Box mb={{ xs: 6, md: 8 }}>
            <CarruselDestacados
              items={productosDestacados}
              autoPlayMs={6000}
              onAgregar={() => agregarAlCarrito()}
            />
          </Box>

          <Grid container spacing={4}>
            {productosDestacados.map((producto, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={producto.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="div"
                        sx={{
                          height: 200,
                          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem'
                        }}
                      >
                        {producto.categoria === 'Cristales' && '💎'}
                        {producto.categoria === 'Aceites' && '🌿'}
                        {producto.categoria === 'Inciensos' && '🔥'}
                        {producto.categoria === 'Velas' && '🕯️'}
                      </CardMedia>
                      {producto.enOferta && (
                        <Chip
                          label="OFERTA"
                          color="secondary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontWeight: 600
                          }}
                        />
                      )}
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: alpha('#fff', 0.8),
                          '&:hover': { backgroundColor: '#fff' }
                        }}
                      >
                        <IconHeart size={20} />
                      </IconButton>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="body2" color="primary" fontWeight={500} gutterBottom>
                        {producto.categoria}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {producto.nombre}
                      </Typography>

                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <IconStar size={16} color="#FFD700" fill="#FFD700" />
                        <Typography variant="body2" color="text.secondary">
                          {producto.rating}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                          {producto.enOferta && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textDecoration: 'line-through' }}
                            >
                              ${producto.precioOriginal}
                            </Typography>
                          )}
                          <Typography variant="h6" color="primary" fontWeight={700}>
                            ${producto.precio}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={agregarAlCarrito}
                          startIcon={<IconShoppingCart size={16} />}
                        >
                          Agregar
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Beneficios */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" fontWeight={700} gutterBottom color="secondary.main">
              ¿Por qué elegir Mudras?
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={300}>
              Comprometidos con tu bienestar y la calidad de nuestros productos
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {beneficios.map((beneficio, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box textAlign="center">
                    <Box
                      sx={{
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: '50%',
                        p: 2,
                        display: 'inline-flex',
                        mb: 2
                      }}
                    >
                      {beneficio.icono}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {beneficio.texto}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Newsletter */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'primary.main', color: 'white' }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Mantente conectado con tu energía
            </Typography>
            <Typography variant="h6" fontWeight={300} paragraph sx={{ opacity: 0.9 }}>
              Suscríbete a nuestro newsletter y recibe consejos holísticos, ofertas especiales y novedades sobre nuestros productos.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              mt={4}
              maxWidth="400px"
              mx="auto"
            >
              <InputBase
                placeholder="Tu email"
                sx={{
                  backgroundColor: alpha('#fff', 0.15),
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  flexGrow: 1,
                  '&::placeholder': { color: alpha('#fff', 0.7) }
                }}
              />
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  px: 3,
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.9)
                  }
                }}
              >
                Suscribirse
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, backgroundColor: 'secondary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box mb={2}>
                <Logo />
              </Box>
              <Typography variant="body2" color="grey.300" paragraph>
                Tu tienda de confianza para productos holísticos auténticos.
                Cristales, aceites esenciales, inciensos y velas para elevar tu energía.
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton sx={{ color: 'grey.300' }}>📧</IconButton>
                <IconButton sx={{ color: 'grey.300' }}>📱</IconButton>
                <IconButton sx={{ color: 'grey.300' }}>🌐</IconButton>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Categorías
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Cristales y Gemas
                </Typography>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Aceites Esenciales
                </Typography>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Inciensos
                </Typography>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Velas Aromáticas
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Ayuda
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Guía de Productos
                </Typography>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Envíos y Devoluciones
                </Typography>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Preguntas Frecuentes
                </Typography>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Contacto
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Información
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.300">
                  📍 Dirección de la tienda
                </Typography>
                <Typography variant="body2" color="grey.300">
                  📞 +54 11 1234-5678
                </Typography>
                <Typography variant="body2" color="grey.300">
                  ✉️ hola@mudras.com
                </Typography>
                <Typography variant="body2" color="grey.300">
                  🕒 Lun-Sáb: 10:00-19:00
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Box mt={6} pt={4} borderTop={`1px solid ${alpha('#fff', 0.1)}`}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="body2" color="grey.300">
                © 2024 Mudras. Todos los derechos reservados.
              </Typography>
              <Stack direction="row" spacing={3}>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Términos y Condiciones
                </Typography>
                <Typography variant="body2" color="grey.300" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  Política de Privacidad
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
