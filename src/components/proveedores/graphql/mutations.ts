import { gql } from '@apollo/client';

export const CREAR_PROVEEDOR = gql`
  mutation CrearProveedor($createProveedorInput: CreateProveedorInput!) {
    crearProveedor(createProveedorInput: $createProveedorInput) {
      IdProveedor
      Codigo
      Nombre
      Contacto
      Direccion
      Localidad
      Provincia
      CP
      Telefono
      Celular
      TipoIva
      CUIT
      Observaciones
      Web
      Mail
      Rubro
      Saldo
      PorcentajeRecargoProveedor
      PorcentajeDescuentoProveedor
      Pais
      Fax
      FechaModif
      rubros {
        Id
        Rubro
      }
    }
  }
`;

export const ACTUALIZAR_PROVEEDOR = gql`
  mutation ActualizarProveedor($updateProveedorInput: UpdateProveedorInput!) {
    actualizarProveedor(updateProveedorInput: $updateProveedorInput) {
      IdProveedor
      Codigo
      Nombre
      Contacto
      Direccion
      Localidad
      Provincia
      CP
      Telefono
      Celular
      TipoIva
      CUIT
      Observaciones
      Web
      Mail
      Rubro
      Saldo
      PorcentajeRecargoProveedor
      PorcentajeDescuentoProveedor
      Pais
      Fax
      FechaModif
      rubros {
        Id
        Rubro
      }
    }
  }
`;

export const ELIMINAR_PROVEEDOR = gql`
  mutation EliminarProveedor($id: Int!) {
    eliminarProveedor(id: $id)
  }
`;
