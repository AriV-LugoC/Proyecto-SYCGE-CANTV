document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    const iconSidebar = document.getElementById('icon-sidebar');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        if (sidebar.classList.contains('collapsed')) {
            iconSidebar.classList.remove('fa-arrow-left');
            iconSidebar.classList.add('fa-bars');
        } else {
            iconSidebar.classList.remove('fa-bars');
            iconSidebar.classList.add('fa-arrow-left');
        }
    });

    // Al cargar la página, muestra el ícono correcto
    if (sidebar.classList.contains('collapsed')) {
        iconSidebar.classList.remove('fa-arrow-left');
        iconSidebar.classList.add('fa-bars');
    } else {
        iconSidebar.classList.remove('fa-bars');
        iconSidebar.classList.add('fa-arrow-left');
    }
});

function cerrarSesion() {
    localStorage.clear();
    mostrarNotificacion('Sesión cerrada', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}