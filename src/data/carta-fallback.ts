import type { FilaCarta } from "./carta";

/**
 * Carta local, usada cuando no hay `CARTA_CSV_URL` configurada
 * (desarrollo sin conexión, o antes de conectar la planilla).
 * Mismo formato que las columnas de la hoja de Google.
 */
export const filasFallback: FilaCarta[] = [
  {
    categoria: "Espresso",
    nombre: "Espresso",
    precio: "$2.900",
    descripcion: "Mezcla de la casa, 18 g adentro, 36 g afuera.",
  },
  {
    categoria: "Espresso",
    nombre: "Cortado",
    precio: "$3.400",
    descripcion: "Doble ristretto con un dedo de leche texturada.",
  },
  {
    categoria: "Espresso",
    nombre: "Flat white",
    precio: "$4.600",
    descripcion: "Ocho onzas, sin azúcar agregada, en taza de cerámica.",
  },
  {
    categoria: "Espresso",
    nombre: "Latte de vainilla",
    precio: "$5.200",
    descripcion: "Vainilla en chaucha macerada acá.",
    nota: "Sin esencia",
  },
  {
    categoria: "Filtrado",
    nombre: "V60",
    precio: "$5.400",
    descripcion: "Origen del día, molido al momento, 250 ml.",
  },
  {
    categoria: "Filtrado",
    nombre: "Prensa francesa",
    precio: "$6.800",
    descripcion: "Para dos tazas. Te lo dejamos servir a vos.",
  },
  {
    categoria: "Filtrado",
    nombre: "Cold brew",
    precio: "$5.000",
    descripcion: "Dieciocho horas en frío, servido sobre hielo grande.",
  },
  {
    categoria: "Filtrado",
    nombre: "Cascarita",
    precio: "$3.800",
    descripcion: "Infusión de cáscara de café, caliente o helada.",
    nota: "Sin cafeína alta",
  },
  {
    categoria: "Cocina",
    nombre: "Tostado de campo",
    precio: "$8.900",
    descripcion: "Pan de masa madre, queso de sierra, jamón natural.",
  },
  {
    categoria: "Cocina",
    nombre: "Huevos revueltos",
    precio: "$9.600",
    descripcion: "Tres huevos, ciboulette, tostada con manteca.",
  },
  {
    categoria: "Cocina",
    nombre: "Rol de canela",
    precio: "$4.700",
    descripcion: "Sale del horno a las nueve y media. Suele volar.",
  },
  {
    categoria: "Cocina",
    nombre: "Budín del día",
    precio: "$4.200",
    descripcion: "Preguntá en la barra: cambia según qué fruta haya.",
  },
];
