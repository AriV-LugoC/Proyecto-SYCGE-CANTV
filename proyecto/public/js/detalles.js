if (!localStorage.getItem('token')) {
    window.location.href = '/login.html'; // Redirige al login si no hay token
}