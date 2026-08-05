const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./hausag.sqlite');

function getRandomVariant(variants) {
  return variants[Math.floor(Math.random() * variants.length)];
}

const templates = {
  radiator500: [
    "Máxima eficiencia térmica en un formato de {X} elementos. Ideal para mantener tus ambientes cálidos con un diseño impecable.",
    "Radiador de aluminio inyectado de alto rendimiento ({X} elementos). Combina tecnología de calefacción con una terminación estética de primer nivel.",
    "Confort garantizado para tu hogar. Este equipo de {X} elementos ofrece una excelente distribución del calor y es muy fácil de instalar.",
    "Diseñado para durar. Modelo de {X} elementos que asegura un ambiente perfectamente climatizado durante todo el invierno."
  ],
  radiator350: [
    "Formato compacto de {X} elementos (350mm). La solución perfecta para espacios más bajos sin perder potencia calórica.",
    "Rendimiento térmico superior en un tamaño reducido. Cuenta con {X} elementos de puro aluminio inyectado.",
    "Ideal para instalaciones debajo de ventanales o en espacios limitados. Sus {X} elementos garantizan el confort que buscás."
  ],
  toallero: [
    "El complemento ideal para tu baño. Mantené tus toallas secas y cálidas mientras disfrutás de un ambiente súper confortable.",
    "Calefacción y diseño en un solo producto. Un toallero resistente, elegante y pensado para el confort diario."
  ],
  faucet: [
    "Grifería de alta prestación con cierre suave y preciso. Un toque de elegancia y funcionalidad indispensable para tu cocina.",
    "Renová tu espacio con este monocomando de diseño contemporáneo. Fabricado con materiales de primera línea para garantizar su durabilidad.",
    "Control total del caudal y la temperatura en una pieza de diseño único. Creada para resistir el uso intenso del día a día.",
    "Estética minimalista y excelente desempeño. Esta grifería se adapta a cualquier estilo aportando personalidad y confort de uso."
  ]
};

db.all('SELECT id, title FROM Products', [], (err, rows) => {
  if (err) throw err;
  
  let stmt = db.prepare("UPDATE Products SET short_description = ? WHERE id = ?");
  
  rows.forEach(row => {
    let desc = "";
    const title = row.title.toLowerCase();
    
    if (title.includes("radiador") && title.includes("500") && !title.includes("toallero")) {
      const match = title.match(/(\d+)\s*elementos/i);
      const elements = match ? match[1] : "varios";
      desc = getRandomVariant(templates.radiator500).replace("{X}", elements);
    } else if (title.includes("radiador") && title.includes("350") && !title.includes("toallero")) {
      const match = title.match(/(\d+)\s*elementos/i);
      const elements = match ? match[1] : "varios";
      desc = getRandomVariant(templates.radiator350).replace("{X}", elements);
    } else if (title.includes("toallero")) {
      desc = getRandomVariant(templates.toallero);
    } else if (title.includes("griferia") || title.includes("monocomando")) {
      desc = getRandomVariant(templates.faucet);
    } else {
      desc = "Producto original de altísima calidad y diseño, pensado para brindar la mejor experiencia en tu hogar.";
    }
    
    stmt.run(desc, row.id);
  });
  
  stmt.finalize(() => {
    console.log('Short descriptions generated and updated successfully!');
    db.close();
  });
});
