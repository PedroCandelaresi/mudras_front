export interface CredencialesLogin {
  username: string;
  password: string;
}

export interface UsuarioSesion {
  id: string;
  username: string;
  displayName: string;
  roles: string[];
}

export interface RespuestaLogin {
  usuario: UsuarioSesion;
}
