import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Login del panel.
 *
 * La contraseña en texto plano no vive en ningún lado: en el entorno solo hay un
 * hash scrypt, que no se puede revertir. Se genera con `npm run clave-panel`.
 *
 * La sesión es una cookie firmada con HMAC. La clave de firma es el propio hash,
 * así no hace falta un secreto aparte y, de yapa, cambiar la contraseña invalida
 * todas las sesiones abiertas.
 */

export const COOKIE = "recafe_sesion";
const DURACION_MS = 8 * 60 * 60 * 1000; // 8 horas

const leerEnv = (nombre: "PANEL_USUARIO" | "PANEL_CLAVE_HASH"): string | undefined =>
  nombre === "PANEL_USUARIO"
    ? (process.env.PANEL_USUARIO ?? import.meta.env.PANEL_USUARIO)
    : (process.env.PANEL_CLAVE_HASH ?? import.meta.env.PANEL_CLAVE_HASH);

export const hayLoginConfigurado = (): boolean =>
  Boolean(leerEnv("PANEL_USUARIO") && leerEnv("PANEL_CLAVE_HASH"));

const derivar = (clave: string, sal: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) =>
    scrypt(clave.normalize("NFKC"), sal, 32, (e, dk) => (e ? reject(e) : resolve(dk))),
  );

/** Formato guardado: scrypt$<sal en hex>$<hash en hex> */
export async function generarHash(clave: string): Promise<string> {
  const sal = randomBytes(16);
  const dk = await derivar(clave, sal);
  return `scrypt$${sal.toString("hex")}$${dk.toString("hex")}`;
}

const igualesEnTiempoConstante = (a: Buffer, b: Buffer): boolean =>
  a.length === b.length && timingSafeEqual(a, b);

/**
 * Compara siempre con el mismo costo, haya o no usuario válido: si respondiera
 * más rápido con un usuario inexistente, se podrían adivinar usuarios midiendo.
 */
export async function credencialesValidas(usuario: string, clave: string): Promise<boolean> {
  const usuarioEsperado = leerEnv("PANEL_USUARIO") ?? "";
  const hashGuardado = leerEnv("PANEL_CLAVE_HASH") ?? "";

  const [algoritmo, salHex, hashHex] = hashGuardado.split("$");
  const sal = algoritmo === "scrypt" && salHex ? Buffer.from(salHex, "hex") : randomBytes(16);
  const esperado = hashHex ? Buffer.from(hashHex, "hex") : randomBytes(32);

  const dk = await derivar(clave, sal);

  const usuarioOk = igualesEnTiempoConstante(
    Buffer.from(usuario.normalize("NFKC")),
    Buffer.from(usuarioEsperado),
  );
  const claveOk = igualesEnTiempoConstante(dk, esperado);

  return Boolean(usuarioEsperado) && Boolean(hashHex) && usuarioOk && claveOk;
}

const firmar = (vence: number): string =>
  createHmac("sha256", leerEnv("PANEL_CLAVE_HASH") ?? "")
    .update(String(vence))
    .digest("hex");

export function crearSesion(): { valor: string; maxAge: number } {
  const vence = Date.now() + DURACION_MS;
  return { valor: `${vence}.${firmar(vence)}`, maxAge: Math.floor(DURACION_MS / 1000) };
}

export function sesionValida(cookie: string | undefined): boolean {
  if (!cookie) return false;

  const [venceTexto, firma] = cookie.split(".");
  const vence = Number(venceTexto);
  if (!vence || !firma || Date.now() > vence) return false;

  return igualesEnTiempoConstante(Buffer.from(firma, "hex"), Buffer.from(firmar(vence), "hex"));
}
