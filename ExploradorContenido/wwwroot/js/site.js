const URL_CITAS = "https://dummyjson.com/quotes/random";
const URL_PERROS = "https://dog.ceo/api/breeds/image/random";
const URL_GATOS = "https://cataas.com/cat?json=true";
const URL_DATOS_CURIOSOS = "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en";

// Agrupa los elementos de una tarjeta: mensaje de estado, contenido y botón
function obtenerElementosSeccion(idSeccion) {
    const seccion = document.getElementById(idSeccion);
    return {
        estado: seccion.querySelector(".estado"),
        contenido: seccion.querySelector(".contenido"),
        boton: seccion.querySelector("button")
    };
}

const seccionCita = obtenerElementosSeccion("seccion-cita");
const seccionPerro = obtenerElementosSeccion("seccion-perro");
const seccionGato = obtenerElementosSeccion("seccion-gato");
const seccionDato = obtenerElementosSeccion("seccion-dato");

function mostrarCargando(seccion) {
    seccion.boton.disabled = true;
    seccion.contenido.hidden = true;
    seccion.estado.classList.remove("error");
    seccion.estado.textContent = "Cargando…";
    seccion.estado.hidden = false;
}

function mostrarContenido(seccion) {
    seccion.estado.hidden = true;
    seccion.contenido.hidden = false;
}

function mostrarError(seccion, mensaje, error) {
    console.error(mensaje, error);
    seccion.contenido.hidden = true;
    seccion.estado.classList.add("error");
    seccion.estado.textContent = `${mensaje} Revisá tu conexión y presioná el botón para reintentar.`;
    seccion.estado.hidden = false;
}

// Hace la solicitud GET y devuelve el JSON; lanza un error si el servidor no respondió con éxito
async function consultarJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`El servidor respondió con el código ${response.status}`);
    }
    return await response.json();
}

// Espera a que la imagen termine de cargar para que el error de carga también caiga en el catch
function cargarImagen(imagen, url) {
    return new Promise((resolve, reject) => {
        // Si la API repite la misma URL ya cargada, el navegador no vuelve a disparar "load"
        if (imagen.src === url && imagen.complete && imagen.naturalWidth > 0) {
            resolve();
            return;
        }
        imagen.onload = () => resolve();
        imagen.onerror = () => reject(new Error(`No se pudo cargar la imagen ${url}`));
        imagen.src = url;
    });
}

async function obtenerCita() {
    mostrarCargando(seccionCita);
    try {
        const cita = await consultarJson(URL_CITAS);
        document.getElementById("texto-cita").textContent = `“${cita.quote}”`;
        document.getElementById("autor-cita").textContent = cita.author;
        mostrarContenido(seccionCita);
    } catch (error) {
        mostrarError(seccionCita, "No se pudo obtener la cita.", error);
    } finally {
        seccionCita.boton.disabled = false;
    }
}

async function obtenerPerro() {
    mostrarCargando(seccionPerro);
    try {
        const respuestaPerro = await consultarJson(URL_PERROS);
        await cargarImagen(document.getElementById("imagen-perro"), respuestaPerro.message);
        mostrarContenido(seccionPerro);
    } catch (error) {
        mostrarError(seccionPerro, "No se pudo obtener la imagen del perro.", error);
    } finally {
        seccionPerro.boton.disabled = false;
    }
}

async function obtenerGato() {
    mostrarCargando(seccionGato);
    try {
        // La API devuelve JSON con el id del gato; la imagen se pide aparte con ese id.
        // width=600 reduce la foto (algunas pesan más de 1 MB y tardan >10 s)
        const respuestaGato = await consultarJson(URL_GATOS);
        const urlImagenGato = `https://cataas.com/cat/${respuestaGato.id}?width=600`;
        await cargarImagen(document.getElementById("imagen-gato"), urlImagenGato);
        mostrarContenido(seccionGato);
    } catch (error) {
        mostrarError(seccionGato, "No se pudo obtener la imagen del gato.", error);
    } finally {
        seccionGato.boton.disabled = false;
    }
}

async function obtenerDatoCurioso() {
    mostrarCargando(seccionDato);
    try {
        const datoCurioso = await consultarJson(URL_DATOS_CURIOSOS);
        document.getElementById("texto-dato").textContent = datoCurioso.text;
        mostrarContenido(seccionDato);
    } catch (error) {
        mostrarError(seccionDato, "No se pudo obtener el dato curioso.", error);
    } finally {
        seccionDato.boton.disabled = false;
    }
}

seccionCita.boton.addEventListener("click", obtenerCita);
seccionPerro.boton.addEventListener("click", obtenerPerro);
seccionGato.boton.addEventListener("click", obtenerGato);
seccionDato.boton.addEventListener("click", obtenerDatoCurioso);

// Carga inicial: cada sección es independiente, si una falla las demás siguen
obtenerCita();
obtenerPerro();
obtenerGato();
obtenerDatoCurioso();
