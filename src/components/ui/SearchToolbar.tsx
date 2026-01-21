"use client";

import React, { useRef, memo } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Tooltip,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { IconSearch, IconRefresh } from '@tabler/icons-react';

export interface SearchToolbarProps {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  /**
   * Color base para botones principales (ej: verde.primary, azul.primary).
   */
  baseColor: string;
  /**
   * Placeholder para el input de búsqueda.
   */
  placeholder?: string;
  /**
   * Valor actual del input de búsqueda (controlado).
   */
  searchValue: string;
  /**
   * Actualiza el valor del input de búsqueda.
   */
  onSearchValueChange: (value: string) => void;
  /**
   * Ejecutar la búsqueda: se dispara al presionar Enter o al hacer click en el botón Buscar.
   */
  onSubmitSearch: () => void;
  /**
   * Limpiar filtros/búsqueda. Opcional.
   */
  onClear?: () => void;
  /**
   * ¿Mostrar botón de crear?
   */
  canCreate?: boolean;
  createLabel?: string;
  onCreateClick?: () => void;
  /**
   * ¿Deshabilitar botón Buscar? (ej. mientras loading).
   */
  searchDisabled?: boolean;
  /**
   * Elementos personalizados adicionales (botones, etc.)
   */
  customActions?: React.ReactNode;
}

const SearchToolbarInner: React.FC<SearchToolbarProps> = ({
  title,
  icon,
  baseColor,
  placeholder = 'Buscar…',
  searchValue,
  onSearchValueChange,
  onSubmitSearch,
  onClear,
  canCreate,
  createLabel = 'Nuevo',
  onCreateClick,
  searchDisabled,
  customActions,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = () => {
    onSubmitSearch();
    // Mantener el foco en el input tras buscar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{ px: 1, py: 1, mb: 2 }}
    >
      {title ? (
        <Box
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.primary',
            typography: 'h6',
            fontWeight: 700
          }}
        >
          {icon && <Box component="span" sx={{ display: 'flex', color: baseColor }}>{icon}</Box>}
          {title}
        </Box>
      ) : (
        <span />
      )}

      <Box display="flex" alignItems="center" gap={1.5}>
        {customActions}

        {canCreate && onCreateClick && (
          <Button
            variant="contained"
            onClick={onCreateClick}
            sx={{ bgcolor: baseColor, '&:hover': { bgcolor: baseColor } }}
          >
            {createLabel}
          </Button>
        )}

        <TextField
          size="small"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          inputRef={inputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
            },
            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
              borderColor: baseColor,
            },
          }}
        />

        <Tooltip title="Buscar (Enter)">
          <Button
            variant="outlined"
            onClick={handleSubmit}
            disabled={searchDisabled}
            sx={{ color: baseColor, borderColor: alpha(baseColor, 0.5), '&:hover': { borderColor: baseColor, bgcolor: alpha(baseColor, 0.05) } }}
          >
            Buscar
          </Button>
        </Tooltip>

        {onClear && (
          <Tooltip title="Limpiar filtros">
            <IconButton
              onClick={onClear}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            >
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export const SearchToolbar = memo(SearchToolbarInner);
export default SearchToolbar;
