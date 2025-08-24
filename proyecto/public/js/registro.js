document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registro-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const usuario = document.getElementById('usuario').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();
        const departamento = document.getElementById('departamento').value;
        const cargo = document.getElementById('cargo').value;

        // Validación de contraseña
        const tieneLongitud = contrasena.length > 10;
        const tieneNumero = /[0-9]/.test(contrasena);
        const tieneEspecial = /[\/\*\-\&\@\+]/.test(contrasena);

        if (!tieneLongitud || !tieneNumero || !tieneEspecial) {
             mostrarNotificacion('La contraseña debe tener más de 10 caracteres, incluir al menos un número y uno de estos caracteres especiales: / * - & @ +', 'error');
            return;
        }

        if (!departamento || !cargo) {
            mostrarNotificacion('Debe seleccionar un departamento y un cargo.', 'error');
            return;
        }

        try {
            const res = await fetch('/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, usuario, contrasena, departamento, cargo })
            });
            const data = await res.json();
            if (res.ok) {
                mostrarNotificacion('Usuario registrado correctamente', 'success'); // <-- Notificación aquí
               setTimeout(() => {
        window.location.href = '/index.html';
    }, 1000);
            } else {
                mostrarNotificacion(data.error || 'Error al registrar usuario', 'error');
            }
        } catch (err) {
             mostrarNotificacion('Error de conexión con el servidor', 'error');
        }
    });

    document.getElementById('contrasena').addEventListener('input', function() {
        const value = this.value;
        const bar = document.getElementById('password-bar');
        const text = document.getElementById('password-text');
        let strength = 0;

        if (value.length > 10) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[a-z]/.test(value)) strength++;
        if (/[0-9]/.test(value)) strength++;
        if (/[\/\*\-\&\@\+]/.test(value)) strength++;

        // Actualiza barra y texto
        if (strength <= 2) {
            bar.style.width = '33%';
            bar.style.background = '#d32f2f';
            text.textContent = 'Débil';
            text.style.color = '#d32f2f';
        } else if (strength === 3 || strength === 4) {
            bar.style.width = '66%';
            bar.style.background = '#fbc02d';
            text.textContent = 'Media';
            text.style.color = '#fbc02d';
        } else if (strength === 5) {
            bar.style.width = '100%';
            bar.style.background = '#388e3c';
            text.textContent = 'Fuerte';
            text.style.color = '#388e3c';
        } else {
            bar.style.width = '0';
            bar.style.background = '#eee';
            text.textContent = '';
        }
    });

    document.getElementById('ver-password').addEventListener('change', function() {
        const input = document.getElementById('contrasena');
        input.type = this.checked ? 'text' : 'password';
    });
});