"use strict";


module.exports = (configuration) => function() {
    var dd_config = configuration.datadog_agent;
    var metric_path = configuration.metric_path;

    var datadog = new DatadogWrapper(dd_config.host,  dd_config.port);

    
    var export_results = function(mocha_output) {
        var results = parse(mocha_output);
        ["passes","failures","pending"].forEach(function(status) {
            cache_tests(results[status].map(function(result) {
                parse_test(result, status);
            }))
        });

        send_tests();
    }
    var parse = function(mocha_output) {
        var stats = mocha_output.stats;
        var passes = mocha_output.passes;
        var failures = mocha_output.failures;
        var pending = mocha_output.pending;

        return {"stats":stats, "passed":passes, "failures":failures, "pending":pending}
    };

    var parse_test = function(mocha_test, status) {
        var test = {};
        if(status) test["status"] = status;

        test["name"] = mocha_test.title;
        test["full_name"] = mocha_test.fullTitle;
        test["duration"] = mocha_test.duration;
        test["current_retry"] = mocha_test.currentRetry;
        test["error"] = mocha_test.err;
        test["destination"] = metric_path;
        return test;
    };

    var cache_tests = function(mocha_tests, status) {
        var tests = [];
        mocha_tests.forEach(function(mocha_test) {
            tests.push(JSON.stringify(parse_test(mocha_test,  status)));
        });

        datadog.add_lines(tests);
    };

    var send_tests = function(){
        datadog.send_metrics().flush_metrics().flush_json_buffer();
    }



}