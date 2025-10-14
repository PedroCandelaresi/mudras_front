import { gql } from '@apollo/client';

export const CREAR_USUARIO_ADMIN_MUTATION = gql`
  mutation CrearUsuarioAdmin($input: CrearUsuarioAuthInput!) {
    crearUsuarioAdmin(input: $input) {
      id
      username
      displayName
      email
      isActive
      roles
    }
  }
`;

export const ACTUALIZAR_USUARIO_ADMIN_MUTATION = gql`
  mutation ActualizarUsuarioAdmin($id: String!, $input: ActualizarUsuarioAuthInput!) {
    actualizarUsuarioAdmin(id: $id, input: $input) {
      id
      username
      displayName
      email
      isActive
      roles
    }
  }
`;

export const ELIMINAR_USUARIO_ADMIN_MUTATION = gql`
  mutation EliminarUsuarioAdmin($id: String!) {
    eliminarUsuarioAdmin(id: $id)
  }
`;

export const ASIGNAR_ROLES_USUARIO_ADMIN_MUTATION = gql`
  mutation AsignarRolesUsuarioAdmin($id: String!, $roles: [String!]!) {
    asignarRolesUsuarioAdmin(id: $id, roles: $roles) {
      id
      roles
    }
  }
`;

export const OBTENER_ROLES_QUERY = gql`
  query RolesDisponibles {
    roles {
      id
      nombre
      slug
    }
  }
`;
