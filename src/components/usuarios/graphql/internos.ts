import { gql } from '@apollo/client';

export const USUARIOS_INTERNOS_QUERY = gql`
  query UsuariosInternos {
    usuarios {
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

export const CREAR_USUARIO_INTERNO_MUT = gql`
  mutation CrearUsuarioInterno($input: CreateUsuarioDto!) {
    createUsuario(createUsuarioInput: $input) {
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

export const ACTUALIZAR_USUARIO_INTERNO_MUT = gql`
  mutation ActualizarUsuarioInterno($id: Int!, $input: UpdateUsuarioDto!) {
    updateUsuario(id: $id, updateUsuarioInput: $input) {
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

export const ELIMINAR_USUARIO_INTERNO_MUT = gql`
  mutation EliminarUsuarioInterno($id: Int!) {
    removeUsuario(id: $id)
  }
`;

export type RolUsuario = 'ADMINISTRADOR' | 'PROGRAMADOR' | 'CAJA' | 'DEPOSITO' | 'DIS_GRAFICO';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';

export interface UsuarioInterno {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
}

