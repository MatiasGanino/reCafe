/**
 * Genera el hash de la contraseña del panel.
 *
 * La clave se tipea acá y no sale de esta ejecución: no se pasa como argumento
 * (así no queda en el historial de la terminal), no se muestra al escribirla y
 * no se escribe en ningún archivo. Lo único que imprime es el hash, que es
 * irreversible y es lo que va a las variables de entorno de Vercel.
 *
 *   npm run clave-panel
 */
import { randomBytes, scrypt } from "node:crypto";
import { stdin, stdout } from "node:process";

const CTRL_C = String.fromCharCode(3);
const CTRL_D = String.fromCharCode(4);
const BORRAR = String.fromCharCode(127);
const RETROCESO = String.fromCharCode(8);

const enTerminal = Boolean(stdin.isTTY);

let enCurso = "";
const listas = []; // líneas ya completas que todavía nadie pidió
let esperando = null; // resolve del preguntar() pendiente
let ocultar = false;

const entregar = () => {
  const linea = enCurso.trim();
  enCurso = "";
  stdout.write("\n");

  if (esperando) {
    const resolver = esperando;
    esperando = null;
    resolver(linea);
  } else {
    listas.push(linea);
  }
};

stdin.setEncoding("utf8");
if (enTerminal) stdin.setRawMode(true);
stdin.resume();

stdin.on("data", (bloque) => {
  for (const c of bloque) {
    if (c === "\n" || c === "\r" || c === CTRL_D) {
      entregar();
    } else if (enTerminal && c === CTRL_C) {
      stdin.setRawMode(false);
      stdout.write("\n");
      process.exit(1);
    } else if (c === BORRAR || c === RETROCESO) {
      enCurso = enCurso.slice(0, -1);
      if (enTerminal && !ocultar) stdout.write("\b \b");
    } else {
      enCurso += c;
      // En modo raw la terminal no repite nada: lo hacemos nosotros, salvo
      // cuando el dato es la contraseña.
      if (enTerminal && !ocultar) stdout.write(c);
    }
  }
});

const preguntar = (texto, oculto = false) => {
  ocultar = oculto;
  stdout.write(texto);

  const pendiente = listas.shift();
  if (pendiente !== undefined) {
    stdout.write("\n");
    return Promise.resolve(pendiente);
  }

  return new Promise((resolver) => (esperando = resolver));
};

const derivar = (clave, sal) =>
  new Promise((resolve, reject) =>
    scrypt(clave.normalize("NFKC"), sal, 32, (e, dk) => (e ? reject(e) : resolve(dk))),
  );

const salir = (mensaje) => {
  if (enTerminal) stdin.setRawMode(false);
  console.error(`\n${mensaje}`);
  process.exit(1);
};

const usuario = await preguntar("Usuario: ");
const clave = await preguntar("Contraseña (no se muestra): ", true);
const repetida = await preguntar("Repetila: ", true);

if (enTerminal) stdin.setRawMode(false);
stdin.pause();

if (!usuario || !clave) salir("Faltó el usuario o la contraseña.");
if (clave !== repetida) salir("Las contraseñas no coinciden.");
if (clave.length < 12) salir("Usá al menos 12 caracteres.");

const sal = randomBytes(16);
const dk = await derivar(clave, sal);

console.log(`
Listo. Cargá estas dos variables en Vercel
(Settings -> Environment Variables -> Production y Preview),
y en tu .env local si querés entrar al panel desde localhost:

PANEL_USUARIO=${usuario}
PANEL_CLAVE_HASH=scrypt$${sal.toString("hex")}$${dk.toString("hex")}

La contraseña no quedó guardada en ningún lado: ese hash no se puede revertir.
Anotala donde se la vayas a pasar al cliente y listo.
`);
