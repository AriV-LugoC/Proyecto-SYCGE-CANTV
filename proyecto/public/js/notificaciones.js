function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    let noti = document.getElementById('notificacion');
    if (!noti) {
        noti = document.createElement('div');
        noti.id = 'notificacion';
        noti.style.position = 'fixed';
        noti.style.top = '32px';
        noti.style.right = '32px';
        noti.style.zIndex = '9999';
        noti.style.minWidth = '220px';
        document.body.appendChild(noti);
    }
    noti.textContent = mensaje;
    noti.style.display = 'block';
    noti.style.background = tipo === 'error' ? '#e57373' : (tipo === 'success' ? '#43e97b' : '#3bb3bd');
    noti.style.color = '#fff';
    noti.style.padding = '16px 28px';
    noti.style.borderRadius = '10px';
    noti.style.boxShadow = '0 2px 12px rgba(0,0,0,0.13)';
    noti.style.fontSize = '1.1em';
    noti.style.fontWeight = 'bold';
    noti.style.transition = 'opacity 0.3s';
    noti.style.opacity = '1';
    setTimeout(() => {
        noti.style.opacity = '0';
        setTimeout(() => { noti.style.display = 'none'; }, 300);
    }, duracion);
}