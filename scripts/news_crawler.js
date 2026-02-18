const fs = require('fs');
const path = require('path');

// Fuentes de noticias
const SOURCES_PATH = path.join(__dirname, '../data/sources.json');
const STAGING_PATH = path.join(__dirname, '../data/news_staging.json');

async function fetchRSS(url) {
    try {
        const res = await fetch(url);
        const text = await res.text();
        // Simplicación extrema para no meter dependencias pesadas de momento
        // Si el usuario quiere más detalle, meteremos rss-parser
        const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
        return items.slice(0, 5).map(item => {
            const title = item.match(/<title>(.*?)<\/title>/)?.[1] || 'Sin título';
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
            // Imagen aleatoria de rock/punk rural
            const image = `https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop&sig=${Math.random()}`;
            return { title, link, pubDate, image, source: url, type: 'rss' };
        });
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

        // Lógica de scraping muy básica (buscamos enlaces de noticias o títulos recurrentes)
        // Esto se irá refinando por cada fuente específica si es necesario
        const newsItems = [];
        const images = [
            "https://images.unsplash.com/photo-1459749411177-042180ec75c0?q=80&w=600", // Concierto
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600", // Festival
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600"  // Guitarra
        ];

        if (source.url.includes('dip-badajoz')) {
            // Ejemplo específico para Dip. Badajoz
            const matches = html.match(/<a href="(noticias\.php\?id=.*?)">(.*?)<\/a>/g) || [];
            matches.slice(0, 5).forEach((m, idx) => {
                const link = 'https://www.dip-badajoz.es/cultura/cultura/' + m.match(/href="(.*?)"/)[1];
                const title = m.replace(/<[^>]+>/g, '').trim();
                newsItems.push({
                    title,
                    link,
                    date: new Date().toISOString(),
                    image: images[idx % images.length],
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
    // Reglas básicas de transformación para el tono Jorgazo
    return text
        .replace(/\balos\b/gi, 'a lxs')
        .replace(/\ba todos\b/gi, 'a todxs')
        .replace(/\bcompañeros\b/gi, 'compañerxs')
        .replace(/\bamigos\b/gi, 'amigxs')
        .replace(/\bjóvenes\b/gi, 'jovenxs');
}

async function main() {
    if (!fs.existsSync(SOURCES_PATH)) {
        console.error('No se encuentra data/sources.json');
        return;
    }

    const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
    let allNews = [];

    // Leer noticias existentes para evitar duplicados
    let existingNews = [];
    if (fs.existsSync(STAGING_PATH)) {
        try {
            existingNews = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
        } catch (e) {
            existingNews = [];
        }
    }

    // Procesar Instituciones
    for (const inst of sources.instituciones) {
        const news = await scrapeWeb(inst);
        allNews = [...allNews, ...news];
    }

    // Procesar Blogs
    for (const blog of sources.blogs_y_medios) {
        const rssUrl = blog.url.endsWith('/') ? `${blog.url}feed/` : `${blog.url}/feed/`;
        const news = await fetchRSS(rssUrl);
        allNews = [...allNews, ...news];
    }

    // Filtrar duplicados por link
    const uniqueLinks = new Set(existingNews.map(n => n.link));
    const newNews = allNews.filter(n => !uniqueLinks.has(n.link));

    // Aplicar filtro de lenguaje inclusivo y estilo "Post de Blog"
    const processedNews = newNews.map(n => {
        const inclusiveTitle = applyInclusiveLanguage(n.title);
        // Generar una entradilla más narrativa y original
        const blogIntro = `Compañerxs, traemos ruido fresco. ${inclusiveTitle} es la noticia que marca el ritmo hoy. En nuestrxs pueblos la escena no para y aquí te lo contamos con el filtro Jorgazo. ¡Echa un ojo a la fuente original y sigue apoyando lo rural! 🤘`;

        return {
            ...n,
            title: inclusiveTitle,
            summary: blogIntro,
            date: n.date || n.pubDate || new Date().toISOString()
        };
    });

    // Unir y guardar (manteniendo un historial razonable, ej: últimas 50)
    const finalNews = [...processedNews, ...existingNews].slice(0, 50);

    fs.writeFileSync(STAGING_PATH, JSON.stringify(finalNews, null, 2));

    // Guardar también en formato JS para bypass de CORS en local
    const jsContent = `const JORGAZO_NEWS = ${JSON.stringify(finalNews, null, 2)};`;
    fs.writeFileSync(path.join(__dirname, '../data/news_data.js'), jsContent);

    console.log(`Crawler finalizado. ${processedNews.length} noticias nuevas añadidas. Total en staging: ${finalNews.length}.`);
}

main();
