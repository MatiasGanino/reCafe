import { parse } from "csv-parse/sync";
import { filasFallback } from "./carta-fallback";

/** Una fila tal como viene de la planilla (o del fallback local). */
export interface FilaCarta {
  categoria: string;
  nombre: string;
  precio: string;
  descripcion?: string;
  nota?: string;
  /** "sí" / "x" / "true" oculta el ítem sin borrarlo de la planilla. */
  oculto?: string;
}

export interface ItemCarta {
  nombre: string;
  precio: string;
  /** Slug de la categoría, el que usa el filtro: "Espresso" → "espresso". */
  grupo: string;
  descripcion: string;
  nota?: string;
}

export interface Grupo {
  id: string;
  etiqueta: string;
}

const URL_CSV = import.meta.env.CARTA_CSV_URL;

/** "Panadería" → "panaderia" */
const aSlug = (texto: string): string =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const estaOculto = (valor?: string): boolean =>
  ["si", "sí", "x", "true", "1"].includes((valor ?? "").trim().toLowerCase());

/**
 * Normaliza los encabezados para tolerar cómo los escriba el cliente:
 * "Categoría", "CATEGORIA" y " categoria " llegan todos como "categoria".
 */
const normalizarClave = (clave: string): string => aSlug(clave).replace(/-/g, "");

function leerCsv(texto: string): FilaCarta[] {
  return parse(texto, {
    columns: (encabezados: string[]) => encabezados.map(normalizarClave),
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
}

/** Valida las filas y arma la carta y los grupos del filtro. */
function armarCarta(filas: FilaCarta[], origen: string) {
  const items: ItemCarta[] = [];
  const etiquetas = new Map<string, string>();

  filas.forEach((fila, i) => {
    // La fila 1 de la planilla son los encabezados, así que los datos arrancan en la 2.
    const donde = `${origen}, fila ${i + 2}`;

    // Fila en blanco: el cliente dejó espacio al final de la hoja, no es un error.
    if (!fila.nombre && !fila.precio && !fila.categoria) return;
    if (estaOculto(fila.oculto)) return;

    for (const campo of ["categoria", "nombre", "precio"] as const) {
      if (!fila[campo]?.trim()) {
        throw new Error(`${donde}: falta «${campo}». Completá esa celda o borrá la fila entera.`);
      }
    }

    const slug = aSlug(fila.categoria);
    if (!etiquetas.has(slug)) etiquetas.set(slug, fila.categoria.trim());

    items.push({
      nombre: fila.nombre.trim(),
      precio: fila.precio.trim(),
      grupo: slug,
      descripcion: fila.descripcion?.trim() ?? "",
      ...(fila.nota?.trim() ? { nota: fila.nota.trim() } : {}),
    });
  });

  if (items.length === 0) {
    throw new Error(`${origen}: no hay ningún ítem para mostrar.`);
  }

  const grupos: Grupo[] = [
    { id: "todo", etiqueta: "Todo" },
    ...[...etiquetas].map(([id, etiqueta]) => ({ id, etiqueta })),
  ];

  return { items, grupos };
}

async function bajarDeLaPlanilla(url: string): Promise<FilaCarta[]> {
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  } catch (causa) {
    throw new Error(
      `No pude conectarme a Google Sheets para leer la carta. ` +
        `Puede ser un corte de red o que la URL de CARTA_CSV_URL esté mal.`,
      { cause: causa },
    );
  }

  if (!res.ok) {
    throw new Error(
      `No pude leer la carta desde Google Sheets (HTTP ${res.status}). ` +
        `Revisá que la hoja siga publicada en Archivo → Compartir → Publicar en la web.`,
    );
  }

  return leerCsv(await res.text());
}

// Sin URL configurada usamos la carta local; con URL, un error corta el build a propósito,
// así el sitio se queda con el último deploy bueno en vez de publicar una carta rota.
const { items, grupos: gruposArmados } = URL_CSV
  ? armarCarta(await bajarDeLaPlanilla(URL_CSV), "planilla")
  : armarCarta(filasFallback, "carta local");

export const carta = items;
export const grupos = gruposArmados;
