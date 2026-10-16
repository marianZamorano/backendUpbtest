require('dotenv').config();
const pool = require('../config/db');

// Datos de ejemplo para probar la API (incluye uno sin stock para probar el 409 de /:id/stock)
const productos = [
    { nombre: 'Laptop Lenovo', precio: 1500, stock: 10 },
    { nombre: 'Mouse inalámbrico', precio: 25.5, stock: 50 },
    { nombre: 'Teclado mecánico', precio: 80, stock: 20 },
    { nombre: 'Monitor 24 pulgadas', precio: 220, stock: 8 },
    { nombre: 'Audífonos USB', precio: 45.99, stock: 0 },
];

// Solo inserta los que no existen (por nombre), así se puede correr varias veces sin duplicar
const seed = async () => {
    for (const { nombre, precio, stock } of productos) {
        const { rowCount } = await pool.query(
            `INSERT INTO productos (nombre, precio, stock)
             SELECT $1::varchar, $2::numeric, $3::integer
             WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = $1::varchar)`,
            [nombre, precio, stock]
        );
        console.log(`${rowCount ? 'Creado ✅' : 'Ya existía ⏭️'}  ${nombre}`);
    }
};

seed()
    .catch((err) => console.error('Error al cargar datos ❌', err.message))
    .finally(() => pool.end());
