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
            tbody.innerHTML = '<tr><td colspan="5">No hay acuerdos registrados.</td></tr>';
            return;
        }
        acuerdos = acuerdos.filter(a => a.unidad_responsable === departamentoUsuario);
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

document.addEventListener('DOMContentLoaded', () => {
    cargarReportes();
});
