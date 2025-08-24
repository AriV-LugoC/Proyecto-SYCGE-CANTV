if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
}

// Expulsar usuario tras 20 minutos
const tiempoMaximoSesion = 20 * 60 * 1000;
setTimeout(() => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}, tiempoMaximoSesion);

document.addEventListener('DOMContentLoaded', async () => {
    // Mostrar nombre del usuario
    const nombreUsuario = localStorage.getItem('nombre');
    document.getElementById('nombre-usuario').textContent = nombreUsuario || '';

    // Obtener y mostrar cantidad de acuerdos, reportes y culminados
    const token = localStorage.getItem('token');
    const departamentoUsuario = localStorage.getItem('departamento');
    if (token && departamentoUsuario) {
        try {
            const res = await fetch('/api/acuerdos', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const acuerdos = await res.json();

            // Acuerdos: todos los no culminados (sin filtrar por departamento)
            const acuerdosNoCulminados = acuerdos.filter(a => a.estado !== '100%');
            document.getElementById('num-acuerdos').textContent = acuerdosNoCulminados.length;

            // Reportes: solo los del departamento y no culminados
            const reportesDepto = acuerdos.filter(a =>
                a.unidad_responsable &&
                a.unidad_responsable.trim().toLowerCase() === departamentoUsuario.trim().toLowerCase() &&
                a.estado !== '100%'
            );
            document.getElementById('num-reportes').textContent = reportesDepto.length;

            // Culminados: solo los del departamento y culminados
            const culminados = acuerdos.filter(a =>
                a.unidad_responsable &&
                a.unidad_responsable.trim().toLowerCase() === departamentoUsuario.trim().toLowerCase() &&
                a.estado === '100%'
            );
            document.getElementById('num-culminados').textContent = culminados.length;
        } catch {
            document.getElementById('num-acuerdos').textContent = '0';
            document.getElementById('num-culminados').textContent = '0';
            document.getElementById('num-reportes').textContent = '0';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuario');
    fetch(`/api/usuario?usuario=${encodeURIComponent(usuario)}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('nombre-usuario').textContent = data.nombre || '';
        });
});