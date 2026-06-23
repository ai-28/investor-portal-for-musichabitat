export const C = {
  bg: "#000000",
  card: "#0D0D0F",
  cardHi: "#141417",
  line: "#26262B",
  lineHi: "#33333A",
  text: "#FFFFFF",
  textDim: "#9A9AA2",
  textFaint: "#5C5C63",
  amber: "#EDB901",      // commitment / money — logo gold
  amberDim: "#8A6A24",
  teal: "#00C9DD",       // discovery / explore — logo teal
  tealDim: "#1F6E6E",
  green: "#34C759",
  red: "#FF4D4D",
};

export const FONT_DISPLAY = '"Oswald", "Anton", system-ui, sans-serif'; // bold condensed
export const FONT_BODY = '"Inter", system-ui, sans-serif';

/** Shell max-width at common breakpoints (see globals.css --portal-content-max-width). */
export const LAYOUT = {
  mobile: 440,
  tablet: 820,
  desktop: 960,
  wide: 1080,
} as const;
