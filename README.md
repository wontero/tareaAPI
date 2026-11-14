# Explorador de contenido aleatorio

Programación Web III — Tarea de consumo de APIs públicas.

Página web en ASP.NET Core MVC que consume cuatro APIs públicas (citas, perros, gatos y datos curiosos) con `fetch` y `async/await`. Cada sección se actualiza de forma independiente sin recargar la página.

## Integrantes

- Mateo Montero Gonzales

## Instrucciones de ejecución

Requisito: [.NET SDK 10](https://dotnet.microsoft.com/download) y conexión a Internet.

1. Abrir una terminal en la carpeta del repositorio.
2. Ejecutar:

   ```bash
   dotnet run --project ExploradorContenido --launch-profile http
   ```

3. Abrir en el navegador `http://localhost:5124`.

También se puede abrir `ExploradorContenido/ExploradorContenido.csproj` con Visual Studio y presionar **F5**.

## Estructura

| Archivo | Contenido |
|---|---|
| `ExploradorContenido/Views/Home/Index.cshtml` | HTML de las cuatro tarjetas |
| `ExploradorContenido/Views/Shared/_Layout.cshtml` | Estructura general de la página y referencias a Bootstrap, CSS y JS |
| `ExploradorContenido/wwwroot/css/site.css` | Estilos propios (tamaño uniforme de imágenes, mensajes de estado) |
| `ExploradorContenido/wwwroot/js/site.js` | Lógica: una función por API, estados de carga y manejo de errores |

## Preguntas de reflexión

### 1. ¿Qué es un endpoint y cuál utilizaste para cada API?

Un endpoint es una URL concreta de una API a la que se le envía una solicitud para obtener (o modificar) un recurso específico. Cada endpoint responde con un formato definido, en este caso JSON.

| Sección | Método | Endpoint | Campo usado |
|---|---|---|---|
| Citas | GET | `https://dummyjson.com/quotes/random` | `quote`, `author` |
| Perros | GET | `https://dog.ceo/api/breeds/image/random` | `message` (URL de la imagen) |
| Gatos | GET | `https://cataas.com/cat?json=true` | `id`, con el que se arma `https://cataas.com/cat/{id}` |
| Datos curiosos | GET | `https://uselessfacts.jsph.pl/api/v2/facts/random?language=en` | `text` |

Para los gatos, a la URL de la imagen se le agrega `?width=600` porque algunas fotos originales pesan más de 1 MB y tardaban más de 10 segundos en cargar.

### 2. ¿Qué diferencia existe entre recibir JSON y recibir directamente una imagen?

Cuando la API devuelve JSON (`Content-Type: application/json`), la respuesta es texto con datos estructurados que hay que convertir a un objeto de JavaScript con `response.json()` para poder leer sus campos (por ejemplo, `id` o `message`).

Cuando la API devuelve directamente una imagen (`Content-Type: image/jpeg`, por ejemplo `https://cataas.com/cat`), la respuesta son los bytes binarios de la imagen. No se puede procesar con `response.json()` porque no es texto JSON y daría un error. En ese caso, lo más simple es usar la URL directamente como `src` de una etiqueta `<img>` y dejar que el navegador la descargue y la muestre.

Por eso, en la sección de gatos primero se pide `cat?json=true` para obtener el `id` y después se asigna `https://cataas.com/cat/{id}` al `src` de la imagen.

### 3. ¿Qué función cumplen `await` y `response.json()`?

- `fetch()` no devuelve los datos de inmediato, sino una *promesa* que se cumple cuando llega la respuesta del servidor. `await` pausa la ejecución de la función `async` hasta que esa promesa se resuelva, sin bloquear el resto de la página. Así el código se lee en orden, como si fuera sincrónico.
- `response.json()` lee el cuerpo de la respuesta y lo convierte de texto JSON a un objeto de JavaScript. También devuelve una promesa (porque el cuerpo puede seguir llegando), por eso se usa con `await`: `const datos = await response.json();`.

### 4. ¿Por qué se debe verificar `response.ok` además de utilizar `try/catch`?

`fetch` solo rechaza la promesa (y por lo tanto entra al `catch`) cuando hay un error de red: sin Internet, servidor caído, bloqueo de CORS, etc. Si el servidor sí responde pero con un código de error HTTP, como 404 o 500, `fetch` lo considera una respuesta válida y **no** lanza una excepción.

`response.ok` es `true` solo para códigos 200–299. Por eso se verifica y, si es `false`, se lanza un error manualmente (`throw new Error(...)`). Así ambos tipos de falla terminan en el mismo `catch` y se muestra el mensaje al usuario.

### 5. ¿Cómo lograste actualizar una sección sin recargar toda la página?

Cada sección tiene su propio botón con un `addEventListener("click", ...)` que llama a su función (`obtenerCita`, `obtenerPerro`, `obtenerGato` u `obtenerDatoCurioso`). Esa función hace la solicitud con `fetch` en segundo plano y, cuando llegan los datos, modifica solo los elementos del DOM de esa tarjeta (`textContent` del texto o `src` de la imagen).

El botón es `type="button"`, así que no envía ningún formulario y el navegador no recarga la página. Además, cada función tiene su propio `try/catch/finally`: si una API falla, solo esa tarjeta muestra el error y las demás siguen funcionando. El `finally` vuelve a habilitar el botón aunque haya ocurrido un error, para poder reintentar.
