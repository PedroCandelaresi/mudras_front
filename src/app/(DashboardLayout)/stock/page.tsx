'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  TrendingDown as TrendingDownIcon,
  LocalOffer as LocalOfferIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Edit, Delete, QrCode, Visibility } from '@mui/icons-material';

import { BUSCAR_ARTICULOS, GET_ESTADISTICAS_ARTICULOS } from '@/components/articulos/graphql/queries';
import { 
  Articulo, 
  FiltrosArticulo, 
  EstadoArticulo, 
  BuscarArticulosResponse, 
  EstadisticasArticulosResponse 
} from '@/interfaces/articulo';
import ModalArticulo from '@/components/stock/ModalArticulo';
import FiltrosAvanzados from '@/components/stock/FiltrosAvanzados';
import EstadisticasStock from '@/components/stock/EstadisticasStock';

export default function StockPage() {
  const [filtros, setFiltros] = useState<FiltrosArticulo>({
    pagina: 0,
    limite: 50,
    ordenarPor: 'Descripcion',
    direccionOrden: 'ASC'
  });
  
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { data: dataArticulos, loading: loadingArticulos, refetch } = useQuery<BuscarArticulosResponse>(BUSCAR_ARTICULOS, {
    variables: { filtros },
    fetchPolicy: 'cache-and-network'
  });

  const { data: dataEstadisticas } = useQuery<EstadisticasArticulosResponse>(GET_ESTADISTICAS_ARTICULOS, {
    fetchPolicy: 'cache-and-network'
  });

  const handleBuscar = () => {
    setFiltros(prev => ({
      ...prev,
      busqueda: busquedaTexto,
      pagina: 0
    }));
  };

  const handleCrearArticulo = () => {
    setArticuloSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEditarArticulo = (articulo: Articulo) => {
    setArticuloSeleccionado(articulo);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setArticuloSeleccionado(null);
    refetch();
  };

  const getEstadoChip = (estado: EstadoArticulo) => {
    const colores = {
      [EstadoArticulo.ACTIVO]: 'success',
      [EstadoArticulo.INACTIVO]: 'default',
      [EstadoArticulo.DESCONTINUADO]: 'error'
    } as const;
    
    return (
      <Chip 
        label={estado} 
        color={colores[estado]} 
        size="small" 
        variant="outlined"
      />
    );
  };

  const getStockChip = (articulo: Articulo) => {
    const deposito = articulo.Deposito || 0;
    const stockMinimo = articulo.StockMinimo || 0;
    
    if (deposito <= 0) {
      return <Chip label="Sin stock" color="error" size="small" />;
    }
    
    if (deposito <= stockMinimo && stockMinimo > 0) {
      return <Chip label="Stock bajo" color="warning" size="small" />;
    }
    
    return <Chip label="Stock OK" color="success" size="small" />;
  };

  const columns: GridColDef[] = [
    {
      field: 'Codigo',
      headerName: 'Código',
      width: 120,
      renderCell: (params: any) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'Descripcion',
      headerName: 'Descripción',
      width: 250,
      renderCell: (params: any) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          {params.row.Marca && (
            <Typography variant="caption" color="textSecondary">
              {params.row.Marca}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'PrecioVenta',
      headerName: 'Precio',
      width: 100,
      type: 'number',
      renderCell: (params: any) => (
        <Typography variant="body2" fontWeight="bold">
          ${params.value?.toFixed(2)}
        </Typography>
      )
    },
    {
      field: 'Deposito',
      headerName: 'Stock',
      width: 120,
      renderCell: (params: any) => (
        <Box>
          <Typography variant="body2">
            {params.value || 0} {params.row.Unidad || 'u'}
          </Typography>
          {getStockChip(params.row)}
        </Box>
      )
    },
    {
      field: 'promociones',
      headerName: 'Promociones',
      width: 120,
      renderCell: (params: any) => (
        <Box display="flex" gap={0.5}>
          {params.row.EnPromocion && (
            <Chip 
              icon={<LocalOfferIcon />} 
              label="Promo" 
              color="secondary" 
              size="small" 
            />
          )}
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 120,
      getActions: (params: any) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Editar"
          onClick={() => handleEditarArticulo(params.row)}
        />,
        <GridActionsCellItem
          key="view"
          icon={<Visibility />}
          label="Ver"
          onClick={() => console.log('Ver', params.row)}
        />,
        <GridActionsCellItem
          key="barcode"
          icon={<QrCode />}
          label="Código de barras"
          onClick={() => console.log('Código de barras', params.row)}
        />
      ]
    }
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestión de Stock
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCrearArticulo}
          size="large"
        >
          Nuevo Artículo
        </Button>
      </Box>

      {/* Estadísticas */}
      {dataEstadisticas?.estadisticasArticulos && (
        <EstadisticasStock estadisticas={dataEstadisticas.estadisticasArticulos} />
      )}

      {/* Barra de búsqueda y filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
            <Box>
              <TextField
                fullWidth
                placeholder="Buscar por código, descripción o marca..."
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={handleBuscar}>Buscar</Button>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <Box>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Tooltip title="Filtros avanzados">
                  <IconButton 
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    color={mostrarFiltros ? 'primary' : 'default'}
                  >
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="outlined"
                  onClick={() => setFiltros(prev => ({ ...prev, soloStockBajo: !prev.soloStockBajo }))}
                  color={filtros.soloStockBajo ? 'warning' : 'inherit'}
                  startIcon={<TrendingDownIcon />}
                >
                  Stock Bajo
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => setFiltros(prev => ({ ...prev, soloEnPromocion: !prev.soloEnPromocion }))}
                  color={filtros.soloEnPromocion ? 'secondary' : 'inherit'}
                  startIcon={<LocalOfferIcon />}
                >
                  En Promoción
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Filtros avanzados */}
      {mostrarFiltros && (
        <FiltrosAvanzados
          filtros={filtros}
          onChange={setFiltros}
          onClose={() => setMostrarFiltros(false)}
        />
      )}

      {/* Tabla de artículos */}
      <Card>
        <DataGrid
          rows={dataArticulos?.buscarArticulos?.articulos || []}
          columns={columns}
          loading={loadingArticulos}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={{
            page: filtros.pagina,
            pageSize: filtros.limite
          }}
          onPaginationModelChange={(model: any) => {
            setFiltros(prev => ({
              ...prev,
              pagina: model.page,
              limite: model.pageSize
            }));
          }}
          rowCount={dataArticulos?.buscarArticulos?.total || 0}
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={(model: any) => {
            if (model.length > 0) {
              setFiltros(prev => ({
                ...prev,
                ordenarPor: model[0].field,
                direccionOrden: model[0].sort?.toUpperCase() as 'ASC' | 'DESC'
              }));
            }
          }}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8f9fa'
            }
          }}
        />
      </Card>

      {/* Modal de artículo */}
      <ModalArticulo
        abierto={modalAbierto}
        articulo={articuloSeleccionado}
        onCerrar={handleCerrarModal}
      />
    </Box>
  );
}
