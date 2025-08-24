window.mostrarFichaAcuerdo = function(acuerdo) {
    let modal = document.getElementById('modal-ficha-acuerdo');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-ficha-acuerdo';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:600px;">
                <span class="close" onclick="document.getElementById('modal-ficha-acuerdo').style.display='none'">&times;</span>
                <h3 style="margin-bottom:18px;">Ficha del Acuerdo</h3>
                <div id="ficha-acuerdo-detalle"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    const ficha = modal.querySelector('#ficha-acuerdo-detalle');
    ficha.innerHTML = `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #3bb3bd;
            color: #fff;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            padding: 18px 24px 18px 24px;
            margin-bottom: 18px;
        ">
            <div style="font-size:1.5em; font-weight:bold;">
                ${acuerdo.estado ? acuerdo.estado : 'SIN ESTADO'}
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.95em;">N° Control</div>
                <div style="font-size:1.1em; font-weight:bold;">${acuerdo.id_visible || ''}</div>
            </div>
        </div>
        <div class="ficha-row">
            <div class="ficha-col">
                <div class="ficha-label">Identificativo</div>
                <div class="ficha-value">${acuerdo.identificativo || ''}</div>
            </div>
            <div class="ficha-col">
                <div class="ficha-label">Fecha Comité</div>
                <div class="ficha-value">${acuerdo.fecha_comite || ''}</div>
            </div>
        </div>
        <div class="ficha-row">
            <div class="ficha-col">
                <div class="ficha-label">Tipo Comité</div>
                <div class="ficha-value">${acuerdo.tipo_comite || ''}</div>
            </div>
            <div class="ficha-col">
                <div class="ficha-label">Autoridad</div>
                <div class="ficha-value">${acuerdo.autoridad || ''}</div>
            </div>
        </div>
        <div class="ficha-row">
            <div class="ficha-col">
                <div class="ficha-label">Vicepresidencia</div>
                <div class="ficha-value">${acuerdo.vicepresidencia || ''}</div>
            </div>
            <div class="ficha-col">
                <div class="ficha-label">Unidad Responsable</div>
                <div class="ficha-value">${acuerdo.unidad_responsable || ''}</div>
            </div>
        </div>
        <div class="ficha-row">
            <div class="ficha-col">
                <div class="ficha-label">Unidad Seguimiento</div>
                <div class="ficha-value">${acuerdo.unidad_seguimiento || ''}</div>
            </div>
            <div class="ficha-col"></div>
        </div>
        <div style="margin-bottom:10px;">
            <div class="ficha-label">Punto de Agenda</div>
            <div class="ficha-value">${acuerdo.punto_agenda || ''}</div>
        </div>
        <div class="ficha-titulo">Acuerdos / Compromisos Establecidos</div>
        <div class="ficha-acuerdos">
            ${acuerdo.acuerdos || ''}
        </div>
    `;
    modal.style.display = 'flex';
};