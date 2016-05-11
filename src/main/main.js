"use strict";
module.exports = function(MochaParser) {
    function start() {
        var test_results = {
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
        var mp = new MochaParser();
        mp.export_results(test_results);
    }

     start();

};