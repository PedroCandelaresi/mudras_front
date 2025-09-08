"use client";

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

export interface PuntoBarra {
  etiqueta: string;
  valor: number;
  color?: string;
}

interface Props {
  titulo: string;
  datos: PuntoBarra[];
  alto?: number;
  maxValor?: number; // si no se pasa, se calcula
  anchoBarra?: number; // ancho de cada barra (px)
  colorBorde?: string;
  fondo?: string;
}

export function GraficoBarras({ titulo, datos, alto = 240, maxValor, anchoBarra = 64, colorBorde = 'divider', fondo = 'background.paper' }: Props) {
  const max = maxValor ?? Math.max(1, ...datos.map(d => d.valor));
  const barsAreaHeight = Math.max(80, alto - 32);
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{titulo}</Typography>
      <Box sx={{ p: 2, border: '1px solid', borderColor: colorBorde, borderRadius: 2, bgcolor: fondo }}>
        <Box display="flex" alignItems="stretch" gap={2} sx={{ overflowX: 'auto' }}>
          {datos.map((d) => {
            const altura = Math.max(4, (d.valor / max) * (barsAreaHeight - 4));
            return (
              <Tooltip key={d.etiqueta} title={`${d.etiqueta}: ${d.valor}`}>
                <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: anchoBarra }}>
                  <Box sx={{ height: barsAreaHeight, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Box sx={{ width: anchoBarra, height: altura, borderRadius: 1, bgcolor: d.color || 'primary.main' }} />
                  </Box>
                  <Typography variant="caption" noWrap sx={{ mt: 0.75, width: anchoBarra, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.etiqueta}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default GraficoBarras;
