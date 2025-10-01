'use client';
import {
  Box,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Tooltip,
  Typography,
  InputAdornment,
  TextField,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { IconSearch, IconCategory, IconRefresh, IconEdit, IconTrash, IconEye, IconPlus } from '@tabler/icons-react';
import { BUSCAR_RUBROS } from '@/components/rubros/graphql/queries';
import { BuscarRubrosResponse, RubroConEstadisticas } from '@/app/interfaces/graphql.types';
import { marron, azul, verde } from '@/ui/colores';
import { crearConfiguracionBisel, crearEstilosBisel } from '@/components/ui/bevel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import ModalEditarRubro from './ModalEditarRubro';
import ModalDetallesRubro from './ModalDetallesRubro';
import ModalEliminarRubro from './ModalEliminarRubro';
import CrystalButton, { CrystalIconButton, CrystalSoftButton } from '@/components/ui/CrystalButton';
type Props = {
  onNuevoRubro?: () => void;
  puedeCrear?: boolean;
};

interface Rubro {
  id: number;
  nombre: string;
  codigo?: string;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
}

type RubroParaModal = {
  id: number;
  nombre: string;
  codigo?: string;
  porcentajeRecargo?: number;
  porcentajeDescuento?: number;
  cantidadArticulos?: number;
  cantidadProveedores?: number;
};

const accentExterior = marron.primary;
const accentInterior = marron.borderInner ?? '#4a3b35';
const panelBg = 'rgba(249, 235, 225, 0.72)';
const tableBodyBg = 'rgba(253, 245, 236, 0.55)';
const tableBodyAlt = 'rgba(200, 160, 120, 0.25)';
const woodTintExterior = '#dcb18c';
const woodTintInterior = '#c99c76';

const biselExteriorConfig = crearConfiguracionBisel(accentExterior, 1.5);
const estilosBiselExterior = crearEstilosBisel(biselExteriorConfig, { zContenido: 2 });

const WoodSection: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
      background: 'transparent',
      ...estilosBiselExterior,
    }}
  >
    <WoodBackdrop accent={woodTintExterior} radius={3} inset={0} strength={0.18} texture="tabla" />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundColor: alpha('#fff7ef', 0.78),
        zIndex: 0,
      }}
    />
    <Box sx={{ position: 'relative', zIndex: 2, p: 3 }}>{children}</Box>
  </Box>
);


const colorAccionEliminar = '#c62828';

const TablaRubros: React.FC<Props> = ({ onNuevoRubro, puedeCrear = true }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filtro, setFiltro] = useState('');
  const [filtroInput, setFiltroInput] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnaActiva, setColumnaActiva] = useState<null | 'nombre' | 'codigo'>(null);
  const [filtroColInput, setFiltroColInput] = useState('');
  const [filtrosColumna, setFiltrosColumna] = useState({ nombre: '', codigo: '' });

  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<RubroParaModal | null>(null);
  const [textoConfirmacion, setTextoConfirmacion] = useState('');

  const { data, loading, error, refetch } = useQuery<BuscarRubrosResponse>(BUSCAR_RUBROS, {
    variables: { pagina: page, limite: rowsPerPage, busqueda: filtro || undefined },
    fetchPolicy: 'cache-and-network'
  });

  const abrirMenuColumna = (col: typeof columnaActiva) => (e: React.MouseEvent<HTMLElement>) => {
    setColumnaActiva(col);
    if (col) setFiltroColInput(filtrosColumna[col]);
    setMenuAnchor(e.currentTarget);
  };

  const cerrarMenuColumna = () => {
    setMenuAnchor(null);
    setColumnaActiva(null);
  };

  const handleViewRubro = (rubro: RubroConEstadisticas) => {
    setRubroSeleccionado({
      id: rubro.id,
      nombre: rubro.nombre,
      codigo: rubro.codigo,
      porcentajeRecargo: rubro.porcentajeRecargo,
      porcentajeDescuento: rubro.porcentajeDescuento,
      cantidadArticulos: rubro.cantidadArticulos,
      cantidadProveedores: rubro.cantidadProveedores,
    });
    setModalDetallesOpen(true);
  };

  const handleEditRubro = (rubro: RubroConEstadisticas) => {
    setRubroSeleccionado({
      id: rubro.id,
      nombre: rubro.nombre,
      codigo: rubro.codigo,
      porcentajeRecargo: rubro.porcentajeRecargo,
      porcentajeDescuento: rubro.porcentajeDescuento,
      cantidadArticulos: rubro.cantidadArticulos,
      cantidadProveedores: rubro.cantidadProveedores,
    });
    setModalEditarOpen(true);
  };

  const handleDeleteRubro = (rubro: RubroConEstadisticas) => {
    setRubroSeleccionado({
      id: rubro.id,
      nombre: rubro.nombre,
      codigo: rubro.codigo,
      porcentajeRecargo: rubro.porcentajeRecargo,
      porcentajeDescuento: rubro.porcentajeDescuento,
      cantidadArticulos: rubro.cantidadArticulos,
      cantidadProveedores: rubro.cantidadProveedores,
    });
    setTextoConfirmacion('');
    setModalEliminarOpen(true);
  };

  const handleNuevoRubro = () => {
    setRubroSeleccionado(null);
    setModalEditarOpen(true);
  };

  const cerrarModales = () => {
    setModalEditarOpen(false);
    setModalDetallesOpen(false);
    setModalEliminarOpen(false);
    setRubroSeleccionado(null);
    setTextoConfirmacion('');
  };

  const confirmarEliminacion = async () => {
    if (rubroSeleccionado && textoConfirmacion === 'ELIMINAR') {
      console.log('Eliminando rubro:', rubroSeleccionado);
      cerrarModales();
      refetch();
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const limpiarFiltros = () => {
    setFiltro('');
    setFiltroInput('');
    setFiltrosColumna({ nombre: '', codigo: '' });
    setPage(0);
    refetch();
  };

  const rubros = data?.buscarRubros?.rubros ?? [];
  const total = data?.buscarRubros?.total ?? 0;
  const totalPaginas = Math.ceil(total / rowsPerPage);
  const paginaActual = page + 1;

  const generarNumerosPaginas = () => {
    const paginas: (number | '...')[] = [];
    const maxVisible = 7;
    if (totalPaginas <= maxVisible) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else if (paginaActual <= 4) {
      for (let i = 1; i <= 5; i++) paginas.push(i);
      paginas.push('...', totalPaginas);
    } else if (paginaActual >= totalPaginas - 3) {
      paginas.push(1, '...');
      for (let i = totalPaginas - 4; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas);
    }
    return paginas;
  };

  const toolbar = (
    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1, mb: 2, borderRadius: 0, border: '0px'}}>
      <Typography variant="h6" fontWeight={700} color={marron.textStrong}>
        <IconCategory style={{ marginRight: 8, verticalAlign: 'middle' }} />
        Rubros y Categorías
      </Typography>
      <Box display="flex" alignItems="center" gap={1.5}>
        {puedeCrear && (
          <CrystalButton
            baseColor={marron.primary}
            startIcon={<IconPlus size={18} />}
            onClick={onNuevoRubro || handleNuevoRubro}
          >
            Nuevo Rubro
          </CrystalButton>
        )}
        <TextField
          size="small"
          placeholder="Buscar rubros..."
          value={filtroInput}
          onChange={(e) => setFiltroInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setFiltro(filtroInput);
              setPage(0);
            }
          }}
          InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={20} /></InputAdornment>) }}
          sx={{
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 250, 244, 0.6)',
              backdropFilter: 'saturate(125%) blur(0.5px)',
              borderRadius: 2,
            },
            '& .MuiOutlinedInput-root fieldset': { borderColor: alpha(accentExterior, 0.35) },
            '& .MuiOutlinedInput-root:hover fieldset': { borderColor: alpha(accentExterior, 0.5) },
            '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: marron.primary },
          }}
        />
        <Tooltip title="Buscar (Enter)">
          <span>
            <CrystalButton
              baseColor={marron.primary}
              startIcon={<IconSearch size={18} />}
              onClick={() => { setFiltro(filtroInput); setPage(0); }}
              disabled={loading}
            >
              Buscar
            </CrystalButton>
          </span>
        </Tooltip>
        <CrystalSoftButton
          baseColor={marron.primary}
          startIcon={<IconRefresh />}
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </CrystalSoftButton>
      </Box>
    </Box>
  );

  const tabla = (
    <TableContainer
      sx={{
        position: 'relative',
        borderRadius: 0,
        border: '1px solid',
        borderColor: alpha(accentInterior, 0.38),
        bgcolor: 'rgba(255, 250, 242, 0.94)',
        backdropFilter: 'saturate(110%) blur(0.85px)',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      }}
    >
      <WoodBackdrop accent={woodTintInterior} radius={0} inset={0} strength={0.12} texture="tabla" />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: alpha('#fffaf3', 0.82),
          zIndex: 0,
        }}
      />
      <Table
        stickyHeader
        size="small"
        sx={{
          borderRadius: 0,
          position: 'relative',
          zIndex: 2,
          bgcolor: tableBodyBg,
          '& .MuiTableRow-root': {
            minHeight: 62,
          },
          '& .MuiTableCell-root': {
            fontSize: '0.75rem',
            px: 1,
            py: 1.1,
            borderBottomColor: alpha(accentInterior, 0.35),
            bgcolor: 'transparent',
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root': {
            bgcolor: tableBodyBg,
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
            bgcolor: tableBodyAlt,
          },
          '& .MuiTableBody-root .MuiTableRow-root.MuiTableRow-hover:hover .MuiTableCell-root': {
            bgcolor: alpha('#d9b18a', 0.58),
          },
          '& .MuiTableCell-head': {
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: '#3E2723',
            color: alpha('#FFFFFF', 0.94),
            boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.12)',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Código</TableCell>
            <TableCell align="center">Artículos</TableCell>
            <TableCell align="center">Proveedores</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rubros.map((rubro) => (
            <TableRow key={rubro.id} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={<IconCategory size={18} />}
                    size="medium"
                    sx={{
                      bgcolor: marron.primary,
                      color: '#fff',
                      height: 36,
                      '& .MuiChip-label': {
                        px: 1.1,
                        py: 0.25,
                      },
                    }}
                  />
                  <Typography variant="body2" fontWeight={600}>{rubro.nombre}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={rubro.codigo || 'Sin código'} size="small" sx={{ bgcolor: alpha(accentInterior, 0.18), color: marron.textStrong }} />
              </TableCell>
              <TableCell>{rubro.cantidadArticulos != null ? rubro.cantidadArticulos : 0}</TableCell>
              <TableCell>{rubro.cantidadProveedores != null ? rubro.cantidadProveedores : 0}</TableCell>
              <TableCell align="center">
                <Box display="flex" justifyContent="center" gap={0.5}>
                  <Tooltip title="Ver detalles">
                    <CrystalIconButton
                      baseColor={azul.primary}
                      onClick={() => handleViewRubro(rubro)}
                    >
                      <IconEye size={16} />
                    </CrystalIconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <CrystalIconButton
                      baseColor={verde.primary}
                      onClick={() => handleEditRubro(rubro)}
                    >
                      <IconEdit size={16} />
                    </CrystalIconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <CrystalIconButton
                      baseColor={colorAccionEliminar}
                      onClick={() => handleDeleteRubro(rubro)}
                    >
                      <IconTrash size={16} />
                    </CrystalIconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const paginador = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
      <Typography variant="caption" color="text.secondary">
        Mostrando {Math.min(rowsPerPage, rubros.length)} de {total} rubros
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField select size="small" value={String(rowsPerPage)} onChange={handleChangeRowsPerPage} sx={{ minWidth: 80 }}>
          {[50, 100, 150].map((option) => (<option key={option} value={option}>{option}</option>))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          Página {paginaActual} de {Math.max(1, totalPaginas)}
        </Typography>
        {generarNumerosPaginas().map((num, idx) =>
          num === '...' ? (
            <CrystalSoftButton
              key={idx}
              baseColor={marron.primary}
              disabled
              sx={{ minWidth: 32, minHeight: 30, px: 1, py: 0.25, borderRadius: 2, color: marron.textStrong }}
            >
              ...
            </CrystalSoftButton>
          ) : (
            <CrystalButton
              key={num}
              baseColor={marron.primary}
              sx={{
                minWidth: 32,
                minHeight: 30,
                px: 1,
                py: 0.25,
                borderRadius: 2,
                fontWeight: Number(num) === paginaActual ? 800 : 600,
                boxShadow: 'none',
              }}
              onClick={() => setPage(Number(num) - 1)}
              disabled={num === paginaActual}
            >
              {num}
            </CrystalButton>
          )
        )}
      </Stack>
    </Box>
  );

  if (loading) {
    return (
      <WoodSection>
      </WoodSection>
    );
  }

  if (error) {
    return (
      <WoodSection>
        <Typography color="error" variant="h6" mb={2}>
          Error al cargar rubros
        </Typography>
        <Typography color="text.secondary" mb={2}>
          {error.message}
        </Typography>
        <CrystalButton 
          baseColor={marron.primary}
          startIcon={<IconRefresh />}
          onClick={() => refetch()}
        >
          Reintentar
        </CrystalButton>
      </WoodSection>
    );
  }

  return (
    <>
      <WoodSection>
        {toolbar}
        {tabla}
        {paginador}
      </WoodSection>

      <ModalEditarRubro
        open={modalEditarOpen}
        onClose={cerrarModales}
        rubro={rubroSeleccionado}
        onSuccess={refetch}
        accentColor={marron.primary}
      />

      <ModalDetallesRubro
        open={modalDetallesOpen}
        onClose={cerrarModales}
        rubro={rubroSeleccionado}
      />

      <ModalEliminarRubro
        open={modalEliminarOpen}
        onClose={cerrarModales}
        onConfirm={confirmarEliminacion}
        rubro={rubroSeleccionado}
        textoConfirmacion={textoConfirmacion}
        setTextoConfirmacion={setTextoConfirmacion}
      />
    </>
  );
};

export default TablaRubros;