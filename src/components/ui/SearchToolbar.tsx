"use client";

import React, { useRef } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';

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
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
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
}) => {
  const borderColor = alpha(baseColor, 0.35);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = () => {
    onSubmitSearch();
    // Reforzar que el input mantenga el foco tras buscar
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{ px: 1, py: 1, mb: 2, borderRadius: 0, border: '0px' }}
    >
      {title ? (
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {icon}
          {title}
        </Typography>
      ) : (
        <span />
      )}

      <Box display="flex" alignItems="center" gap={1.5}>
        {canCreate && onCreateClick && (
          <CrystalButton baseColor={baseColor} onClick={onCreateClick}>
            {createLabel}
          </CrystalButton>
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
              backgroundColor: 'rgba(255,255,255,0.65)',
              backdropFilter: 'saturate(125%) blur(0.5px)',
              borderRadius: 2,
            },
            '& .MuiOutlinedInput-root fieldset': {
              borderColor,
            },
            '& .MuiOutlinedInput-root:hover fieldset': {
              borderColor: alpha(baseColor, 0.55),
            },
            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
              borderColor: baseColor,
            },
          }}
        />

        <Tooltip title="Buscar (Enter)">
          <span>
            <CrystalButton
              baseColor={baseColor}
              startIcon={<IconSearch size={18} />}
              onClick={handleSubmit}
              disabled={searchDisabled}
            >
              Buscar
            </CrystalButton>
          </span>
        </Tooltip>

        {onClear && (
          <CrystalSoftButton
            baseColor={baseColor}
            startIcon={<IconRefresh size={18} />}
            onClick={onClear}
          >
            Limpiar filtros
          </CrystalSoftButton>
        )}
      </Box>
    </Box>
  );
};

export default SearchToolbar;
