import type { APIRoute } from "astro";
import { COOKIE, credencialesValidas, crearSesion, hayLoginConfigurado } from "../../lib/sesion";

export const prerender = false;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!hayLoginConfigurado()) {
    return new Response(JSON.stringify({ error: "El login no está configurado." }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  const form = await request.formData();
  const usuario = String(form.get("usuario") ?? "");
  const clave = String(form.get("clave") ?? "");

  // Nunca loguear estos valores.
  if (!(await credencialesValidas(usuario, clave))) {
    // Un respiro para que probar claves a mano sea lento.
    await esperar(700);
    return new Response(JSON.stringify({ error: "Usuario o contraseña incorrectos." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const { valor, maxAge } = crearSesion();
  cookies.set(COOKIE, valor, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
