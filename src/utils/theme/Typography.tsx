import { Plus_Jakarta_Sans } from "next/font/google";

export const plus = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

// Tipografía ajustada para pantallas 1366x768:
// Reducimos todos los tamaños aprox. un 25% para ganar espacio vertical,
// manteniendo las proporciones entre títulos, textos y botones.
const typography = {
  fontFamily: plus.style.fontFamily,
  h1: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: '1.9rem',
  },
  h2: {
    fontWeight: 600,
    fontSize: '1.28rem',
    lineHeight: '1.6rem',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: '1.2rem',
  },
  h4: {
    fontWeight: 600,
    fontSize: '0.9rem',
    lineHeight: '1.1rem',
  },
  h5: {
    fontWeight: 600,
    fontSize: '0.8rem',
    lineHeight: '1.05rem',
  },
  h6: {
    fontWeight: 600,
    fontSize: '0.72rem',
    lineHeight: '0.9rem',
  },
  button: {
    textTransform: 'capitalize',
    fontWeight: 400,
    fontSize: '0.9rem',
  },
  body1: {
    fontSize: '0.95rem',
    fontWeight: 400,
    lineHeight: '0.95rem',
  },
  body2: {
    fontSize: '0.85rem',
    letterSpacing: '0rem',
    fontWeight: 400,
    lineHeight: '0.8rem',
  },
  subtitle1: {
    fontSize: '0.85rem',
    fontWeight: 400,
  },
  subtitle2: {
    fontSize: '0.8rem',
    fontWeight: 400,
  },
};

export default typography;
