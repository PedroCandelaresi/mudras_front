'use client';

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useApolloClient, useQuery } from '@apollo/client/react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  BUSCAR_ARTICULOS_CAJA,
  type BuscarArticulosCajaResponse,
  type ArticuloCaja,
} from '@/components/ventas/caja-registradora/graphql/queries';
import { naranjaCaja } from '@/ui/colores';
import { calcularPrecioDesdeArticulo } from '@/utils/precioVenta';


interface Props {
  puntoMudrasId?: number; // <-- ahora opcional
  onAgregarArticulo: (articulo: ArticuloCaja, cantidad: number) => void;
  articulosEnCarrito: Record<number, number>;
}

export const BusquedaArticulos: React.FC<Props> = ({ puntoMudrasId, onAgregarArticulo }) => {
  const apollo = useApolloClient();

  // control del Autocomplete
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (puntoMudrasId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [puntoMudrasId]);

  // consulta para el dropdown (solo cuando hay input, está abierto y hay punto)
  const { data, loading } = useQuery<BuscarArticulosCajaResponse>(BUSCAR_ARTICULOS_CAJA, {
    variables: { input: { nombre: input.trim() || undefined, puntoMudrasId, limite: 20 } },
    skip: !puntoMudrasId || input.trim().length < 2 || !open,
    fetchPolicy: 'cache-and-network',
  });

  const opciones = useMemo<ArticuloCaja[]>(
    () => data?.buscarArticulosCaja ?? [],
    [data]
  );

  // agregar por código (escáner / Enter)
  const agregarPorCodigo = useCallback(
    async (raw: string) => {
      const codigo = raw.trim();
      if (!codigo || !puntoMudrasId) return false;

      const res = await apollo.query<BuscarArticulosCajaResponse>({
        query: BUSCAR_ARTICULOS_CAJA,
        variables: { input: { codigoBarras: codigo, puntoMudrasId, limite: 1 } },
        fetchPolicy: 'no-cache',
      });

      const match = res.data?.buscarArticulosCaja?.[0];
      if (match) {
        onAgregarArticulo(match, 1);
        setInput('');
        setOpen(false);
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
        return true;
      }
      return false;
    },
    [apollo, onAgregarArticulo, puntoMudrasId]
  );

  // === Marco translúcido que se conserva SIEMPRE ===
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: alpha('#ffffff', 0.5),
        p: 4,                 // mismo padding que tu placeholder
        height: '100%',       // 👈 igual que el placeholder (no fija alto propio)
        display: 'flex',
        alignItems: 'center',           // centra vertical
        justifyContent: 'center',       // centra horizontal
      }}
    >
      <Box sx={{ width: 'min(720px, 100%)' }}>
        {!puntoMudrasId ? (
          // === Estado informativo (sin punto): input “fantasma” + leyenda ===
          <>
            <TextField
              fullWidth
              disabled
              placeholder="Buscar por código o descripción…"
              InputProps={{
                readOnly: true, // evita foco/halo
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'background .2s ease, box-shadow .2s ease, border-color .2s ease',
                  backgroundColor: 'transparent',
                  backgroundImage: 'none',
                  borderRadius: 2,
                  '& fieldset': { borderColor: alpha(naranjaCaja.borderInner, 0.2) },
                },
                '& .MuiOutlinedInput-input': {
                  color: alpha(naranjaCaja.textStrong, 0.92),
                  fontWeight: 700,
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: 'center' }}>
              Selecciona un punto de venta para comenzar a buscar artículos
            </Typography>
          </>
        ) : (
          // === Con punto: Autocomplete freeSolo (Enter = agregar por código) ===
          <Autocomplete<ArticuloCaja, false, false, true>
            freeSolo
            disablePortal
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            inputValue={input}
            onInputChange={(_, v) => setInput(v)}
            options={opciones}
            loading={loading}
            filterOptions={(x) => x} // el server filtra
            isOptionEqualToValue={(o, v) => o.id === v.id}
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.Descripcion ?? '')}
            noOptionsText={input.trim().length < 2 ? 'Escribe al menos 2 caracteres…' : 'Sin resultados'}
            onChange={(_, value) => {
              if (value && typeof value !== 'string') {
                onAgregarArticulo(value, 1);
                setInput('');
                setOpen(false);
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
              }
            }}
            renderInput={(params) => {
              const handleRef = (node: HTMLInputElement | null) => {
                const inputPropsRef = params.InputProps.ref;
                if (typeof inputPropsRef === 'function') {
                  inputPropsRef(node);
                } else if (inputPropsRef && 'current' in inputPropsRef) {
                  (inputPropsRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
                }
                inputRef.current = node;
              };

              return (
                <TextField
                  {...params}
                  label="Buscar o escanear"
                  placeholder="Escaneá el código y presioná Enter…"
                  inputRef={handleRef}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const ok = await agregarPorCodigo(input);
                      if (ok) return;
                      if (input.trim().length >= 2) setOpen(true);
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      // estética similar a la anterior (fondo muy claro + borde sutil)
                      backgroundColor: alpha('#fffaf3', 0.72),
                      backdropFilter: 'saturate(120%) blur(1px)',
                      borderRadius: 2,
                      '& fieldset': { borderColor: alpha(naranjaCaja.borderInner, 0.28) },
                      '&:hover fieldset': { borderColor: alpha(naranjaCaja.borderInner, 0.42) },
                      '&.Mui-focused fieldset': { borderColor: naranjaCaja.primary },
                    },
                  }}
                />
              );
            }}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                },
              },
              listbox: { sx: { maxHeight: 280 } },
              popper: { sx: { zIndex: (t) => t.zIndex.modal + 1 } },
            }}
            renderOption={(props, a) => (
              <li {...props} key={a.id}>
                <Box display="flex" flexDirection="column" sx={{ width: '100%' }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {a.Descripcion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    #{a.Codigo ?? 's/c'} · {a.Rubro ?? 'Sin rubro'} · $
                    {(calcularPrecioDesdeArticulo(a) || Number(a.PrecioVenta ?? 0)).toLocaleString('es-AR')}
                  </Typography>
                </Box>
              </li>
            )}
          />
        )}
      </Box>
    </Box>
  );
};
