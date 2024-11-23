/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/ui/serverWidget', 'N/search'], function (record, serverWidget, search) {
    
    function onRequest(context) {
        if (context.request.method === 'GET') {
            createForm(context);
        } else if (context.request.method === 'POST') {
            processForm(context);
        }
    }

    /**
     * Crear el formulario para la "Solicitud de Servicio".
     */
    function createForm(context) {
        var form = serverWidget.createForm({
            title: 'Solicitud de Servicio'
        });

        // Campo: Cliente
        var clienteField = form.addField({
            id: 'custpage_cliente',
            type: serverWidget.FieldType.SELECT,
            label: 'Cliente'
        });

        clienteField.addSelectOption({ value: '', text: 'Seleccionar...' });

        // Cargar clientes con tipo
        var customerSearch = search.create({
            type: search.Type.CUSTOMER,
            columns: ['entityid', 'custentity_tipo_cliente']
        });

        customerSearch.run().each(function (result) {
            var entityId = result.getValue({ name: 'entityid' });
            var customerType = result.getValue({ name: 'custentity_tipo_cliente' }) || 'Sin Tipo';
            clienteField.addSelectOption({
                value: result.id,
                text: entityId + ' (' + customerType + ')'
            });
            return true;
        });

        // Campo: Descripción del Servicio
        form.addField({
            id: 'custpage_descripcion',
            type: serverWidget.FieldType.TEXTAREA,
            label: 'Descripción del Servicio'
        });

        // Botón Guardar
        form.addSubmitButton({
            label: 'Guardar Solicitud de Servicio'
        });

        context.response.writePage(form);
    }

    /**
     * Procesar los datos del formulario enviado.
     */
    function processForm(context) {
        var request = context.request;

        try {
            var clienteId = request.parameters.custpage_cliente;
            var descripcion = request.parameters.custpage_descripcion;

            if (!clienteId) {
                throw 'Debe seleccionar un cliente.';
            }

            if (!descripcion) {
                throw 'Debe proporcionar una descripción del servicio.';
            }

            // Crear el registro de "Solicitud de Servicio"
            var solicitud = record.create({
                type: 'customrecord_solicitud_servicio', // Reemplazar con el ID real del registro
                isDynamic: true
            });

            solicitud.setValue({ fieldId: 'custrecord_cliente', value: clienteId });
            solicitud.setValue({ fieldId: 'custrecord_descripcion_servicio', value: descripcion });

            var solicitudId = solicitud.save();
            
            context.response.write(`Solicitud de Servicio creada con éxito. ID: ${solicitudId}`);
        } catch (e) {
            context.response.write('Error: ' + e);
        }
    }

    return {
        onRequest: onRequest
    };
});
