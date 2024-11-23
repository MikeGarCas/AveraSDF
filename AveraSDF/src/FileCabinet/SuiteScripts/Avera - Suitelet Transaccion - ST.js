/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/ui/serverWidget', 'N/redirect', 'N/log'], function (record, serverWidget, redirect, log) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            createForm(context);
        } else if (context.request.method === 'POST') {
            processForm(context);
        }
    }

    function createForm(context) {
        var form = serverWidget.createForm({
            title: 'Crear Orden de Servicio'
        });

        // Campo: Cliente
        form.addField({
            id: 'custpage_cliente',
            type: serverWidget.FieldType.SELECT,
            label: 'Cliente',
            source: 'customer'
        });

        // Campo: Fecha de la Orden
        form.addField({
            id: 'custpage_fecha_orden',
            type: serverWidget.FieldType.DATE,
            label: 'Fecha de la Orden'
        });

        // Campo: Estado de la Orden
        var estadoOrden = form.addField({
            id: 'custpage_estado_orden',
            type: serverWidget.FieldType.SELECT,
            label: 'Estado de la Orden'
        });
        estadoOrden.addSelectOption({ value: 'pendiente', text: 'Pendiente' });
        estadoOrden.addSelectOption({ value: 'pagada', text: 'Pagada' });
        estadoOrden.addSelectOption({ value: 'cancelada', text: 'Cancelada' });

        // Campo: Total (solo lectura)
        form.addField({
            id: 'custpage_total',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total',
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        // Sublista: Artículos
        var itemSublist = form.addSublist({
            id: 'custpage_items',
            type: serverWidget.SublistType.INLINEEDITOR,
            label: 'Artículos'
        });

        itemSublist.addField({
            id: 'custpage_item',
            type: serverWidget.FieldType.SELECT,
            label: 'Artículo',
            source: 'item'
        });

        itemSublist.addField({
            id: 'custpage_quantity',
            type: serverWidget.FieldType.INTEGER,
            label: 'Cantidad'
        });

        itemSublist.addField({
            id: 'custpage_price',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Precio'
        });

        // Botón Guardar
        form.addSubmitButton({
            label: 'Guardar Orden de Servicio'
        });

        context.response.writePage(form);
    }

    function processForm(context) {
        var request = context.request;

        // Obtener los valores principales
        var customerId = request.parameters.custpage_cliente;
        var orderDate = request.parameters.custpage_fecha_orden;
        var estadoOrden = request.parameters.custpage_estado_orden;

        try {
            // Calcular el total
            var itemCount = request.getLineCount({ sublistId: 'custpage_items' });
            var total = 0;

            for (var i = 0; i < itemCount; i++) {
                var quantity = parseFloat(request.getSublistValue({
                    sublistId: 'custpage_items',
                    fieldId: 'custpage_quantity',
                    line: i
                })) || 0;

                var price = parseFloat(request.getSublistValue({
                    sublistId: 'custpage_items',
                    fieldId: 'custpage_price',
                    line: i
                })) || 0;

                total += quantity * price;
            }

            // Crear la transacción personalizada
            var customTransaction = record.create({
                type: 'customtransaction_orden_servicio',
                isDynamic: true
            });

            // Establecer los campos principales
            customTransaction.setValue({ fieldId: 'entity', value: customerId });
            customTransaction.setValue({ fieldId: 'trandate', value: orderDate });
            customTransaction.setValue({ fieldId: 'custbody_estado_orden', value: estadoOrden });
            customTransaction.setValue({ fieldId: 'custbody_total', value: total });

            // Guardar las líneas de la sublista
            for (var i = 0; i < itemCount; i++) {
                customTransaction.selectNewLine({ sublistId: 'item' });

                customTransaction.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: request.getSublistValue({
                        sublistId: 'custpage_items',
                        fieldId: 'custpage_item',
                        line: i
                    })
                });

                customTransaction.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: request.getSublistValue({
                        sublistId: 'custpage_items',
                        fieldId: 'custpage_quantity',
                        line: i
                    })
                });

                customTransaction.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: request.getSublistValue({
                        sublistId: 'custpage_items',
                        fieldId: 'custpage_price',
                        line: i
                    })
                });

                customTransaction.commitLine({ sublistId: 'item' });
            }

            // Guardar la transacción personalizada
            var transactionId = customTransaction.save();
            log.debug('Transacción creada', 'ID: ' + transactionId);

            // Redirigir al registro creado
            redirect.toRecord({
                type: 'customtransaction_orden_servicio',
                id: transactionId
            });

        } catch (e) {
            log.error('Error al procesar la Orden de Servicio', e);
        }
    }

    return {
        onRequest: onRequest
    };
});
