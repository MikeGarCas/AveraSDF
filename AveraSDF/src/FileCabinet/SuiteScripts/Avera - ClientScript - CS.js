/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([], function () {

    function pageInit(context) {

    }

    function saveRecord(context) {
        try {
            // custbody_total_
            var currentRecord = context.currentRecord;
                var total = currentRecord.getValue({ fieldId: 'custbody_total_' });
                if (total <= 0) {
                    alert('El total debe ser mayor a cero')
                    return false;
                } else {
                    return true;
                }
        } catch (error) {
            console.log('Error en saveRecrod', error)
            log.debug('Error en saveRecrod', error)
        }
    }

    // function validateField(context) {

    // }

    // function fieldChanged(context) {

    // }

    // function postSourcing(context) {

    // }

    // function lineInit(context) {

    // }

    // function validateDelete(context) {

    // }

    // function validateInsert(context) {

    // }

    // function validateLine(context) {

    // }

    // function sublistChanged(context) {

    // }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
        // validateField: validateField,
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // lineInit: lineInit,
        // validateDelete: validateDelete,
        // validateInsert: validateInsert,
        // validateLine: validateLine,
        // sublistChanged: sublistChanged
    }
});
