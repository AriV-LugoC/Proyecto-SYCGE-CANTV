if (!localStorage.getItem('token')) {
    window.location.href = '/login.html'; // Redirige al login si no hay token
}

document.addEventListener('DOMContentLoaded', () => {
    cargarAcuerdos();

    const formNuevoAcuerdo = document.getElementById('form-nuevo-acuerdo');
    if (formNuevoAcuerdo) {
        formNuevoAcuerdo.addEventListener('submit', async function(e) {
            e.preventDefault();

            const token = localStorage.getItem('token');
            if (!token) {
                alert('No tienes sesión activa');
                return;
            }

            // Obtén los datos del formulario
            const data = {
                identificativo: document.getElementById('identificativo').value,
                fecha_comite: document.getElementById('fecha_comite').value,
                tipo_comite: document.getElementById('tipo_comite').value,
                vicepresidencia: document.getElementById('vicepresidencia').value,
                autoridad: document.getElementById('autoridad').value,
                punto_agenda: document.getElementById('punto_agenda').value,
                acuerdos: document.getElementById('acuerdos').value,
                unidad_responsable: document.getElementById('unidad_responsable').value,
                unidad_seguimiento: document.getElementById('unidad_seguimiento').value,
                estado: "Sin iniciar" // <-- Aquí se asigna el estado inicial
            };

            try {
                const res = await fetch('/api/acuerdos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (res.ok) {
                    alert('Acuerdo creado correctamente');
                    cerrarModalNuevoAcuerdo();
                    cargarAcuerdos();
                } else {
                    alert(result.error || 'Error al crear el acuerdo');
                }
            } catch (err) {
                alert('Error de conexión con el servidor');
            }
        });
    }

    const btnToggleMenu = document.getElementById('btn-toggle-menu');
    if (btnToggleMenu) {
        btnToggleMenu.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('oculto');
        });
    }

    const cargoUsuario = localStorage.getItem('cargoUsuario');
    const btnNuevo = document.querySelector('.btn-nuevo-acuerdo');
    if (btnNuevo && cargoUsuario !== 'Gerente General') {
        btnNuevo.style.display = 'none';
    }
});

async function cargarAcuerdos() {
    const tbody = document.getElementById('tbody-acuerdos');
    tbody.innerHTML = '<tr><td colspan="10">Cargando...</td></tr>';
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/acuerdos', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const acuerdos = await res.json();
        if (!acuerdos || acuerdos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10">No hay acuerdos registrados.</td></tr>';
            return;
        }
        renderTablaAcuerdos(acuerdos); // Usa solo el render limpio
        window.acuerdos = acuerdos;
    } catch {
        tbody.innerHTML = '<tr><td colspan="10">Error al cargar acuerdos.</td></tr>';
    }
}

function formatoMesAnio(fecha) {
    const partes = fecha.split('/');
    if (partes.length === 3) {
        return `${partes[1]}/${partes[2].slice(-2)}`; // MM/AA
    }
    return fecha;
}

// Modal
function abrirModalNuevoAcuerdo() {
    document.getElementById('modal-nuevo-acuerdo').style.display = 'flex';
}
function cerrarModalNuevoAcuerdo() {
    document.getElementById('modal-nuevo-acuerdo').style.display = 'none';
}
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) cerrarModalNuevoAcuerdo();
});

let acuerdoEditandoId = null;

async function abrirModalEditarAcuerdo(id) {
    acuerdoEditandoId = id;
    // Obtén los datos del acuerdo
    const res = await fetch(`/api/acuerdos/${id}`);
    const acuerdo = await res.json();

    // Llena el formulario con los datos
    const form = document.getElementById('form-nuevo-acuerdo');
    form.identificativo.value = acuerdo.identificativo;
    form.fecha_comite.value = acuerdo.fecha_comite;
    form.tipo_comite.value = acuerdo.tipo_comite;
    form.vicepresidencia.value = acuerdo.vicepresidencia;
    form.autoridad.value = acuerdo.autoridad;
    form.punto_agenda.value = acuerdo.punto_agenda;
    form.acuerdos.value = acuerdo.acuerdos;
    form.unidad_responsable.value = acuerdo.unidad_responsable;
    form.unidad_seguimiento.value = acuerdo.unidad_seguimiento;

    abrirModalNuevoAcuerdo();
}

let acuerdoParcialId = null;

function abrirModalEditarParcial(id) {
    acuerdoParcialId = id;
    fetch(`/api/acuerdos/${id}`)
        .then(res => res.json())
        .then(acuerdo => {
            document.getElementById('estado').value = acuerdo.estado || '';
            document.getElementById('acuerdos').value = acuerdo.acuerdos || '';
            document.getElementById('punto_agenda').value = acuerdo.punto_agenda || '';
            document.getElementById('modal-editar-parcial').style.display = 'flex';
        });
}

function cerrarModalEditarParcial() {
    document.getElementById('modal-editar-parcial').style.display = 'none';
}

document.getElementById('form-editar-parcial').addEventListener('submit', async function(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = {
        estado: document.getElementById('estado').value,
        acuerdos: document.getElementById('acuerdos').value,
        punto_agenda: document.getElementById('punto_agenda').value
    };
    try {
        const res = await fetch(`/api/acuerdos/${acuerdoParcialId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            alert('Acuerdo actualizado');
            cerrarModalEditarParcial();
            cargarAcuerdos();
        } else {
            alert('Error al actualizar');
        }
    } catch {
        alert('Error de conexión');
    }
});

const siglasDeptos = {
    "Gerencia General de Tecnología": "GGT",
    "Gerencia General de Seguimiento y Control": "GGSC",
    "Gerencia General de Proyectos Mayores": "GGPM",
    "Gerencia General de Servicios y Logística": "GGSL",
    "Gerencia General de Sistemas": "GGSIS",
    "Gerencia General de Empresas Privadas": "GGEP",
    "Gerencia General de Energía y Climatización": "GGEC",
    "Gerencia General de Mercadeo": "GGMER",
    "Gerencia General de Mercados": "GGMDS",
    "Gerencia General de Instituciones Públicas": "GGIP",
    "Gerencia General de Gestión Humana": "GGGH",
    "Gerencia General de Infraestructura": "GGINF",
    "Gerencia General de Planificación": "GGPLAN",
    "Gerencia General de Procura": "GGPROC",
    "Gerencia General de Finanzas": "GGFIN",
    "Gerencia General de Gestión de Flotas": "GGGF",
    "Gerencia General de Operaciones de Telecomunicaciones": "GGOT",
    "Gerencia General de Operaciones Descentralizadas": "GGOD"
};

function renderTablaAcuerdos(acuerdos) {
    const tbody = document.getElementById('tbody-acuerdos');
    const cargoUsuario = localStorage.getItem('cargoUsuario');
    tbody.innerHTML = '';
    acuerdos.forEach(a => {
        const archivos = Array.isArray(a.archivos) ? a.archivos : (a.archivo ? [a.archivo] : []);
        tbody.innerHTML += `
            <tr>
                <td>${a.id_visible || ''}</td>
                <td>${a.fecha_comite || ''}</td>
                <td>${a.tipo_comite || ''}</td>
                <td>${a.autoridad || ''}</td>
                <td>${a.punto_agenda || ''}</td>
                <td>${a.acuerdos || ''}</td>
                <td>${a.unidad_responsable || ''}</td>
                <td>${a.vicepresidencia || ''}</td>
                <td>${a.estado || 'Sin iniciar'}</td>
                <td>
                    <div class="acciones-archivos" data-id="${a._id}">
                        <input type="file" accept="application/pdf" class="input-archivo" data-id="${a._id}">
                        <button class="btn-subir-archivo" data-id="${a._id}" style="display:none;">Subir Archivo</button>
                        <button class="btn-ver-archivos" data-id="${a._id}" ${archivos.length === 0 ? 'disabled' : ''}>Ver archivos</button>
                    </div>
                </td>
                <td>
                    <button class="btn-comentar-chat" data-id="${a._id}">💬 Comentarios</button>
                    ${cargoUsuario === 'Empleado Operativo' ? `
                        <button class="btn-comentar" data-id="${a._id}">Comentar</button>
                    ` : ''}
                    ${cargoUsuario === 'Supervisor' ? `
                        <button class="btn-editar-parcial" data-id="${a._id}">✏️ Editar parcial</button>
                        <button class="btn-ver-comentarios" data-id="${a._id}">👁️ Ver comentarios</button>
                    ` : ''}
                    ${cargoUsuario === 'Gerente General' ? `
                        <button class="btn-editar" data-id="${a._id}">📝 Editar</button>
                        <button class="btn-ver-comentarios" data-id="${a._id}">👁️ Ver comentarios</button>
                    ` : ''}
                </td>
            </tr>
        `;
    });

    // Mostrar botón "Subir Archivo" solo si hay archivo seleccionado
    document.querySelectorAll('.input-archivo').forEach(input => {
        input.addEventListener('change', function() {
            const btnSubir = input.parentElement.querySelector('.btn-subir-archivo');
            btnSubir.style.display = input.files.length > 0 ? 'inline-block' : 'none';
        });
    });

    // Evento para subir PDF
    document.querySelectorAll('.btn-subir-archivo').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = btn.getAttribute('data-id');
            const input = btn.parentElement.querySelector('.input-archivo');
            const file = input.files[0];
            if (!file) return alert('Selecciona un archivo PDF');
            const formData = new FormData();
            formData.append('archivo', file);
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`/api/acuerdos/${id}/archivo`, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token },
                    body: formData
                });
                if (res.ok) {
                    alert('Archivo subido correctamente');
                    cargarAcuerdos();
                } else {
                    alert('Error al subir el archivo');
                }
            } catch {
                alert('Error de conexión');
            }
        });
    });

    // Evento para abrir el modal
    document.querySelectorAll('.btn-ver-archivos').forEach(btn => {
        btn.onclick = function() {
            const id = btn.getAttribute('data-id');
            const acuerdo = window.acuerdos.find(a => a._id === id);
            abrirModalArchivos(acuerdo);
        };
    });

    // Evento para abrir el modal de comentarios
    document.querySelectorAll('.btn-comentar-chat').forEach(btn => {
        btn.onclick = function() {
            const id = btn.getAttribute('data-id');
            abrirModalComentarios(id);
        };
    });
}

// Evento para abrir el modal desde la tabla
document.querySelectorAll('.btn-ver-archivos').forEach(btn => {
    btn.onclick = function() {
        const id = btn.getAttribute('data-id');
        const acuerdo = window.acuerdos.find(a => a._id === id);
        abrirModalArchivos(acuerdo);
    };
});

let acuerdoComentariosId = null;
let comentariosInterval = null;

async function abrirModalComentarios(id) {
    acuerdoComentariosId = id;
    document.getElementById('modal-comentarios').style.display = 'flex';
    await cargarComentarios(id);
    // Inicia el intervalo para refrescar comentarios cada 5 segundos
    comentariosInterval = setInterval(() => cargarComentarios(id), 1000);
}

function cerrarModalComentarios() {
    document.getElementById('modal-comentarios').style.display = 'none';
    document.getElementById('chat-comentarios').innerHTML = '';
    document.getElementById('input-comentario').value = '';
    // Detiene el intervalo al cerrar el modal
    if (comentariosInterval) {
        clearInterval(comentariosInterval);
        comentariosInterval = null;
    }
}

async function cargarComentarios(id) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/acuerdos/${id}/comentarios`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const comentarios = await res.json();
        mostrarComentarios(comentarios);
    } catch {
        document.getElementById('chat-comentarios').innerHTML = '<div>Error al cargar comentarios.</div>';
    }
}

function mostrarComentarios(comentarios) {
    const chat = document.getElementById('chat-comentarios');
    chat.innerHTML = '';
    if (!comentarios || comentarios.length === 0) {
        chat.innerHTML = '<div style="color:#888;">Sin comentarios aún.</div>';
        return;
    }
    comentarios.forEach(c => {
        chat.innerHTML += `
            <div style="margin-bottom:8px;">
                <span style="font-weight:bold;color:#2196f3;">${c.usuario} (${c.cargo})</span>
                <span style="background:#f1f1f1;padding:6px 12px;border-radius:12px;display:inline-block;margin-left:6px;">${c.texto}</span>
                <span style="font-size:0.8em;color:#888;margin-left:8px;">${new Date(c.fecha).toLocaleString()}</span>
            </div>
        `;
    });
}

document.getElementById('form-comentar').addEventListener('submit', async function(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const texto = document.getElementById('input-comentario').value.trim();
    if (!texto) return;
    try {
        const res = await fetch(`/api/acuerdos/${acuerdoComentariosId}/comentarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ texto })
        });
        if (res.ok) {
            document.getElementById('input-comentario').value = '';
            await cargarComentarios(acuerdoComentariosId);
        } else {
            alert('Error al enviar comentario');
        }
    } catch {
        alert('Error de conexión');
    }
});

function abrirModalArchivos(acuerdo) {
    const lista = document.getElementById('lista-archivos');
    lista.innerHTML = '';
    if (!acuerdo.archivos || acuerdo.archivos.length === 0) {
        lista.innerHTML = '<li>No hay archivos PDF subidos.</li>';
    } else {
        acuerdo.archivos.forEach((pdf, idx) => {
            lista.innerHTML += `
                <li style="margin-bottom:12px; display:flex; align-items:center; gap:10px;">
                    <span>PDF ${idx + 1}</span>
                    <a href="${pdf}" target="_blank" class="btn-pdf" title="Abrir PDF">📄 Abrir</a>
                    <a href="${pdf}" download class="btn-pdf" title="Descargar PDF">⬇️ Descargar</a>
                    <button class="btn-eliminar-archivo" data-id="${acuerdo._id}" data-idx="${idx}" title="Eliminar PDF">🗑️ Eliminar</button>
                </li>
            `;
        });
    }
    document.getElementById('modal-archivos').style.display = 'flex';

    // Evento eliminar
    document.querySelectorAll('.btn-eliminar-archivo').forEach(btn => {
        btn.onclick = async function() {
            const id = btn.getAttribute('data-id');
            const idx = btn.getAttribute('data-idx');
            if (!confirm('¿Seguro que deseas eliminar este archivo?')) return;
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`/api/acuerdos/${id}/archivo/${idx}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (res.ok) {
                    alert('Archivo eliminado');
                    cerrarModalArchivos();
                    cargarAcuerdos();
                } else {
                    alert('Error al eliminar el archivo');
                }
            } catch {
                alert('Error de conexión');
            }
        };
    });
}

function cerrarModalArchivos() {
    document.getElementById('modal-archivos').style.display = 'none';
}

// Oculta el botón de agregar si es empleado operativo
const cargoUsuario = localStorage.getItem('cargoUsuario');
if (cargoUsuario === 'Empleado Operativo') {
    const btnNuevoAcuerdo = document.getElementById('btn-nuevo-acuerdo');
    if (btnNuevoAcuerdo) btnNuevoAcuerdo.style.display = 'none';
}

if (cargoUsuario === 'Empleado') {
    const btnNuevoAcuerdo = document.getElementById('btn-nuevo-acuerdo');
    if (btnNuevoAcuerdo) btnNuevoAcuerdo.style.display = 'none';
}