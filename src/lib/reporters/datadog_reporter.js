"use strict";

var Base = require('./base');


exports = module.exports = DatadogReporter;

// Basically copied the JSON reporter
// Added interface to receive JSON (besides stdout)

// jsonInterface must have write method
function DatadogReporter(runner, jsonInterface) {
    Base.call(this, runner);


    var results = {
        stats:"",
        tests:[],
        passes: [],
        failures:[],
        pending:[]
    }

    runner.on("test end", function(test) {
        results.tests.push(test);
    })


    runner.on("pass", function (test) {
        results.passes.push(test);
    })

    runner.on("fail", function (test) {
        results.failures.push(test);
    })

    runner.on("pending", function (test) {
        results.pending.push(test);
    })

    runner.on('end', function() {
        var data = {
            stats: this.stats,
            passes: results.passes.map(strip_test),
            failures: results.failures.map(strip_test),
            pending: results.pending.map(strip_test)
        }

        runner.testResults = data;

        var json = JSON.stringify(data, null,  2);

        process.stdout.write(json);

        jsonInterface.write(json);
    });

    function strip_test(test) {
        return {
            title: test.title,
            fullTitle: test.fullTitle(),
            duration: test.duration,
            err: JSON.stringify(test.err || {})
        }
    }

}