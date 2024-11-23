/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/ui/message'], function (message) {

    // Lista de palabras ofensivas (puedes agregar más)
    const offensiveWords = ['ofensiva1', 'ofensiva2', 'ofensiva3']; // Reemplaza con palabras reales

    /**
     * Validación del campo "Descripción del Servicio".
     */
    function validateField(context) {
        if (context.fieldId === 'custrecord_descripcion_servicio') { // Reemplaza con el ID del campo
            var record = context.currentRecord;
            var description = record.getValue({
                fieldId: 'custrecord_descripcion_servicio'
            });

            // Validar longitud mínima
            if (description.length < 30) {
                alert('La descripción debe tener al menos 30 caracteres.');
                return false;
            }

            // Validar palabras ofensivas
            for (var word of offensiveWords) {
                if (description.toLowerCase().includes(word.toLowerCase())) {
                    alert('La descripción contiene palabras no permitidas. Por favor, corrige el texto.');
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Validación antes de guardar el registro.
     */
    function saveRecord(context) {
        var record = context.currentRecord;
        var description = record.getValue({
            fieldId: 'custrecord_descripcion_servicio'
        });

        // Validar longitud mínima
        if (description.length < 30) {
            alert('La descripción debe tener al menos 30 caracteres.');
            return false;
        }

        // Validar palabras ofensivas
        for (var word of offensiveWords) {
            if (description.toLowerCase().includes(word.toLowerCase())) {
                alert('La descripción contiene palabras no permitidas. Por favor, corrige el texto.');
                return false;
            }
        }

        return true;
    }

    return {
        validateField: validateField,
        saveRecord: saveRecord
    };
});
