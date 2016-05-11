module.exports = function() {
    "use strict";
    return {
        passes: [{
            name: 'passed name',
            full_name: 'full_name',
            duration: 120,
            current_retry: '',
            error: '',
            destination: 'some_service'
        }],
        failures: [{
            name: 'failed name',
            full_name: 'full_name',
            duration: 120,
            current_retry: '',
            error: '',
            destination: 'some_service'
        }],
        pending: [{
            name: 'pending name',
            full_name: 'full_name',
            duration: 120,
            current_retry: '',
            error: '',
            destination: 'some_service'
        }]
    };

};