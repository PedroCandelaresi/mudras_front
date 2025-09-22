'use client';

import React, { useState, useCallback } from 'react';
import { Box, Grid, Typography, Alert, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { BusquedaArticulos } from '../../../../components/caja-registradora/BusquedaArticulos';
import { TablaArticulosCapturados } from '../../../../components/caja-registradora/TablaArticulosCapturados';
import { ModalConfirmacionVenta } from '../../../../components/caja-registradora/ModalConfirmacionVenta';
import { HistorialVentas } from '../../../../components/caja-registradora/HistorialVentas';
import { ArticuloConStock } from '../../../../queries/caja-registradora';
import { TexturedPanel } from '@/app/components/ui-components/TexturedFrame/TexturedPanel';

interface ArticuloCapturado extends ArticuloConStock {
  Unidad: string;
  Rubro: string;
  proveedor: {
    IdProveedor: number;
    Nombre: string;
  };
  cantidad: number;
  subtotal: number;
  seleccionado: boolean;
}

export default function CajaRegistradoraPage() {
  const [puestoVentaId] = useState(1); // Por defecto mostrador principal
  const [articulos, setArticulos] = useState<ArticuloCapturado[]>([]);
  const [modalVentaAbierto, setModalVentaAbierto] = useState(false);
  const [vistaActual, setVistaActual] = useState<'caja' | 'historial'>('caja');
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
  const mostrarMensaje = (texto: string, tipo: 'success' | 'error' | 'info' = 'info') => {
    setMensaje({ texto, tipo });
  };

  // Calcular artículos en carrito para validaciones de stock
  const articulosEnCarrito = articulos.reduce((acc, art) => {
    acc[art.id] = art.cantidad;
    return acc;
  }, {} as { [key: number]: number });

  // Agregar artículo al carrito
  const handleAgregarArticulo = useCallback((articulo: ArticuloConStock, cantidad: number) => {
    setArticulos(prev => {
      const existente = prev.find(a => a.id === articulo.id);
      
      if (existente) {
        // Actualizar cantidad si ya existe
        return prev.map(a => 
          a.id === articulo.id 
            ? {
                ...a,
                cantidad: a.cantidad + cantidad,
                subtotal: (a.cantidad + cantidad) * a.PrecioVenta,
              }
            : a
        );
      } else {
        // Agregar nuevo artículo
        return [...prev, {
          ...articulo,
          Unidad: 'UN', // Valor por defecto
          Rubro: articulo.rubro?.Descripcion || 'Sin rubro',
          proveedor: {
            IdProveedor: 0,
            Nombre: 'Sin proveedor'
          },
          cantidad,
          subtotal: cantidad * articulo.PrecioVenta,
          seleccionado: true, // Por defecto seleccionado
        }];
      }
    });

    setMensaje({
      tipo: 'success',
      texto: `${articulo.Descripcion} agregado al carrito (${cantidad} unidades)`,
    });
  }, []);

  // Actualizar cantidad de artículo
  const handleActualizarCantidad = useCallback((articuloId: number, nuevaCantidad: number) => {
    setArticulos(prev => 
      prev.map(a => 
        a.id === articuloId 
          ? {
              ...a,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * a.PrecioVenta,
            }
          : a
      )
    );
  }, []);

  // Eliminar artículo del carrito
  const handleEliminarArticulo = useCallback((articuloId: number) => {
    setArticulos(prev => prev.filter(a => a.id !== articuloId));
    setMensaje({
      tipo: 'info',
      texto: 'Artículo eliminado del carrito',
    });
  }, []);

  // Toggle selección de artículo
  const handleToggleSeleccion = useCallback((articuloId: number) => {
    setArticulos(prev => 
      prev.map(a => 
        a.id === articuloId 
          ? { ...a, seleccionado: !a.seleccionado }
          : a
      )
    );
  }, []);

  // Toggle selección de todos los artículos
  const handleToggleSeleccionTodos = useCallback(() => {
    const todosSeleccionados = articulos.every(a => a.seleccionado);
    setArticulos(prev => 
      prev.map(a => ({ ...a, seleccionado: !todosSeleccionados }))
    );
  }, [articulos]);

  // Abrir modal de nueva venta
  const handleNuevaVenta = useCallback(() => {
    const articulosSeleccionados = articulos.filter(a => a.seleccionado);
    if (articulosSeleccionados.length > 0) {
      setModalVentaAbierto(true);
    }
  }, [articulos]);

  // Venta creada exitosamente
  const handleVentaCreada = useCallback((venta: any) => {
    setMensaje({
      tipo: 'success',
      texto: `Venta ${venta.numeroVenta} creada exitosamente`,
    });

    // Limpiar artículos seleccionados del carrito
    setArticulos(prev => prev.filter(a => !a.seleccionado));
    
    // Cambiar a vista de historial para ver la venta
    setVistaActual('historial');
  }, []);

  // Cerrar mensaje
  const handleCerrarMensaje = () => {
    setMensaje(null);
  };

  // Calcular estados de selección
  const articulosSeleccionados = articulos.filter(a => a.seleccionado);
  const todosSeleccionados = articulos.length > 0 && articulos.every(a => a.seleccionado);
  const algunoSeleccionado = articulosSeleccionados.length > 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Caja Registradora
          </Typography>
          
          {/* Navegación entre vistas */}
          <Box display="flex" gap={1}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setVistaActual('caja')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: vistaActual === 'caja' ? '#1976d2' : '#f5f5f5',
                  color: vistaActual === 'caja' ? 'white' : '#666',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Caja
              </button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setVistaActual('historial')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: vistaActual === 'historial' ? '#1976d2' : '#f5f5f5',
                  color: vistaActual === 'historial' ? 'white' : '#666',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Historial
              </button>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* Contenido principal */}
      <motion.div
        key={vistaActual}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {vistaActual === 'caja' ? (
          <Grid container spacing={3}>
            {/* Panel izquierdo - Búsqueda */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <BusquedaArticulos
                  puestoVentaId={puestoVentaId}
                  onAgregarArticulo={handleAgregarArticulo}
                  articulosEnCarrito={articulosEnCarrito}
                />
              </motion.div>
            </Grid>

            {/* Panel derecho - Carrito */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TexturedPanel
                  accent="#1976d2"
                  radius={14}
                  contentPadding={12}
                  bgTintPercent={22}
                  bgAlpha={0.98}
                  tintMode="soft-light"
                  tintOpacity={0.42}
                  textureScale={1.1}
                  textureBaseOpacity={0.18}
                  textureBoostOpacity={0.12}
                  textureContrast={0.92}
                  textureBrightness={1.03}
                  bevelWidth={12}
                  bevelIntensity={1.0}
                  glossStrength={1.0}
                  vignetteStrength={0.9}
                >
                  <TablaArticulosCapturados
                    articulos={articulos}
                    onActualizarCantidad={handleActualizarCantidad}
                    onEliminarArticulo={handleEliminarArticulo}
                    onToggleSeleccion={handleToggleSeleccion}
                    onToggleSeleccionTodos={handleToggleSeleccionTodos}
                    onNuevaVenta={handleNuevaVenta}
                    todosSeleccionados={todosSeleccionados}
                    algunoSeleccionado={algunoSeleccionado}
                  />
                </TexturedPanel>
              </motion.div>
            </Grid>
          </Grid>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TexturedPanel
              accent="#1976d2"
              radius={14}
              contentPadding={12}
              bgTintPercent={22}
              bgAlpha={0.98}
              tintMode="soft-light"
              tintOpacity={0.42}
              textureScale={1.1}
              textureBaseOpacity={0.18}
              textureBoostOpacity={0.12}
              textureContrast={0.92}
              textureBrightness={1.03}
              bevelWidth={12}
              bevelIntensity={1.0}
              glossStrength={1.0}
              vignetteStrength={0.9}
            >
              <HistorialVentas />
            </TexturedPanel>
          </motion.div>
        )}
      </motion.div>

      {/* Modal de confirmación de venta */}
      <ModalConfirmacionVenta
        open={modalVentaAbierto}
        onClose={() => setModalVentaAbierto(false)}
        articulos={articulosSeleccionados.map(a => ({
          id: a.id,
          Codigo: a.Codigo,
          Descripcion: a.Descripcion,
          cantidad: a.cantidad,
          precioUnitario: a.PrecioVenta,
          subtotal: a.subtotal,
        }))}
        onVentaCreada={handleVentaCreada}
      />

      {/* Snackbar para mensajes */}
      {mensaje && (
        <Snackbar
          open={!!mensaje}
          autoHideDuration={6000}
          onClose={() => setMensaje(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setMensaje(null)}
            severity={mensaje.tipo}
            sx={{ width: '100%' }}
          >
            {mensaje.texto}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
