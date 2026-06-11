const fs = require('fs');
const path = require('path');
const https = require('https');

// La URL pública del CSV de Google Sheets
// El usuario debe poner esto como un Secret (GOOGLE_SHEETS_CSV_URL) o en el archivo
const SHEET_URL = process.env.GOOGLE_SHEETS_CSV_URL;

if (!SHEET_URL) {
  console.error("ERROR: No se ha configurado la variable GOOGLE_SHEETS_CSV_URL.");
  console.error("Para obtenerla: Archivo > Compartir > Publicar en la web > Valores separados por comas (.csv)");
  process.exit(1);
}

// Función sencilla para parsear CSV (maneja comillas y comas dentro de comillas)
function parseCSV(text) {
  const lines = [];
  let currentLine = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"') {
      if (insideQuotes && text[i+1] === '"') {
        currentCell += '"';
        i++; // Saltar siguiente comilla
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentLine.push(currentCell.trim());
      currentCell = "";
    } else if (char === '\n' && !insideQuotes) {
      currentLine.push(currentCell.trim());
      lines.push(currentLine);
      currentLine = [];
      currentCell = "";
    } else if (char !== '\r') {
      currentCell += char;
    }
  }
  
  if (currentCell || currentLine.length > 0) {
    currentLine.push(currentCell.trim());
    lines.push(currentLine);
  }
  
  return lines;
}

https.get(SHEET_URL, (res) => {
  if (res.statusCode !== 200 && res.statusCode !== 307) {
    console.error(`Error al descargar: ${res.statusCode}`);
    process.exit(1);
  }

  // Handle redirects (Google Sheets sometimes redirects)
  const downloadUrl = res.headers.location || SHEET_URL;
  
  https.get(downloadUrl, (resp) => {
    let data = '';
    resp.on('data', (chunk) => data += chunk);
    
    resp.on('end', () => {
      const rows = parseCSV(data);
      if (rows.length < 2) {
        console.error("El CSV esta vacio o no tiene cabeceras.");
        process.exit(1);
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const products = [];

      const headersMap = {
        'id': 'id',
        'nombre': 'name',
        'descripcion': 'description',
        'precio': 'price',
        'imagen': 'image',
        'tallas': 'sizes',
        'colores': 'colors',
        'categoria': 'category',
        'stock': 'stock',
        'destacado': 'destacado'
      };

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < headers.length || !row[0]) continue; // Skip empty rows

        const product = {};
        headers.forEach((header, index) => {
          const engKey = headersMap[header] || header;
          let value = row[index] || "";
          
          if (engKey === 'price') {
            value = parseFloat(value) || 0;
          } else if (engKey === 'sizes' || engKey === 'colors') {
            value = value.split(',').map(s => s.trim()).filter(Boolean);
          } else if (engKey === 'stock') {
            value = parseInt(value, 10) || 0;
          } else if (engKey === 'destacado') {
            value = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'sí' || value.toLowerCase() === 'si';
          }
          
          product[engKey] = value;
        });

        products.push(product);
      }

      const jsonPath = path.join(__dirname, '../data/products.json');
      fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
      console.log(`Tienda sincronizada! ${products.length} productos actualizados.`);
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
