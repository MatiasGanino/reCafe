export const contacto = {
  direccion: "Gral. José Gervasio Artigas 3602",
  barrio: "Agronomía, CABA",
  email: "hola@recafe.example",
  telefono: "11 4800-0000",
  telefonoLink: "+541148000000",
  desde: "2025",
};

export interface Horario {
  /** Días de la semana que cubre esta fila (0 = domingo). */
  dias: number[];
  etiqueta: string;
  /** Horas en formato "H:MM". Ausentes = cerrado ese día. */
  abre?: string;
  cierra?: string;
}

/** Única fuente de horarios: la usan el cartel de abierto/cerrado y la tarjeta de Visitanos. */
export const horarios: Horario[] = [
  { dias: [1, 2, 3, 4, 5], etiqueta: "Lunes a viernes", abre: "8:00", cierra: "20:00" },
  { dias: [6], etiqueta: "Sábados", abre: "9:00", cierra: "20:00" },
  { dias: [0], etiqueta: "Domingos" },
];

/** "7:30" → 450 (minutos desde la medianoche). */
const aMinutos = (hora: string): number => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + (m || 0);
};

/** "20:00" → "20" · "7:30" → "7:30" */
const enPantalla = (hora: string): string => (hora.endsWith(":00") ? String(parseInt(hora, 10)) : hora);

const abiertos = horarios.filter(
  (h): h is Horario & { abre: string; cierra: string } => h.abre != null && h.cierra != null,
);

/** Derivado de `horarios`: día de la semana → minutos de apertura y cierre. Los días cerrados no figuran. */
export const horarioPorDia: Record<number, { abre: number; cierra: number; cierraTexto: string }> =
  Object.fromEntries(
    abiertos.flatMap((h) =>
      h.dias.map((dia) => [
        dia,
        { abre: aMinutos(h.abre), cierra: aMinutos(h.cierra), cierraTexto: enPantalla(h.cierra) },
      ]),
    ),
  );

/** Derivado de `horarios`: filas listas para mostrar. */
export const horariosVisibles = horarios.map((h) => ({
  texto: h.etiqueta,
  dato: h.abre != null && h.cierra != null ? `${enPantalla(h.abre)} – ${enPantalla(h.cierra)}` : "cerrado",
}));

export const comoLlegar: string[] = [
  "Tren Urquiza · est. Francisco Beiró",
  "Colectivos 80, 87, 110 y 123",
];

export const antesDeVenir: { texto: string; dato: string }[] = [
  { texto: "Wifi y enchufes", dato: "sí" },
  { texto: "Reservas", dato: "no" },
  { texto: "Mesas afuera", dato: "4" },
];

export const hoy: { clave: string; valor: string }[] = [
  { clave: "Café", valor: "Mezcla de la casa" },
  { clave: "Filtrado", valor: "V60 y prensa" },
  { clave: "Del horno", valor: "Roles de canela" },
  { clave: "Cocina", valor: "Hasta las 20" },
];

export const detallesCasa: string[] = [
  "La pastelería la hacemos acá, cada mañana.",
  "El café lo compramos tostado a un tostador de Chacarita.",
  "Hay una mesa larga para compartir y cuatro afuera.",
  "Si venís seguido, ya sabemos cómo lo tomás.",
];

export const redes: { texto: string; href: string }[] = [
  { texto: "Instagram", href: "https://www.instagram.com/recafeagronomia_" },
];
