document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const btnRegistro = document.getElementById('registrarse');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const usuario = e.target.usuario.value;
            const contrasena = e.target.contrasena.value;

            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, contrasena })
            });

            const data = await res.json();
            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('nombre', data.nombre);
                localStorage.setItem('usuario', data.usuario);
                localStorage.setItem('departamento', data.departamento); // <-- ESTA LÍNEA ES CLAVE
                localStorage.setItem('cargoUsuario', data.cargo);
                window.location.href = '/index.html';
            } else {
                alert(data.error || 'Usuario o contraseña incorrectos');
            }
        });
    }

    if (btnRegistro) {
        btnRegistro.addEventListener('click', function() {
            window.location.href = '/registro.html';
        });
    }
});
