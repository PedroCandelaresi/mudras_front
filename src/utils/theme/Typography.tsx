import { Plus_Jakarta_Sans } from "next/font/google";

export const plus = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

// Tipografía ajustada para pantallas 1366x768:
// Reducimos ligeramente todos los tamaños para que quepa más contenido en altura,
// manteniendo las proporciones entre títulos, textos y botones.
const typography = {
  fontFamily: plus.style.fontFamily,
  h1: {
    fontWeight: 600,
    fontSize: '2rem',
    lineHeight: '2.5rem',
  },
  h2: {
    fontWeight: 600,
    fontSize: '1.7rem',
    lineHeight: '2.1rem',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.35rem',
    lineHeight: '1.6rem',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.2rem',
    lineHeight: '1.45rem',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.05rem',
    lineHeight: '1.4rem',
  },
  h6: {
    fontWeight: 600,
    fontSize: '0.95rem',
    lineHeight: '1.2rem',
  },
  button: {
    textTransform: 'capitalize',
    fontWeight: 400,
    fontSize: '0.8rem',
  },
  body1: {
    fontSize: '0.8rem',
    fontWeight: 400,
    lineHeight: '1.25rem',
  },
  body2: {
    fontSize: '0.7rem',
    letterSpacing: '0rem',
    fontWeight: 400,
    lineHeight: '1.05rem',
  },
  subtitle1: {
    fontSize: '0.8rem',
    fontWeight: 400,
  },
  subtitle2: {
    fontSize: '0.75rem',
    fontWeight: 400,
  },
};

export default typography;
