"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Box, Button, Chip, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from '@mui/material';
import { IconEdit, IconTrash, IconUserShield } from '@tabler/icons-react';

export interface UsuarioListado {
  id: string;
  username: string | null;
  email: string | null;
  displayName: string;
  userType: 'EMPRESA' | 'CLIENTE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: string[];
}

interface Props {
  onCrear?: () => void;
  onEditar?: (u: UsuarioListado) => void;
  onRoles?: (u: UsuarioListado) => void;
  onEliminar?: (u: UsuarioListado) => void;
  refetchToken?: number | string;
}

export function UserTable({ onCrear, onEditar, onRoles, onEliminar, refetchToken }: Props) {
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [limite, setLimite] = useState(20);
  const [total, setTotal] = useState(0);
  const [usuarios, setUsuarios] = useState<UsuarioListado[]>([]);

  async function cargar() {
    try {
      setCargando(true);
      const res = await apiFetch<{ items: UsuarioListado[]; total: number }>(`/users?pagina=${pagina}&limite=${limite}`);
      setUsuarios(res.items);
      setTotal(res.total);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, limite, refetchToken]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button variant="contained" onClick={onCrear}>Nuevo Usuario</Button>
        {cargando && <CircularProgress size={20} />}
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.username ?? '-'}</TableCell>
                <TableCell>{u.email ?? '-'}</TableCell>
                <TableCell>{u.displayName}</TableCell>
                <TableCell>
                  <Chip size="small" label={u.userType} color={u.userType === 'EMPRESA' ? 'primary' : 'default'} />
                </TableCell>
                <TableCell>
                  {(u.roles ?? []).map((r) => (
                    <Chip key={r} label={r} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={u.isActive ? 'Activo' : 'Inactivo'} color={u.isActive ? 'success' : 'warning'} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => onEditar?.(u)}>
                      <IconEdit size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Roles">
                    <IconButton onClick={() => onRoles?.(u)}>
                      <IconUserShield size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton color="error" onClick={() => onEliminar?.(u)}>
                      <IconTrash size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={pagina}
        onPageChange={(_, p) => setPagina(p)}
        rowsPerPage={limite}
        onRowsPerPageChange={(e) => { setLimite(parseInt(e.target.value, 10)); setPagina(0); }}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Box>
  );
}
