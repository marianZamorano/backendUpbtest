const productoRepository = require('../repositories/producto.repository');
const HttpError = require('../utils/http-error');

const validarId = (id) => {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
    return numero;
};

// Si viene un nombre busca por coincidencia; si viene vacío lista todos
const listar = (nombre) => {
    const texto = typeof nombre === 'string' ? nombre.trim() : '';
    if (texto) return productoRepository.findByNombre(texto);
    return productoRepository.findAll();
};

const obtenerPorId = async (id) => {
    const producto = await productoRepository.findById(validarId(id));
    if (!producto) throw new HttpError(404, 'Producto no encontrado');
    return producto;
};

const crear = (datos) => productoRepository.create(datos);

// Actualización parcial: los campos que no se envían conservan su valor actual
const actualizar = async (id, datos) => {
    const actual = await obtenerPorId(id);
    return productoRepository.update(actual.id, {
        nombre: datos.nombre ?? actual.nombre,
        precio: datos.precio ?? actual.precio,
        stock: datos.stock ?? actual.stock,
    });
};

// El repositorio solo actualiza si el stock no queda negativo; si no actualizó,
// averiguamos si fue porque no existe (404) o porque no alcanza el stock (409)
const ajustarStock = async (id, cantidad) => {
    const productoId = validarId(id);
    const producto = await productoRepository.ajustarStock(productoId, cantidad);
    if (producto) return producto;
    const actual = await obtenerPorId(productoId);
    throw new HttpError(409, `Stock insuficiente: disponible ${actual.stock}, se intentó restar ${-cantidad}`);
};

const eliminar = async (id) => {
    const eliminado = await productoRepository.remove(validarId(id));
    if (!eliminado) throw new HttpError(404, 'Producto no encontrado');
};

module.exports = { listar, obtenerPorId, crear, actualizar, ajustarStock, eliminar };
