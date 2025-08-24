if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
}

// Expulsar usuario tras 20 minutos
const tiempoMaximoSesion = 20 * 60 * 1000;
setTimeout(() => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}, tiempoMaximoSesion);

async function cargarReportes() {
    const tbody = document.getElementById('tbody-reportes');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    try {
        const token = localStorage.getItem('token');
        const departamentoUsuario = localStorage.getItem('departamento');
        const res = await fetch('/api/acuerdos', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        let acuerdos = await res.json();
        if (!acuerdos || acuerdos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay reportes.</td></tr>';
            return;
        }
        // Filtra los acuerdos de ese departamento que NO están culminados
        acuerdos = acuerdos.filter(a => a.unidad_responsable === departamentoUsuario && a.estado !== '100%');
        renderTablaReportes(acuerdos);
    } catch {
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar reportes.</td></tr>';
        mostrarNotificacion('Error al cargar reportes', 'error');
    }
}

function renderTablaReportes(acuerdos) {
    const tbody = document.getElementById('tbody-reportes');
    tbody.innerHTML = '';
    acuerdos.forEach(a => {
        tbody.innerHTML += `
            <tr>
                <td>${a.id_visible || ''}</td>
                <td>${a.acuerdos || ''}</td>
                <td>${a.fecha_comite || ''}</td>
                <td>${a.estado || 'Sin iniciar'}</td>
                <td>
                    <button class="btn-ver btn-ver-ficha" data-id="${a._id}" title="Ver acuerdo completo">
                        <i class="fa fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// Usa la función del modal de acuerdos.js para mostrar el acuerdo completo
document.addEventListener('click', async function(e) {
    if (e.target.closest('.btn-ver-ficha')) {
        const id = e.target.closest('.btn-ver-ficha').getAttribute('data-id');
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/acuerdos/${id}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const acuerdo = await res.json();
        // Llama directamente a la función global de acuerdos.js
        if (typeof mostrarFichaAcuerdo === 'function') {
            mostrarFichaAcuerdo(acuerdo);
        } else {
            alert('No se encontró la función para mostrar el acuerdo.');
        }
    }
});

document.getElementById('btn-ver-culminados').onclick = async function() {
    const token = localStorage.getItem('token');
    const departamentoUsuario = localStorage.getItem('departamento');
    const res = await fetch('/api/acuerdos', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    let acuerdos = await res.json();
    acuerdos = acuerdos.filter(a => a.estado === '100%' && a.unidad_responsable === departamentoUsuario);
    const tbody = document.getElementById('tbody-culminados');
    tbody.innerHTML = '';
    if (acuerdos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay acuerdos culminados.</td></tr>';
    } else {
        acuerdos.forEach(a => {
            const archivos = Array.isArray(a.archivos) ? a.archivos : [];
            tbody.innerHTML += `
                <tr>
                    <td>${a.id_visible || ''}</td>
                    <td>${a.acuerdos || ''}</td>
                    <td>${a.fecha_comite || ''}</td>
                    <td>${a.fecha_culminacion ? new Date(a.fecha_culminacion).toLocaleDateString() : '-'}</td>
                    <td>
                        ${archivos.map(pdf => `
                            <a href="${pdf}" target="_blank" class="btn-pdf" title="Abrir PDF">
                                <i class="fa fa-file-pdf"></i>
                            </a>
                        `).join('')}
                    </td>
                    <td>
                        <button class="btn-ver btn-ver-ficha" data-id="${a._id}" title="Ver acuerdo completo">
                            <i class="fa fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    document.getElementById('modal-culminados').style.display = 'flex';
};

// Cerrar el modal
function cerrarModalCulminados() {
    document.getElementById('modal-culminados').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarReportes();
});
