export interface FactoresPrecio {
  costo: number;
  porcentajeGanancia?: number | null;
  iva?: number | null;
  rubroRecargo?: number | null;
  rubroDescuento?: number | null;
  proveedorRecargo?: number | null;
  proveedorDescuento?: number | null;
}

const sanitizeNumber = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return 0;
  return Number(value);
};

export const calcularPrecioVenta = ({
  costo,
  porcentajeGanancia,
  iva,
  rubroRecargo,
  rubroDescuento,
  proveedorRecargo,
  proveedorDescuento,
}: FactoresPrecio): number => {
  let precio = Math.max(0, sanitizeNumber(costo));
  if (precio === 0) return 0;

  const aplicarIncremento = (base: number, percent?: number | null) => {
    const valor = sanitizeNumber(percent);
    if (!valor) return base;
    const limitado = valor <= -100 ? -99.99 : valor;
    return base * (1 + limitado / 100);
  };
  const aplicarDescuento = (base: number, percent?: number | null) => {
    const valor = sanitizeNumber(percent);
    if (!valor) return base;
    const limitado = Math.min(95, Math.max(0, valor));
    return base * (1 - limitado / 100);
  };

  precio = aplicarIncremento(precio, porcentajeGanancia);
  precio = aplicarIncremento(precio, rubroRecargo);
  precio = aplicarDescuento(precio, rubroDescuento);
  precio = aplicarIncremento(precio, proveedorRecargo);
  precio = aplicarDescuento(precio, proveedorDescuento);
  precio = aplicarIncremento(precio, iva);

  if (!Number.isFinite(precio)) return 0;
  return Number(precio.toFixed(2));
};

export interface ArticuloPrecioContext {
  PrecioCompra?: number | null;
  CostoPromedio?: number | null;
  PrecioListaProveedor?: number | null;
  PrecioVenta?: number | null;
  PorcentajeGanancia?: number | null;
  AlicuotaIva?: number | null;
  rubro?: {
    PorcentajeRecargo?: number | null;
    PorcentajeDescuento?: number | null;
  } | null;
  proveedor?: {
    PorcentajeRecargoProveedor?: number | null;
    PorcentajeDescuentoProveedor?: number | null;
  } | null;
}

export const obtenerCostoReferencia = (articulo?: ArticuloPrecioContext | null) => {
  if (!articulo) return 0;
  const fuentes = [articulo.PrecioCompra, articulo.CostoPromedio, articulo.PrecioListaProveedor];
  for (const fuente of fuentes) {
    if (fuente != null && !Number.isNaN(Number(fuente))) {
      const valor = Number(fuente);
      if (valor > 0) return valor;
    }
  }
  return Number(articulo.PrecioCompra ?? 0) || 0;
};

export const calcularPrecioDesdeArticulo = (articulo?: ArticuloPrecioContext | null) => {
  if (!articulo) return 0;
  const costo = obtenerCostoReferencia(articulo);
  if (!costo) return Number(articulo.PrecioVenta ?? articulo.PrecioCompra ?? 0) || 0;
  const calculado = calcularPrecioVenta({
    costo,
    porcentajeGanancia: articulo.PorcentajeGanancia,
    iva: articulo.AlicuotaIva,
    rubroRecargo: articulo.rubro?.PorcentajeRecargo,
    rubroDescuento: articulo.rubro?.PorcentajeDescuento,
    proveedorRecargo: articulo.proveedor?.PorcentajeRecargoProveedor,
    proveedorDescuento: articulo.proveedor?.PorcentajeDescuentoProveedor,
  });
  if (!calculado) {
    return Number(articulo.PrecioVenta ?? 0) || 0;
  }
  return calculado;
};
