import type { APIRoute } from "astro";
import { COOKIE } from "../../lib/sesion";

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(COOKIE, { path: "/" });
  return redirect("/");
};
