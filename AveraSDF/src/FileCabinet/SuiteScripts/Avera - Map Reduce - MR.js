/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/log'], function (record, search, log) {
    
    // Define la categoría "Profesional"
    const PROFESSIONAL_CATEGORY = 'Profesional';

    function getInputData() {
        try {
            
            return search.create({
                type: 'customer',
                filters: [],
                columns: ['internalid']
            });
        } catch (error) {
            log.debug({ title: 'Error en getInputData', details: errpr });
        }
    }

   
    function map(context) {
        var customerId = JSON.parse(context.value).id;
        log.debug('Procesando Cliente ID:', customerId);

        var totalSpent = 0;
        var hasProfessionalInstrument = false;
        var hasInstruments = false;

        var orderSearch = search.create({
            type: 'customtransaction_orden_servicio', 
            filters: [
                ['mainline', 'is', 'T'],
                'AND',
                ['entity', 'anyof', customerId]
            ],
            columns: ['custcol_item_category', 'amount', 'quantity', 'custentity_tipo_cliente']
        });

        orderSearch.run().each(function (result) {
            var category = result.getValue('custcol_item_category');
            var tipoCliente = result.getValue('custentity_tipo_cliente');
            var amount = parseFloat(result.getValue('amount')) || 0;

            totalSpent += amount;

            if (category === PROFESSIONAL_CATEGORY) {
                hasProfessionalInstrument = true;
            }
            if (category) {
                hasInstruments = true;
            }

            return true;
        });

        // Determinar el tipo de cliente
        var customerType = 'Principiante'; // Por defecto
        if (hasProfessionalInstrument && totalSpent > 5000) {
            customerType = 'Profesional';
        } else if (hasInstruments && totalSpent > 1000 && totalSpent <= 5000) {
            customerType = 'Avanzado';
        } else if (hasInstruments && totalSpent < 1000) {
            customerType = 'Intermedio';
        }

        log.debug('Cliente ID:', customerId, 'Tipo Determinado:', customerType);

        // Pasar datos al paso Reduce
        context.write({
            key: customerId,
            value: customerType
        });
    }

    /**
     * Reduce: Actualiza el campo "Tipo de Cliente" en el registro de cliente.
     */
    function reduce(context) {
        var customerId = context.key;
        var customerType = context.values[0];

        try {
            record.submitFields({
                type: 'customer',
                id: customerId,
                values: {
                    custentity_tipo_cliente: customerType 
                }
            });
            log.debug('Cliente Actualizado:', 'ID: ' + customerId + ', Tipo: ' + customerType);
        } catch (e) {
            log.error('Error al actualizar cliente', e);
        }
    }

    
    function summarize(summary) {
        summary.mapSummary.errors.iterator().each(function (key, error) {
            log.error('Error en Map para Cliente ID: ' + key, error);
            return true;
        });

        summary.reduceSummary.errors.iterator().each(function (key, error) {
            log.error('Error en Reduce para Cliente ID: ' + key, error);
            return true;
        });

        log.debug('Script finalizado', 'Map/Reduce completado.');
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});
