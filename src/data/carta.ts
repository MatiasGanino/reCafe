import Redis from "ioredis";
import inicial from "./carta.json";

// En Vercel la credencial llega por process.env; en `astro dev` sale del .env,
// que Astro carga en import.meta.env. Se referencia explícitamente porque Vite
// reemplaza import.meta.env de forma estática: un acceso dinámico queda vacío.
const url = process.env.REDIS_URL ?? import.meta.env.REDIS_URL;

if (!url) {
  throw new Error(
    "Falta REDIS_URL. En Vercel: Storage → tu base → Connect Project. " +
      "En local: `vercel env pull .env --environment=production`.",
  );
}

// Una sola conexión por instancia de la función, reutilizada entre pedidos.
const redis = new Redis(url, { maxRetriesPerRequest: 3 });

const CLAVE = "recafe:carta";

export interface ItemCarta {
  id: string;
  categoria: string;
  nombre: string;
  precio: string;
  descripcion: string;
  nota?: string;
  oculto?: boolean;
}

/** Lo que manda el formulario del panel, antes de tener id. */
export type DatosItem = Omit<ItemCarta, "id">;

/** Mientras nadie haya guardado nada, vale la carta inicial del repo. */
export async function leerCarta(): Promise<ItemCarta[]> {
  const guardado = await redis.get(CLAVE);
  return guardado ? (JSON.parse(guardado) as ItemCarta[]) : (inicial as ItemCarta[]);
}

export async function guardarCarta(items: ItemCarta[]): Promise<void> {
  await redis.set(CLAVE, JSON.stringify(items));
}

/** "Panadería" → "panaderia" */
export const aSlug = (texto: string): string =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Lo que ve el público: sin ocultos, con las categorías del filtro. */
export async function leerCartaPublica() {
  const items = (await leerCarta()).filter((i) => !i.oculto);

  const etiquetas = new Map<string, string>();
  for (const item of items) {
    const slug = aSlug(item.categoria);
    if (!etiquetas.has(slug)) etiquetas.set(slug, item.categoria);
  }

  return {
    items,
    grupos: [
      { id: "todo", etiqueta: "Todo" },
      ...[...etiquetas].map(([id, etiqueta]) => ({ id, etiqueta })),
    ],
  };
}

export function validar(datos: DatosItem): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const campo of ["categoria", "nombre", "precio"] as const) {
    if (!datos[campo]?.trim()) errores[campo] = "No puede quedar vacío.";
  }
  return errores;
}

const limpiar = (datos: DatosItem, id: string): ItemCarta => ({
  id,
  categoria: datos.categoria.trim(),
  nombre: datos.nombre.trim(),
  precio: datos.precio.trim(),
  descripcion: datos.descripcion?.trim() ?? "",
  ...(datos.nota?.trim() ? { nota: datos.nota.trim() } : {}),
  ...(datos.oculto ? { oculto: true } : {}),
});

export async function crear(datos: DatosItem): Promise<void> {
  const items = await leerCarta();
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  await guardarCarta([...items, limpiar(datos, id)]);
}

export async function actualizar(id: string, datos: DatosItem): Promise<void> {
  const items = await leerCarta();
  const i = items.findIndex((item) => item.id === id);
  if (i === -1) return;

  items[i] = limpiar(datos, id);
  await guardarCarta(items);
}

export async function borrar(id: string): Promise<void> {
  const items = await leerCarta();
  await guardarCarta(items.filter((item) => item.id !== id));
}

/** Sube o baja un producto en el orden en que se muestran. */
export async function mover(id: string, direccion: "arriba" | "abajo"): Promise<void> {
  const items = await leerCarta();
  const i = items.findIndex((item) => item.id === id);
  const destino = direccion === "arriba" ? i - 1 : i + 1;
  if (i === -1 || destino < 0 || destino >= items.length) return;

  [items[i], items[destino]] = [items[destino], items[i]];
  await guardarCarta(items);
}
