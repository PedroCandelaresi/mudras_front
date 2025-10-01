import { alpha, lighten, darken } from '@mui/material/styles';

export interface PaletaBisel {
  resaltePrincipal: string;
  sombraPrincipal: string;
  resalteLateral: string;
  sombraLateral: string;
  borde: string;
  interiorResalte: string;
  interiorSombra: string;
}

export interface ConfiguracionBisel {
  paleta: PaletaBisel;
  grosor: number;
}

export interface OpcionesBiselSx {
  invertir?: boolean;
  zAntes?: number;
  zDespues?: number;
  zContenido?: number;
}

export const crearConfiguracionBisel = (colorBase: string, grosor = 3.5): ConfiguracionBisel => {
  const resaltePrincipal = alpha(lighten(colorBase, 0.62), 0.9);
  const sombraPrincipal = alpha(darken(colorBase, 0.68), 0.82);
  const resalteLateral = alpha(lighten(colorBase, 0.48), 0.74);
  const sombraLateral = alpha(darken(colorBase, 0.52), 0.74);
  const borde = alpha(lighten(colorBase, 0.18), 0.6);
  const interiorResalte = alpha(lighten(colorBase, 0.54), 0.22);
  const interiorSombra = alpha(darken(colorBase, 0.56), 0.26);

  return {
    paleta: {
      resaltePrincipal,
      sombraPrincipal,
      resalteLateral,
      sombraLateral,
      borde,
      interiorResalte,
      interiorSombra,
    },
    grosor,
  };
};

export const crearEstilosBisel = (
  configuracion: ConfiguracionBisel,
  opciones: OpcionesBiselSx = {},
) => {
  const { paleta, grosor } = configuracion;
  const {
    resaltePrincipal,
    sombraPrincipal,
    resalteLateral,
    sombraLateral,
    borde,
    interiorResalte,
    interiorSombra,
  } = paleta;

  const {
    invertir = false,
    zAntes = 3,
    zDespues = 2,
    zContenido,
  } = opciones;

  const top = invertir ? resaltePrincipal : sombraPrincipal;
  const bottom = invertir ? sombraPrincipal : resaltePrincipal;
  const left = invertir ? resalteLateral : sombraLateral;
  const right = invertir ? sombraLateral : resalteLateral;
  const topInterior = invertir ? interiorResalte : interiorSombra;
  const bottomInterior = invertir ? interiorSombra : interiorResalte;

  const estilos: Record<string, unknown> = {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      boxShadow: `
        inset 0 ${grosor}px 0 ${top},
        inset 0 -${grosor + 0.5}px 0 ${bottom},
        inset ${grosor}px 0 0 ${left},
        inset -${grosor + 0.5}px 0 0 ${right}
      `,
      zIndex: zAntes,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: grosor,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      border: `1px solid ${borde}`,
      boxShadow: `
        inset 0 ${grosor * 5.2}px ${grosor * 6.4}px ${topInterior},
        inset 0 -${grosor * 5.2}px ${grosor * 6.4}px ${bottomInterior}
      `,
      mixBlendMode: 'soft-light',
      zIndex: zDespues,
    },
  };

  if (zContenido !== undefined) {
    estilos['& > *'] = {
      position: 'relative',
      zIndex: zContenido,
    };
  }

  return estilos;
};
