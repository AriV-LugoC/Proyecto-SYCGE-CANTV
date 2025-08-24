// Inactividad máxima en milisegundos (10 minutos)
const TIEMPO_MAX_INACTIVIDAD = 10 * 60 * 1000; // 10 minutos

let timeoutInactividad;

function reiniciarTemporizadorInactividad() {
    clearTimeout(timeoutInactividad);
    timeoutInactividad = setTimeout(() => {
        localStorage.clear();
        mostrarNotificacion('Sesión cerrada por inactividad', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1200);
    }, TIEMPO_MAX_INACTIVIDAD);
}

// Eventos que reinician el temporizador
['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, reiniciarTemporizadorInactividad, true);
});

// Inicia el temporizador al cargar la página
reiniciarTemporizadorInactividad();