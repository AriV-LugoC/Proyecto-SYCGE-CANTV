router.get('/api/acuerdos/:id', async (req, res) => {
    try {
        const acuerdo = await Acuerdo.findById(req.params.id);
        if (!acuerdo) return res.status(404).json({ error: 'Acuerdo no encontrado' });
        res.json(acuerdo);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el acuerdo' });
    }
});

router.put('/api/acuerdos/:id', async (req, res) => {
    try {
        const update = {};
        // Solo actualiza los campos que llegan en el body
        [
            'identificativo', 'fecha_comite', 'tipo_comite', 'vicepresidencia',
            'autoridad', 'unidad_seguimiento', 'unidad_responsable',
            'estado', 'punto_agenda', 'acuerdos'
        ].forEach(campo => {
            if (req.body[campo] !== undefined && req.body[campo] !== '') {
                update[campo] = req.body[campo];
            }
        });

        const acuerdo = await Acuerdo.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!acuerdo) return res.status(404).json({ error: 'Acuerdo no encontrado' });
        res.json(acuerdo);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el acuerdo' });
    }
});