if (!localStorage.getItem('token')) {
    window.location.href = '/login.html'; 
    // Redirige al login si no hay token
}document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuario');

    // Cargar datos actuales del usuario
    fetch(`/api/usuario?usuario=${encodeURIComponent(usuario)}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('preview-foto').src = data.foto || 'img/default-user.png';
        });

    // Vista previa de la foto
    document.getElementById('foto').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                document.getElementById('preview-foto').src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Guardar solo la foto
    document.getElementById('btn-guardar-foto').addEventListener('click', async function() {
        const fotoInput = document.getElementById('foto');
        const mensajeDiv = document.getElementById('mensaje-foto');
        mensajeDiv.textContent = '';
        if (!fotoInput.files.length) {
            mensajeDiv.textContent = 'Seleccione una foto primero';
            mensajeDiv.style.color = '#c62828';
            return;
        }
        const formData = new FormData();
        formData.append('usuario', usuario);
        formData.append('foto', fotoInput.files[0]);

        const res = await fetch('/api/configuracion', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            mensajeDiv.textContent = 'Su foto se ha cambiado exitosamente';
            mensajeDiv.style.color = '#2e7d32';
            setTimeout(() => window.location.reload(), 1500);
        } else {
            mensajeDiv.textContent = data.error || 'Error al guardar la foto';
            mensajeDiv.style.color = '#c62828';
        }
    });

    // Guardar nombre y contraseña
    document.getElementById('form-configuracion').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        formData.append('usuario', usuario);

        // Elimina la foto si no se va a cambiar
        formData.delete('foto');

        const res = await fetch('/api/configuracion', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            mostrarNotificacion('Cambios guardados correctamente', 'success');
            window.location.reload();
        } else {
            mostrarNotificacion(data.error || 'Error al guardar cambios', 'error');
        }
    });
});