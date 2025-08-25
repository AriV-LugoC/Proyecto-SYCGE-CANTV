document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        });
    }
});

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}