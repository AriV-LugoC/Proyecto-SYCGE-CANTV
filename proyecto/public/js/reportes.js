if (!localStorage.getItem('token')) {
    window.location.href = '/login.html'; // Redirige al login si no hay token
}

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
        // Depuración: muestra los valores en consola
        console.log('Departamento usuario:', departamentoUsuario);
        acuerdos.forEach(a => console.log('Unidad responsable:', a.unidad_responsable));

        // Filtra por nombre completo (solo una vez)
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
                    <button class="btn-ver">Ver</button>
                </td>
            </tr>
        `;
    });
}

document.addEventListener('DOMContentLoaded', cargarReportes);