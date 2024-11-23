/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'], function (record, log) {

    function afterSubmit(context) {
        // Asegurarse de que el evento se ejecuta solo en creación
        if (context.type !== context.UserEventType.CREATE) {
            return;
        }

        let orderRecord = context.newRecord;
        let orderId = orderRecord.id;

        log.debug('Orden de Servicio creada', 'ID de la Orden: ' + orderId);

        try {
            let customerId = orderRecord.getValue('entity'); 
            let orderDate = orderRecord.getValue('trandate'); 
            let lineCount = orderRecord.getLineCount({ sublistId: 'item' });

            let firstInstrument = null;

            for (let i = 0; i < lineCount; i++) {

                let category = orderRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_item_category', 
                    line: i
                });

                if (category === 'Instrumento') { 
                    firstInstrument = orderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item', 
                        line: i
                    });
                    break;
                }
            }

            if (!firstInstrument) {
                log.debug('No se encontró instrumento', 'No se creó la Solicitud de Servicio');
                return;
            }

            let serviceRequest = record.create({
                type: 'customrecord_solicitud_servicio',
                isDynamic: true
            });


            serviceRequest.setValue({
                fieldId: 'custrecord_cliente',
                value: customerId
            });

            serviceRequest.setValue({
                fieldId: 'custrecord_fecha_solicitud',
                value: orderDate
            });

            serviceRequest.setValue({
                fieldId: 'custrecord_instrumento',
                value: firstInstrument
            });

            serviceRequest.setValue({
                fieldId: 'custrecord_estado',
                value: 'Recibida'
            });

            serviceRequest.setValue({
                fieldId: 'custrecord_orden_servicio',
                value: orderId
            });

            let serviceRequestId = serviceRequest.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });
            log.debug('Solicitud de Servicio creada', 'ID: ' + serviceRequestId);

        } catch (e) {
            log.error('Error al crear Solicitud de Servicio', e);
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
