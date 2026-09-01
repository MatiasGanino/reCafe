import { defineMiddleware } from "astro:middleware";
import { COOKIE, hayLoginConfigurado, sesionValida } from "./lib/sesion";

/**
 * Protege /panel. Falla cerrado a propósito: si las variables del login no están
 * cargadas, el panel no se abre. Un login que se desactiva solo cuando falta
 * configuración es peor que no tener login, porque nadie se entera.
 */
export const onRequest = defineMiddleware((context, next) => {
  if (!context.url.pathname.startsWith("/panel")) return next();

  if (!hayLoginConfigurado()) {
    return new Response(
      "El panel está cerrado: faltan PANEL_USUARIO y PANEL_CLAVE_HASH. " +
        "Generalas con `npm run clave-panel` y cargalas en el entorno.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  if (sesionValida(context.cookies.get(COOKIE)?.value)) return next();

  return context.redirect("/?entrar=1");
});
