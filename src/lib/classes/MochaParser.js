"use strict";

module.exports = function (configuration, DatadogWrapper) {

    return class MochaParser {

        constructor() {
            this.dd_config = configuration['mocha'];
            this.metric_path = this.dd_config.metric_path;
            this.datadog = new DatadogWrapper(configuration.datadog_agent.host, configuration.datadog_agent.port, this.dd_config);
            console.log("mocha_parser constructor complete");
        }

        export_results(mocha_output) {
            var results = this.parse(mocha_output);
            ["passes", "failures", "pending"].forEach(function (status) {
                this.cache_tests(results[status].map(function (result) {
                    this.parse_test(result, status);
                }))
            });

            this.send_tests();
        };

        write(json) {
            this.export_results(json);
        };

        parse(mocha_output) {
            // Do any transformation required.  It's already in the correct format
            return mocha_output;
        };

        parse_test(mocha_test, status) {
            var test = {};
            if (status) test["status"] = status;

            test["name"] = mocha_test.title;
            test["full_name"] = mocha_test.fullTitle;
            test["duration"] = mocha_test.duration;
            test["current_retry"] = mocha_test.currentRetry;
            test["error"] = mocha_test.err;
            test["destination"] = this.metric_path;
            return test;
        };

        cache_tests(mocha_tests, status) {
            var tests = [];
            mocha_tests.forEach(function (mocha_test) {
                tests.push(JSON.stringify(this.parse_test(mocha_test, status)));
            });

            this.datadog.add_lines(tests);
        };

        send_tests() {
            this.datadog.send_metrics().flush_metrics().flush_json_buffer();
        };


    }

};