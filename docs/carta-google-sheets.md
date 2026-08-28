# La carta desde Google Sheets

La carta del sitio sale de una planilla de Google. El cliente la edita, aprieta un botón,
y en menos de un minuto la página está actualizada. No hay que tocar código ni desplegar a mano.

El sitio sigue siendo estático: la planilla se lee **cuando se compila**, no cuando alguien
entra a la página. Eso mantiene la carta en el HTML (Google la indexa), la página rápida,
y el sitio andando aunque Google Sheets se caiga.

## 1 · Armar la planilla

Una hoja con estas columnas en la fila 1. Los nombres se leen sin distinguir mayúsculas ni
tildes, así que `Categoría`, `CATEGORIA` y `categoria` funcionan igual.

| Columna | Obligatoria | Qué va |
|---|---|---|
| `categoria` | sí | Espresso, Filtrado, Cocina… Los botones del filtro salen de acá |
| `nombre` | sí | Nombre del producto |
| `precio` | sí | Como se muestra, con el signo: `$4.200` |
| `descripcion` | no | Una línea |
| `nota` | no | La etiqueta chica en color, tipo "Sin esencia" |
| `oculto` | no | `sí` esconde el ítem sin borrar la fila |

Las filas en blanco se ignoran, así que se puede dejar espacio al final.

**Agregar una categoría nueva no requiere tocar nada**: si aparece "Panadería" en la columna
`categoria`, el botón del filtro se crea solo, con la tilde y todo.

## 2 · Publicar la hoja

En la planilla: **Archivo → Compartir → Publicar en la web**, elegir la hoja de la carta,
formato **CSV**, y publicar. Queda una URL así:

```
https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv
```

> Publicar deja esa hoja accesible para cualquiera que tenga el link. Para una carta está
> bien —es información pública igual—, pero no metan datos internos en esa pestaña.

## 3 · Configurar Vercel

**Variable de entorno.** Settings → Environment Variables:

| Nombre | Valor |
|---|---|
| `CARTA_CSV_URL` | la URL del paso 2 |

Sin esta variable el sitio compila igual, usando la carta local de
[`src/data/carta-fallback.ts`](../src/data/carta-fallback.ts). Sirve para desarrollar sin conexión.

**Deploy Hook.** Settings → Git → Deploy Hooks. Crear uno apuntando a la rama de producción
y copiar la URL, que queda así:

```
https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyy
```

## 4 · El botón en la planilla

En la planilla: **Extensiones → Apps Script**, pegar esto, reemplazar la URL por la del
Deploy Hook, y guardar.

```js
const DEPLOY_HOOK = "https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyy";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🔄 Sitio web")
    .addItem("Publicar cambios", "publicarCambios")
    .addToUi();
}

function publicarCambios() {
  const ui = SpreadsheetApp.getUi();
  const res = UrlFetchApp.fetch(DEPLOY_HOOK, {
    method: "post",
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() >= 300) {
    ui.alert("No se pudo publicar (código " + res.getResponseCode() + "). Avisale a soporte.");
    return;
  }

  ui.alert("Listo. Los cambios van a estar online en menos de un minuto.");
}
```

Al recargar la planilla aparece el menú **🔄 Sitio web → Publicar cambios**.

La primera vez Google va a pedir autorización para que el script pueda salir a internet.
Hay que aceptarla una sola vez.

### Por qué un botón y no automático

Un disparador `onEdit` haría un deploy por cada celda que el cliente toca: treinta deploys
para actualizar diez precios. Con el botón edita tranquilo, revisa, y publica una sola vez.

Ojo con esto si alguna vez se quiere automatizar: el `onEdit` **simple** de Apps Script no
puede hacer llamadas HTTP. Hay que crear un disparador **instalable** desde el panel de
Activadores.

## Qué pasa si el cliente rompe la planilla

El build falla y **el sitio se queda con la última versión buena**. Nunca se publica una carta
rota. El error dice exactamente qué pasó y en qué fila:

```
planilla, fila 7: falta «precio». Completá esa celda o borrá la fila entera.
```

Vercel manda el mail de deploy fallido con ese mensaje adentro.

Casos cubiertos: falta un campo obligatorio, la hoja quedó despublicada (HTTP 404), no hay
ningún ítem, o Google no responde. En todos, el deploy se aborta en vez de publicar.
