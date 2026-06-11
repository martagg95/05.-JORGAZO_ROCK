const fs = require('fs');
const path = require('path');
const https = require('https');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Verificar clave API de Gemini
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ ERROR: La variable GEMINI_API_KEY no está configurada.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Configuración de temas
const temas = [
  "La importancia de la autogestión en festivales de música",
  "El punk rural y cómo resiste lejos de las grandes ciudades",
  "Historia de la Fuente Lunara y el espíritu del Jorgazo",
  "Cómo preparar el pogo perfecto respetando a los demás",
  "El impacto del rock y punk en la juventud rural",
  "Por qué el merchandising autogestionado es vital para los festivales pequeños"
];

// Elegir un tema aleatorio
const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];

async function descargarImagen(prompt, rutaDestino) {
  return new Promise((resolve, reject) => {
    // Usamos pollinations.ai para generar la imagen gratis sin key
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=400&nologo=true`;
    
    console.log(`Descargando imagen desde: ${url}`);
    
    const file = fs.createWriteStream(rutaDestino);
    https.get(url, (response) => {
      // Manejar redirecciones si las hay
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
         https.get(response.headers.location, (res) => {
             res.pipe(file);
             file.on('finish', () => { file.close(); resolve(); });
         }).on('error', (err) => { fs.unlink(rutaDestino, () => {}); reject(err); });
      } else {
         response.pipe(file);
         file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => {
      fs.unlink(rutaDestino, () => {});
      reject(err);
    });
  });
}

async function generarPost() {
  console.log(`Generando artículo sobre: ${temaAleatorio}`);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Instrucciones estrictas: Sin emojis, natural, rural punk
    const prompt = `
      Escribe un artículo para el blog del festival "Jorgazo Rock", un festival punk-rock autogestionado y gratuito en Cabeza la Vaca (Extremadura).
      Tema: ${temaAleatorio}.
      
      Reglas OBLIGATORIAS:
      1. NO uses NINGÚN emoji en todo el texto (ni en el título, ni en el cuerpo). Esto es crítico.
      2. Tono natural, cercano, rebelde pero bien escrito, sin sonar artificial ni demasiado corporativo.
      3. Longitud adecuada (entre 400 y 600 palabras).
      4. DEBES incluir una URL real (o lo más parecida posible) a la fuente de la noticia o a la web de la banda/festival que se esté mencionando.
      5. Estructura el texto en formato JSON puro con la siguiente estructura, SIN markdown de código alrededor (empieza directamente con la llave {):
      {
        "title": "Título del post",
        "link": "URL real de la banda, festival o medio citado",
        "excerpt": "Un breve resumen de una oración",
        "content": "Contenido del post en formato HTML (usa <p>, <h2>, <strong>, etc.)",
        "imagePrompt": "Un prompt en INGLÉS detallado para generar una imagen..."
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Limpiar posibles etiquetas markdown residuales
    if (text.startsWith("```json")) {
        text = text.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    const postData = JSON.parse(text);

    // Fechas
    const fechaActual = new Date();
    const id = `post-${fechaActual.getTime()}`;
    const dateStr = fechaActual.toISOString().split('T')[0];

    // Preparar directorios
    const blogDir = path.join(__dirname, '../data');
    if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });
    
    const imagesDir = path.join(__dirname, '../assets/gallery/blog');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

    // Descargar imagen
    const imageFilename = `${id}.jpg`;
    const imagePath = path.join(imagesDir, imageFilename);
    const imageUrlPath = `assets/gallery/blog/${imageFilename}`;

    console.log(`Generando imagen con el prompt: ${postData.imagePrompt}`);
    await descargarImagen(postData.imagePrompt, imagePath);

    // Leer o crear archivo JSON de blog
    const blogJsonPath = path.join(blogDir, 'blog.json');
    let blogPosts = [];
    if (fs.existsSync(blogJsonPath)) {
        blogPosts = JSON.parse(fs.readFileSync(blogJsonPath, 'utf8'));
    }

    const nuevoPost = {
        id,
        title: postData.title,
        link: postData.link || "#",
        excerpt: postData.excerpt,
        content: postData.content,
        date: dateStr,
        image: imageUrlPath,
        status: "draft" // Empieza como borrador
    };

    blogPosts.unshift(nuevoPost); // Añadir al principio

    fs.writeFileSync(blogJsonPath, JSON.stringify(blogPosts, null, 2));

    console.log(`✅ ¡Post generado con éxito! ID: ${id}`);
    
  } catch (error) {
    console.error("❌ Ocurrió un error:", error);
    process.exit(1);
  }
}

generarPost();
