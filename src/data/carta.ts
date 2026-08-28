export type Grupo = "espresso" | "filtrado" | "cocina";

export interface ItemCarta {
  nombre: string;
  precio: string;
  grupo: Grupo;
  descripcion: string;
  nota?: string;
}

export const grupos: { id: Grupo | "todo"; etiqueta: string }[] = [
  { id: "todo", etiqueta: "Todo" },
  { id: "espresso", etiqueta: "Espresso" },
  { id: "filtrado", etiqueta: "Filtrado" },
  { id: "cocina", etiqueta: "Cocina" },
];

export const carta: ItemCarta[] = [
  {
    nombre: "Espresso",
    precio: "$2.900",
    grupo: "espresso",
    descripcion: "Mezcla de la casa, 18 g adentro, 36 g afuera.",
  },
  {
    nombre: "Cortado",
    precio: "$3.400",
    grupo: "espresso",
    descripcion: "Doble ristretto con un dedo de leche texturada.",
  },
  {
    nombre: "Flat white",
    precio: "$4.600",
    grupo: "espresso",
    descripcion: "Ocho onzas, sin azúcar agregada, en taza de cerámica.",
  },
  {
    nombre: "Latte de vainilla",
    precio: "$5.200",
    grupo: "espresso",
    descripcion: "Vainilla en chaucha macerada acá.",
    nota: "Sin esencia",
  },
  {
    nombre: "V60",
    precio: "$5.400",
    grupo: "filtrado",
    descripcion: "Origen del día, molido al momento, 250 ml.",
  },
  {
    nombre: "Prensa francesa",
    precio: "$6.800",
    grupo: "filtrado",
    descripcion: "Para dos tazas. Te lo dejamos servir a vos.",
  },
  {
    nombre: "Cold brew",
    precio: "$5.000",
    grupo: "filtrado",
    descripcion: "Dieciocho horas en frío, servido sobre hielo grande.",
  },
  {
    nombre: "Cascarita",
    precio: "$3.800",
    grupo: "filtrado",
    descripcion: "Infusión de cáscara de café, caliente o helada.",
    nota: "Sin cafeína alta",
  },
  {
    nombre: "Tostado de campo",
    precio: "$8.900",
    grupo: "cocina",
    descripcion: "Pan de masa madre, queso de sierra, jamón natural.",
  },
  {
    nombre: "Huevos revueltos",
    precio: "$9.600",
    grupo: "cocina",
    descripcion: "Tres huevos, ciboulette, tostada con manteca.",
  },
  {
    nombre: "Rol de canela",
    precio: "$4.700",
    grupo: "cocina",
    descripcion: "Sale del horno a las nueve y media. Suele volar.",
  },
  {
    nombre: "Budín del día",
    precio: "$4.200",
    grupo: "cocina",
    descripcion: "Preguntá en la barra: cambia según qué fruta haya.",
  },
];
