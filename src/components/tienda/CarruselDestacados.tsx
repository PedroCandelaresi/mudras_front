"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Box, Typography, IconButton, useTheme, alpha, Chip, Stack, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from "framer-motion";

export interface DestacadoItem {
  id: number | string;
  nombre: string;
  precio: number;
  imagen?: string; // opcional: podríamos usar next/image más adelante
  categoria?: string;
  rating?: number;
  enOferta?: boolean;
  precioOriginal?: number;
}

interface Props {
  items: DestacadoItem[];
  autoPlayMs?: number;
  onAgregar?: (item: DestacadoItem) => void;
}

export function CarruselDestacados({ items, autoPlayMs = 5000, onAgregar }: Props) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = items.length;
  const actual = items[index] as DestacadoItem | undefined;

  const siguiente = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const anterior = () => setIndex((i) => (i - 1 + total) % total);
  const irA = (i: number) => setIndex(i % total);

  // autoplay controlado
  useEffect(() => {
    if (total <= 1) return;
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => siguiente(), autoPlayMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [index, total, autoPlayMs, siguiente]);

  if (!actual) return null;

  return (
    <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, p: { xs: 1, md: 2 } }}>
      {/* Contenedor principal */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "stretch", gap: { xs: 2, md: 3 } }}>
        {/* Panel visual */}
        <Box sx={{ position: "relative", minHeight: { xs: 220, md: 360 }, bgcolor: alpha(theme.palette.primary.main, 0.06), borderRadius: 2 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={actual.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              style={{ height: "100%" }}
            >
              <Box sx={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 1 }}>
                {actual.enOferta && <Chip color="secondary" size="small" label="OFERTA" />}
                {actual.categoria && <Chip color="primary" variant="outlined" size="small" label={actual.categoria} />}
              </Box>
              <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                <IconButton sx={{ bgcolor: alpha("#fff", 0.8), '&:hover': { bgcolor: '#fff' } }}>
                  <Icon icon="mdi:heart" width={18} />
                </IconButton>
              </Box>
              {/* Placeholder visual del producto */}
              <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: { xs: "3.5rem", md: "5rem" } }}>
                {actual.categoria === 'Cristales' && '💎'}
                {actual.categoria === 'Aceites' && '🌿'}
                {actual.categoria === 'Inciensos' && '🔥'}
                {actual.categoria === 'Velas' && '🕯️'}
                {!actual.categoria && '✨'}
              </Box>
            </motion.div>
          </AnimatePresence>

          {/* Controles */}
          {total > 1 && (
            <>
              <IconButton onClick={anterior} size="small" sx={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)", bgcolor: alpha("#fff", 0.8), '&:hover': { bgcolor: '#fff' } }}>
                <Icon icon="mdi:chevron-left" />
              </IconButton>
              <IconButton onClick={siguiente} size="small" sx={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)", bgcolor: alpha("#fff", 0.8), '&:hover': { bgcolor: '#fff' } }}>
                <Icon icon="mdi:chevron-right" />
              </IconButton>
            </>
          )}
        </Box>

        {/* Panel info */}
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", px: { xs: 1, md: 2 } }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {actual.nombre}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Icon icon="mdi:star" width={16} color="#FFD700" />
            <Typography variant="body2" color="text.secondary">{(actual.rating ?? 4.7).toFixed(1)}</Typography>
          </Stack>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            {actual.enOferta && (
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                ${actual.precioOriginal}
              </Typography>
            )}
            <Typography variant="h4" color="primary" fontWeight={800}>${actual.precio}</Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={3}>
            <Button variant="contained" startIcon={<Icon icon="mdi:shopping-cart" width={18} />} onClick={() => onAgregar?.(actual)}>
              Agregar al carrito
            </Button>
            <Button variant="outlined">Ver detalles</Button>
          </Stack>
          {/* Dots */}
          {total > 1 && (
            <Stack direction="row" spacing={1} mt={3}>
              {items.map((it, i) => (
                <Box key={String(it.id)} onClick={() => irA(i)} sx={{ width: 10, height: 10, borderRadius: '50%', cursor: 'pointer', bgcolor: i === index ? 'primary.main' : alpha(theme.palette.primary.main, 0.3) }} />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
