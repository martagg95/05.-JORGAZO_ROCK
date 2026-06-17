const fs = require('fs');
const path = require('path');

// Fuentes de noticias
const SOURCES_PATH = path.join(__dirname, '../data/sources.json');
const STAGING_PATH = path.join(__dirname, '../data/news_staging.json');

/**
 * Filter to strictly focus on Extremadura punk/rock or female bands.
 */
function isRelevantContent(title, description) {
    const text = (title + " " + description).toLowerCase();

    // Palabras clave Extremadura (geografía, festivales, bandas locales)
    // NOTA INTERNA: El Extremúsika NO debe aparecer nunca en el Jorgazo Rock.
    // No incluir 'extremúsika', 'extremusika' ni nada relacionado con este festival.
    const keywordsExtremadura = [
        'extremadura', 'cáceres', 'caceres', 'badajoz', 'plasencia', 'mérida', 'merida',
        'bellota', 'guadiana', 'jerte', 'almendralejo', 'don benito', 'villanueva',
        'zarza de granadilla', 'valdencín', 'ceclavín', 'pinofranqueado',
        'bellota rock', 'sanguijuelas', 'sinkope',
        'extremoduro', 'buitre', 'ama'
    ];

    // Palabras clave Punk-Rock femenino
    const keywordsMujeres = [
        'mujer', 'mujeres', 'femenino', 'femenina', 'chica', 'chicas', 'girl', 'girls',
        'riot grrrl', 'bala', 'ginebras', 'lisasinson', 'hinds', 'cariño', 'dover',
        'ampuero', 'mafia', 'viudas', 'banda femenina', 'vocalista', 'cantante', 'bajista', 'batería'
    ];

    const allKeywords = [...keywordsExtremadura, ...keywordsMujeres];

    return allKeywords.some(kw => text.includes(kw));
}

async function fetchRSS(url) {
    try {
        console.log(`Buscando RSS en: ${url}`);
        const res = await fetch(url);
        const text = await res.text();
        const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
        // Imágenes gratuitas (Rock/Punk) para fallback si el RSS no incluye foto
        const freeImages = [
            "https://images.unsplash.com/photo-1459749411177-042180ec75c0?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop"
        ];

        return items.slice(0, 5).map(item => {
            const title = item.match(/<title>(.*?)<\/title>/)?.[1] || 'Sin título';
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

            // Extraer descripción (evitando tags HTML si podemos)
            let description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                item.match(/<description>(.*?)<\/description>/)?.[1] || '';

            // Limpiar HTML de la descripción
            description = description.replace(/<[^>]+>/g, '').trim();

            const randomFreeImg = freeImages[Math.floor(Math.random() * freeImages.length)];

            // Fallback: usar una imagen libre y segura
            let image = randomFreeImg;

            // Intentar extraer la imagen original de la fuente con varias estrategias
            const imgMatch = item.match(/<img[^>]+src="([^">]+)"/i) ||
                item.match(/url="([^">]+\.(jpg|jpeg|png|webp|gif)[^">]*)"/i) ||
                item.match(/<media:content[^>]+url="([^">]+)"/i);

            if (imgMatch && imgMatch[1] && !imgMatch[1].includes('gravatar')) {
                const extractedImg = imgMatch[1];
                // COMPROBACIÓN DE LICENCIA/USO GRATUITO:
                // Si la imagen extraída no es segura (tiene © o es de stock de pago), la descartamos y mantenemos el fallback gratuito.
                if (isImageFreeToUse(extractedImg)) {
                    image = extractedImg;
                } else {
                    console.log(`[Seguridad Legal] Imagen rechazada (posible copyright): ${extractedImg}`);
                }
            }

            // Aplicar el filtro estricto antes de aceptar la noticia
            if (!isRelevantContent(title, description)) {
                return null;
            }

            return { title, link, pubDate, image, description, source: url, type: 'rss' };
        }).filter(item => item !== null); // Eliminar los nulls del filtro
    } catch (e) {
        console.error(`Error fetching RSS from ${url}:`, e.message);
        return [];
    }
}

async function scrapeWeb(source) {
    try {
        console.log(`Rastreando web: ${source.nombre} (${source.url})`);
        const res = await fetch(source.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();

        const newsItems = [];
        const localImages = [
            "../../assets/gallery/full/asistentes_jorgazorock.webp",
            "../../assets/gallery/full/banda_y_ninos_dentro_2024.webp",
            "../../assets/gallery/full/grupo1_jorgazorock_2024.webp"
        ];

        if (source.url.includes('dip-badajoz')) {
            const matches = html.match(/<a href="(noticias\.php\?id=.*?)">(.*?)<\/a>/g) || [];
            matches.slice(0, 5).forEach((m, idx) => {
                const link = 'https://www.dip-badajoz.es/cultura/cultura/' + m.match(/href="(.*?)"/)[1];
                const title = m.replace(/<[^>]+>/g, '').trim();
                newsItems.push({
                    title,
                    link,
                    date: new Date().toISOString(),
                    image: localImages[idx % localImages.length],
                    description: "Noticia de soporte y cultura desde la Diputación, apostando por lo nuestro.",
                    source: source.nombre,
                    type: 'web'
                });
            });
        }

        return newsItems;
    } catch (e) {
        console.error(`Error scraping ${source.nombre}:`, e.message);
        return [];
    }
}

function applyInclusiveLanguage(text) {
    return text
        .replace(/\balos\b/gi, 'a lxs')
        .replace(/\ba todos\b/gi, 'a todxs')
        .replace(/\bcompañeros\b/gi, 'compañerxs')
        .replace(/\bamigos\b/gi, 'amigxs')
        .replace(/\bjóvenes\b/gi, 'jovenxs');
}

function truncateToWords(text, numWords) {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length <= numWords) return text;
    return words.slice(0, numWords).join(" ") + "...";
}

/**
 * Validates if an image URL from an RSS feed is seemingly free to use.
 * Rejects common proprietary stock photo domains or copyright marks in the filename.
 */
function isImageFreeToUse(url) {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();

    // Si contiene la marca explícita de copyright (©) rechazar inmediatamente
    if (lowerUrl.includes('©') || lowerUrl.includes('%c2%a9')) return false;

    // Dominios o palabras clave de estricto copyright
    const restrictedKeywords = [
        'getty', 'shutterstock', 'istock', 'alamy', 'depositphotos',
        '123rf', 'stockphoto', 'adobe', 'copyright', 'protected', 'watermark'
    ];

    for (const kw of restrictedKeywords) {
        if (lowerUrl.includes(kw)) {
            return false;
        }
    }

    return true;
}

async function main() {
    if (!fs.existsSync(SOURCES_PATH)) {
        console.error('No se encuentra data/sources.json');
        return;
    }

    const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
    let allNews = [];
    let existingNews = [];

    if (fs.existsSync(STAGING_PATH)) {
        try {
            existingNews = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
        } catch (e) {
            existingNews = [];
        }
    }

    for (const inst of sources.instituciones) {
        const news = await scrapeWeb(inst);
        allNews = [...allNews, ...news];
    }

    for (const blog of sources.blogs_y_medios) {
        // Ignorar facebook/instagram en el scraper general sin API
        if (blog.tipo === 'facebook' || blog.tipo === 'instagram') continue;

        const rssUrl = blog.url.endsWith('/') ? `${blog.url}feed/` : `${blog.url}/feed/`;
        const news = await fetchRSS(rssUrl);
        // Limpiamos la URL para poner el nombre bonito
        news.forEach(n => n.source = blog.nombre);
        allNews = [...allNews, ...news];
    }

    // Filtrar duplicados por link
    const uniqueLinks = new Set(existingNews.map(n => n.link));
    const newNews = allNews.filter(n => !uniqueLinks.has(n.link));

    // Array de imágenes locales como último recurso muy puntual (fallback del fallback)
    const localFallbackImages = [
        "../../assets/gallery/full/banda_y_ninos_dentro_2024.webp",
        "../../assets/gallery/full/grupo1_jorgazorock_2024.webp"
    ];

    const intros = [
        `Desde {source} nos traen ruido fresco`,
        `El radar del Jorgazo ha captado munición pesada en {source}`,
        `Atención a lo que acaban de publicar lxs compañerxs de {source}`,
        `Se masca la tragedia sonando desde {source}`,
        `Nuevos acordes y actitud a la vista vía {source}`,
        `Rompiendo amplificadores con esta novedad en {source}`,
        `Desde la trinchera informativa de {source} nos cuentan esto`,
        `Noticias que queman desde el altavoz de {source}`,
        `Puro veneno musical directo de la portada de {source}`,
        `Apuntad esto que nos manda la gente de {source}`
    ];

    // Aplicar filtro de lenguaje inclusivo y DERECHO DE CITA
    const processedNews = newNews.map(n => {
        const inclusiveTitle = applyInclusiveLanguage(n.title);

        // Extraer max 20 palabras de la descripción para Derecho de Cita
        const shortExtract = truncateToWords(n.description || n.title, 20);

        const randomIntro = intros[Math.floor(Math.random() * intros.length)].replace('{source}', n.source);
        const blogIntro = `${randomIntro}: "${applyInclusiveLanguage(shortExtract)}". Apoya al periodismo e iniciativas rurales y lee el resto en la fuente original. 👇`;

        // Si por algún motivo se corrompió la imagen en el proceso, le damos una muy puntual de muestra local
        let finalImage = n.image;
        if (!finalImage || finalImage.trim() === '') {
            finalImage = localFallbackImages[Math.floor(Math.random() * localFallbackImages.length)];
        }

        return {
            title: inclusiveTitle,
            link: n.link,
            date: n.date || n.pubDate || new Date().toISOString(),
            image: finalImage,
            summary: blogIntro,
            source: n.source,
            type: n.type
        };
    });

    const finalNews = [...processedNews, ...existingNews].slice(0, 50);

    fs.writeFileSync(STAGING_PATH, JSON.stringify(finalNews, null, 2));

    const jsContent = `const JORGAZO_NEWS = ${JSON.stringify(finalNews, null, 2)};`;
    fs.writeFileSync(path.join(__dirname, '../data/news_data.js'), jsContent);

    console.log(`Crawler finalizado. ${processedNews.length} noticias añadidas. Total en staging: ${finalNews.length}.`);
}

main();
