#!/usr/bin/env python3
"""
Script para refactorizar ModalConfirmacionVenta.tsx
Aplica cambios estéticos manteniendo la lógica intacta
"""

import re

def refactorizar_modal():
    archivo_entrada = 'src/components/ventas/caja-registradora/ModalConfirmacionVenta.tsx'
    archivo_salida = 'src/components/ventas/caja-registradora/ModalConfirmacionVenta.tsx'
    
    with open(archivo_entrada, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # 1. Actualizar imports - remover Button y Paper, agregar Card, CardContent
    contenido = contenido.replace(
        '  Button,\n  Grid,',
        '  Grid,'
    )
    contenido = contenido.replace(
        '  Paper,\n  Alert,',
        '  Alert,'
    )
    contenido = contenido.replace(
        '  IconButton,\n} from \'@mui/material\';',
        '  IconButton,\n  Card,\n  CardContent,\n} from \'@mui/material\';'
    )
    
    # 2. Agregar imports de estilos e iconos
    contenido = contenido.replace(
        '} from \'@mui/material\';',
        '} from \'@mui/material\';\nimport { alpha, darken } from \'@mui/material/styles\';\nimport { Icon } from \'@iconify/react\';'
    )
    
    # 3. Cambiar imports de iconos de Tabler
    contenido = contenido.replace(
        'import {\n  IconPlus,\n  IconTrash,\n  IconCreditCard,\n  IconCash,\n  IconBuildingBank,\n} from \'@tabler/icons-react\';',
        'import { IconPlus, IconTrash } from \'@tabler/icons-react\';'
    )
    
    # 4. Agregar imports de componentes UI
    contenido = contenido.replace(
        'import { OBTENER_PUNTOS_MUDRAS, type ObtenerPuntosMudrasResponse, type PuntoMudras } from \'@/components/puntos-mudras/graphql/queries\';',
        '''import { OBTENER_PUNTOS_MUDRAS, type ObtenerPuntosMudrasResponse, type PuntoMudras } from '@/components/puntos-mudras/graphql/queries';
import { TexturedPanel } from '@/components/ui/TexturedFrame/TexturedPanel';
import { WoodBackdrop } from '@/components/ui/TexturedFrame/WoodBackdrop';
import CrystalButton, { CrystalSoftButton } from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';'''
    )
    
    # 5. Actualizar METODOS_PAGO con iconos de iconify
    metodos_pago_viejo = '''const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: IconCash },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito', icon: IconCreditCard },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito', icon: IconCreditCard },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: IconBuildingBank },
  { value: 'CHEQUE', label: 'Cheque', icon: IconBuildingBank },
  { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente', icon: IconBuildingBank },
  { value: 'OTRO', label: 'Otro', icon: IconBuildingBank },
] as const;'''
    
    metodos_pago_nuevo = '''const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: 'mdi:cash' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito', icon: 'mdi:credit-card' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito', icon: 'mdi:credit-card-multiple' },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: 'mdi:bank-transfer' },
  { value: 'CHEQUE', label: 'Cheque', icon: 'mdi:checkbook' },
  { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente', icon: 'mdi:book-open-variant' },
  { value: 'OTRO', label: 'Otro', icon: 'mdi:dots-horizontal' },
] as const;'''
    
    contenido = contenido.replace(metodos_pago_viejo, metodos_pago_nuevo)
    
    # 6. Agregar constantes de layout y funciones helper
    constantes_layout = '''
const VH_MAX = 85;
const HEADER_H = 88;
const FOOTER_H = 88;
const DIV_H = 3;
const CONTENT_MAX = `calc(${VH_MAX}vh - ${HEADER_H + FOOTER_H + DIV_H * 2}px)`;
const NBSP = '\\u00A0';

const makeColors = (base?: string) => {
  const primary = base || verde.primary;
  return {
    primary,
    primaryHover: darken(primary, 0.12),
    textStrong: darken(primary, 0.5),
    chipBorder: 'rgba(255,255,255,0.35)',
    inputBorder: alpha(primary, 0.28),
    inputBorderHover: alpha(primary, 0.42),
  };
};

const currency = (v: number) =>
  v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
'''
    
    contenido = contenido.replace(
        '] as const;\n\nexport const ModalConfirmacionVenta',
        f'] as const;{constantes_layout}\nexport const ModalConfirmacionVenta'
    )
    
    # 7. Agregar COLORS al componente
    contenido = contenido.replace(
        '}) => {\n  const [tipoVenta',
        '}) => {\n  const COLORS = useMemo(() => makeColors(), []);\n  const [tipoVenta'
    )
    
    # Guardar archivo
    with open(archivo_salida, 'w', encoding='utf-8') as f:
        f.write(contenido)
    
    print(f"✅ Refactorización completada: {archivo_salida}")
    print("⚠️  Nota: Revisa manualmente el Dialog, Paper->Card y los botones")

if __name__ == '__main__':
    refactorizar_modal()
