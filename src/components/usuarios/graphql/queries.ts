import { gql } from '@apollo/client';

export const USUARIOS_ADMIN_QUERY = gql`
  query UsuariosAdmin($filtros: ListarUsuariosAuthInput) {
    usuariosAdmin(filtros: $filtros) {
      total
      items {
        id
        username
        email
        displayName
        userType
        isActive
        mustChangePassword
        createdAt
        updatedAt
        roles
      }
    }
  }
`;

export const USUARIOS_GESTION_POR_ROL_QUERY = gql`
  query UsuariosGestionPorRol($rol: RolUsuario!) {
    usuariosGestionPorRol(rol: $rol) {
      id
      nombre
      apellido
      username
      email
      rol
      estado
    }
  }
`;

export const USUARIOS_CAJA_AUTH_QUERY = gql`
  query UsuariosCajaAuth($rolSlug: String) {
    usuariosCajaAuth(rolSlug: $rolSlug) {
      id
      username
      email
      displayName
    }
  }
`;
