if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuario');
    const nombre = localStorage.getItem('nombre');
    const departamento = localStorage.getItem('departamento');
    const cargo = localStorage.getItem('cargoUsuario');

    // Mostrar datos en la vista
    document.getElementById('nombre').textContent = nombre || '';
    document.getElementById('departamento').textContent = departamento || '';
    document.getElementById('cargo').textContent = cargo || '';
    document.getElementById('correo').textContent = usuario || '';

    // Guardar cambios (solo contraseña)
    document.getElementById('form-configuracion').addEventListener('submit', async function(e) {
        e.preventDefault();

        const contrasenaActual = document.getElementById('contrasena-actual').value.trim();
        const nuevaContrasena = document.getElementById('nueva-contrasena').value.trim();
        const confirmarContrasena = document.getElementById('confirmar-contrasena').value.trim();

        // Validaciones
        if (contrasenaActual || nuevaContrasena || confirmarContrasena) {
            if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
                mostrarNotificacion('Completa todos los campos para cambiar la contraseña.', 'error');
                return;
            }
            if (nuevaContrasena !== confirmarContrasena) {
                mostrarNotificacion('La nueva contraseña y la confirmación no coinciden.', 'error');
                return;
            }
            if (nuevaContrasena.length <= 10 || !/[0-9]/.test(nuevaContrasena) || !/[\/\*\-\&\@\+]/.test(nuevaContrasena)) {
                mostrarNotificacion('La nueva contraseña debe tener más de 10 caracteres, incluir al menos un número y uno de estos caracteres especiales: / * - & @ +', 'error');
                return;
            }
        } else {
            mostrarNotificacion('No hay cambios para guardar.', 'error');
            return;
        }

        // Enviar datos al backend
        const formData = new FormData();
        formData.append('usuario', usuario);
        if (contrasenaActual && nuevaContrasena) {
            formData.append('contrasenaActual', contrasenaActual);
            formData.append('nuevaContrasena', nuevaContrasena);
        }

        const res = await fetch('/api/configuracion', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            mostrarNotificacion('Cambios guardados correctamente', 'success');
            setTimeout(() => window.location.reload(), 1200);
        } else {
            mostrarNotificacion(data.error || 'Error al guardar cambios', 'error');
        }
    });
});

// Mostrar/ocultar contraseñas con solo el ícono
document.querySelectorAll('.toggle-password').forEach(span => {
    span.addEventListener('click', function() {
        const input = document.getElementById(this.dataset.target);
        const isVisible = input.type === 'text';
        input.type = isVisible ? 'password' : 'text';
        this.classList.toggle('active', !isVisible);
        // Cambia el ícono de ojo abierto/cerrado si lo deseas:
        this.querySelector('i').className = isVisible ? 'fa fa-eye' : 'fa fa-eye-slash';
    });
});