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

    // Mostrar foto de perfil (si tienes lógica para esto)
    // document.getElementById('bienvenida-foto').src = ...;

    // Obtener token y departamento
    const token = localStorage.getItem('token');
    const departamentoUsuario = localStorage.getItem('departamento');

    // Mostrar cantidad total de acuerdos
    let totalAcuerdos = 0;
    let totalReportes = 0;
    let totalComentarios = 0; // Si tienes comentarios, agrega la lógica aquí

    try {
        // Consulta todos los acuerdos
        const resAcuerdos = await fetch('/api/acuerdos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const acuerdos = await resAcuerdos.json();
        totalAcuerdos = acuerdos.length;

        // Filtra los acuerdos por departamento para los reportes
        totalReportes = acuerdos.filter(a => a.unidad_responsable === departamentoUsuario).length;

        // Si tienes comentarios, consulta y cuenta aquí
        // Ejemplo:
        // const resComentarios = await fetch('/api/comentarios', { headers: { 'Authorization': 'Bearer ' + token } });
        // const comentarios = await resComentarios.json();
        // totalComentarios = comentarios.length;

    } catch (err) {
        console.error('Error al cargar datos:', err);
    }

    // Actualiza los números en las tarjetas
    document.querySelector('.card-acuerdos .card-num').textContent = totalAcuerdos;
    document.querySelector('.card-reportes .card-num').textContent = totalReportes;
    document.querySelector('.card-comentarios .card-num').textContent = totalComentarios;
});