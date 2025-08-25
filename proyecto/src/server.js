require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'user_' + Date.now() + ext);
    }
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas conectado'))
  .catch(err => console.error('Error de conexión a MongoDB Atlas:', err));

// --- MODELO Y RUTAS DE ACUERDOS ---
const acuerdoSchema = new mongoose.Schema({
    id_visible: String,
    identificativo: String,
    fecha_comite: String,
    tipo_comite: String,
    autoridad: String,
    punto_agenda: String,
    acuerdos: String,
    vicepresidencia: String,
    unidad_responsable: String,
    unidad_seguimiento: String,
    correlativo: Number,
    archivos: [String],
    comentarios: [{ usuario: String, cargo: String, texto: String, fecha: Date }],
    estado: String, // <--- AGREGA ESTA LÍNEA
    fecha_creacion: { type: Date, default: Date.now }
});
const Acuerdo = mongoose.model('Acuerdo', acuerdoSchema);

// --- MODELO Y RUTAS DE USUARIOS ---
const usuarioSchema = new mongoose.Schema({
    nombre: String,
    usuario: String,
    contrasena: String,
    departamento: String,
    cargo: String
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Sirve los PDFs antes de cualquier middleware
app.use('/uploads/pdfs', express.static(path.join(__dirname, '../uploads/pdfs')));

// --- MIDDLEWARE DE AUTENTICACIÓN JWT ---
async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Busca el usuario en la base de datos
        const usuario = await Usuario.findOne({ usuario: decoded.usuario });
        if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' });
        req.usuario = usuario; // Aquí se guarda el usuario completo
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}

// --- RUTAS DE USUARIOS (PÚBLICAS) ---
app.post('/api/registro', async (req, res) => {
    const { nombre, usuario, contrasena, departamento, cargo } = req.body;
    if (!nombre || !usuario || !contrasena) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    try {
        const existe = await Usuario.findOne({ usuario });
        if (existe) return res.status(400).json({ error: 'El usuario ya existe' });
        const hash = await bcrypt.hash(contrasena, 10); // Cifra la contraseña
        const nuevoUsuario = new Usuario({
            nombre,
            usuario,
            contrasena: hash,
            departamento,
            cargo
        });
        await nuevoUsuario.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

app.post('/api/login', async (req, res) => {
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }
    try {
        const user = await Usuario.findOne({ usuario });
        if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

        const match = await bcrypt.compare(contrasena, user.contrasena);
        if (!match) return res.status(401).json({ error: 'Credenciales incorrectas' });

        // Genera el token con todos los datos necesarios
        const token = jwt.sign(
            {
                usuario: user.usuario,
                nombre: user.nombre,
                departamento: user.departamento,
                cargo: user.cargo
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ success: true, token, nombre: user.nombre, usuario: user.usuario, departamento: user.departamento, cargo: user.cargo });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

app.get('/api/usuario', async (req, res) => {
    const usuario = req.query.usuario;
    if (!usuario) return res.status(400).json({ error: 'Usuario requerido' });
    try {
        const user = await Usuario.findOne({ usuario });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ nombre: user.nombre, foto: user.foto });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

app.post('/api/configuracion', upload.single('foto'), async (req, res) => {
    const { usuario, nombre, contrasena } = req.body;
    let update = {};
    if (nombre) update.nombre = nombre;
    if (contrasena) update.contrasena = contrasena;
    if (req.file) update.foto = '/img/' + req.file.filename;
    try {
        const user = await Usuario.findOneAndUpdate({ usuario }, update, { new: true });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ success: true, foto: user.foto });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

// --- RUTAS DE ACUERDOS (PROTEGIDAS) ---
app.get('/api/acuerdos', authMiddleware, async (req, res) => {
    try {
        const acuerdos = await Acuerdo.find().sort({ fecha_creacion: -1 });
        res.json(acuerdos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener acuerdos' });
    }
});

app.get('/api/acuerdos/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const acuerdo = await Acuerdo.findById(id);
        if (!acuerdo) {
            return res.status(404).json({ error: 'Acuerdo no encontrado' });
        }
        res.json(acuerdo);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el acuerdo' });
    }
});

app.post('/api/acuerdos', authMiddleware, async (req, res) => {
    const cargoUsuario = req.usuario.cargo; // Ajusta según cómo guardas el usuario en el token
    if (cargoUsuario !== 'Gerente General') {
        return res.status(403).json({ error: 'No tienes permisos para crear acuerdos.' });
    }
    const data = req.body;

    if (!data.identificativo || !data.fecha_comite || !data.tipo_comite || !data.autoridad || !data.punto_agenda || !data.acuerdos || !data.vicepresidencia || !data.unidad_responsable || !data.unidad_seguimiento) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Extraer mes y año (últimos 2 dígitos) de fecha_comite
        let fecha_id = '';
        const partes = data.fecha_comite.split('/');
        if (partes.length === 3) {
            fecha_id = `${partes[1]}/${partes[2].slice(-2)}`; // MM/AA
        } else {
            fecha_id = data.fecha_comite;
        }

        // Buscar el correlativo actual para ese identificativo y fecha_comite
        const count = await Acuerdo.countDocuments({ identificativo: data.identificativo, fecha_comite: data.fecha_comite });
        const correlativo = count + 1;
        const correlativoStr = correlativo < 10 ? `0${correlativo}` : `${correlativo}`;
        const id_visible = `${data.identificativo} ${fecha_id}-1.${correlativoStr}`;

        // Insertar el nuevo acuerdo
        const nuevoAcuerdo = new Acuerdo({ ...data, id_visible, correlativo, estado: "Sin progreso" });
        await nuevoAcuerdo.save();
        res.status(201).json(nuevoAcuerdo);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el acuerdo' });
    }
});

app.put('/api/acuerdos/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    const {
        identificativo,
        fecha_comite,
        tipo_comite,
        autoridad,
        punto_agenda,
        acuerdos,
        vicepresidencia,
        unidad_responsable,
        unidad_seguimiento
    } = req.body;

    if (!identificativo || !fecha_comite || !tipo_comite || !autoridad || !punto_agenda || !acuerdos || !vicepresidencia || !unidad_responsable || !unidad_seguimiento) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Extraer mes y año (últimos 2 dígitos) de fecha_comite para id_visible
    let fecha_id = '';
    const partes = fecha_comite.split('/');
    if (partes.length === 3) {
        fecha_id = `${partes[1]}/${partes[2].slice(-2)}`; // MM/AA
    } else {
        fecha_id = fecha_comite;
    }

    // Buscar el correlativo actual para ese identificativo y fecha_comite
    const count = await Acuerdo.countDocuments({ identificativo, fecha_comite });
    const correlativo = count + 1;
    const correlativoStr = correlativo < 10 ? `0${correlativo}` : `${correlativo}`;
    const id_visible = `${identificativo} ${fecha_id}-1.${correlativoStr}`;

    try {
        const acuerdoActualizado = await Acuerdo.findByIdAndUpdate(
            id,
            {
                id_visible,
                identificativo,
                fecha_comite,
                tipo_comite,
                autoridad,
                punto_agenda,
                acuerdos,
                vicepresidencia,
                unidad_responsable,
                unidad_seguimiento,
                correlativo
            },
            { new: true }
        );
        res.json(acuerdoActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el acuerdo' });
    }
});

// Ruta para edición parcial (solo supervisores)
app.put('/api/acuerdos/:id/parcial', authMiddleware, async (req, res) => {
    if (req.usuario.cargo !== 'Supervisor') {
        return res.status(403).json({ error: 'No tienes permisos para editar parcialmente.' });
    }
    const { acuerdos, punto_agenda, estado } = req.body;
    try {
        const acuerdo = await Acuerdo.findById(req.params.id);
        if (!acuerdo) return res.status(404).json({ error: 'Acuerdo no encontrado' });

        acuerdo.acuerdos = acuerdos;
        acuerdo.punto_agenda = punto_agenda;
        acuerdo.estado = estado; // <--- IMPORTANTE

        await acuerdo.save();
        res.json({ success: true, acuerdo });
    } catch (error) {
        res.status(500).json({ error: 'Error al editar parcialmente el acuerdo' });
    }
});

app.delete('/api/acuerdos/:id', authMiddleware, async (req, res) => {
    try {
        await Acuerdo.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el acuerdo' });
    }
});

// Configuración de multer para guardar PDFs
const storagePdf = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/pdfs'); // Carpeta donde se guardan los PDFs
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const uploadPdf = multer({ storage: storagePdf, fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF'));
}});

// Ruta para subir PDF a un acuerdo
app.post('/api/acuerdos/:id/archivo', authMiddleware, uploadPdf.single('archivo'), async (req, res) => {
    try {
        const acuerdoId = req.params.id;
        const archivoPath = '/uploads/pdfs/' + req.file.filename;
        // Actualiza el acuerdo en la base de datos con la ruta del archivo
        await Acuerdo.findByIdAndUpdate(acuerdoId, { $push: { archivos: archivoPath } }); // si usas array
        // o
        // await Acuerdo.findByIdAndUpdate(acuerdoId, { archivo: archivoPath }); // si solo guardas uno
        res.json({ success: true, archivo: archivoPath });
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar el archivo' });
    }
});

app.delete('/api/acuerdos/:id/archivo/:idx', authMiddleware, async (req, res) => {
    try {
        const acuerdoId = req.params.id;
        const idx = parseInt(req.params.idx);
        const acuerdo = await Acuerdo.findById(acuerdoId);
        if (!acuerdo || !acuerdo.archivos || !acuerdo.archivos[idx]) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        const archivoPath = path.join(__dirname, '../', acuerdo.archivos[idx]);
        // Elimina el archivo físico
        fs.unlink(archivoPath, err => {
            // Ignora error si el archivo no existe
        });
        // Elimina la ruta del array
        acuerdo.archivos.splice(idx, 1);
        await acuerdo.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el archivo' });
    }
});

// --- RUTAS DE COMENTARIOS (PROTEGIDAS) ---
app.get('/api/acuerdos/:id/comentarios', authMiddleware, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'ID de acuerdo inválido' });
    }
    const acuerdo = await Acuerdo.findById(req.params.id);
    res.json(acuerdo?.comentarios || []);
});

app.post('/api/acuerdos/:id/comentarios', authMiddleware, async (req, res) => {
    const acuerdo = await Acuerdo.findById(req.params.id);
    if (!acuerdo) return res.status(404).json({ error: 'Acuerdo no encontrado' });
    const usuario = req.usuario.nombre || req.usuario.usuario;
    const cargo = req.usuario.cargo || '';
    const comentario = {
        usuario,
        cargo,
        texto: req.body.texto,
        fecha: new Date()
    };
    acuerdo.comentarios = acuerdo.comentarios || [];
    acuerdo.comentarios.push(comentario);
    await acuerdo.save();
    res.json({ success: true, comentario });
});

// Al cargar los acuerdos:
async function cargarAcuerdos() {
    // ...fetch...
    window.listaAcuerdos = acuerdos; // Guarda la lista globalmente
    renderTablaAcuerdos(acuerdos);
}

// Al abrir el modal de edición parcial:
async function abrirModalEditarParcial(id) {
    acuerdoParcialId = id;
    const acuerdos = window.listaAcuerdos || [];
    console.log('ID recibido:', id, 'IDs en lista:', acuerdos.map(a => a._id));
    const acuerdo = acuerdos.find(a => String(a._id) === String(id));
    if (!acuerdo) {
        alert('No se encontró el acuerdo');
        return;
    }
    document.getElementById('acuerdos-parcial').value = acuerdo.acuerdos || '';
    document.getElementById('punto-agenda-parcial').value = acuerdo.punto_agenda || '';
    document.getElementById('estado-parcial').value = acuerdo.estado || '';
    actualizarColorProgreso();
    document.getElementById('modal-editar-parcial').style.display = 'flex';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
