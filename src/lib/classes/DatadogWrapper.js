"use strict";

var DatadogAgent = require('node-dogstatsd').StatsD;
var Log = require('log4js');


module.exports = (Metric ) => function () {
    var logger = Log.getLogger('DatadogWrapper');

    return class DatadogWrapper {

        constructor(hostname, port, configuration) {
            this.extra_tags = new Map();
            this.path = [];
            this.metrics = [];
            this.configuration = configuration;
            this.options = {'host': hostname, 'port': port};
            this.agent = new DatadogAgent(options.host, options.port);
            this.metric_path = this.configuration.metric_path;
        }

        // Returns path as string
        get metric_path () {
            return this.path.join('.');
        }

        // Stores path as list
        set metric_path (path) {
            if (typeof(path) == 'string'){
                path = path.split('.');
            }

            this.metric_path = path;
        }

        get_json_buffer() {
            if (typeof(this.jsonInput) == 'undefined') this.jsonInput = [];

            return this.jsonInput;
        }

        add_line(jsonLine) {
            var jsonObj = null;
            try {
                jsonObj = JSON.parse(jsonLine);
            } catch (error) {
                logger.log("Error parsing json line " + error);
            }

            if (jsonObj != null) this.get_json_buffer().push(jsonObj);

            return this;
        }

        add_lines(jsonLines) {
            jsonLines.forEach(function(json) {
                this.add_line(json);
            });

            return this;
        }

        // Reads 'field_tags' from configuration, returning all that also exist on the given object
        get_matching_fields(obj) {
            var matched_tags = [];
            var configured_tags = this.configuration.field_tags;
            for (var tag in configured_tags) {
                if (obj.hasOwnProperty(tag)) {
                    matched_tags.push(tag);
                }
            }

            return matched_tags;
        }

        build_metrics() {
            var metrics = [];
            var logs = this.get_json_buffer();

            logs.forEach(function (log) {
                    var fields = this.get_matching_fields(log);
                    var m = new Metric(this.metric_path, this.tags());
                    fields.forEach(function (f) {
                        m.add_tag(f, log[f]);
                    });
                    metrics.push(m);
                }
            );

            this.metrics = metrics;

            return this;
        }

        flush_json_buffer() {
            this.jsonInput = [];
            return this;
        }

        send_metrics() {
            this.metrics.forEach (function(metric) {
                this.agent.increment(metric.destination, metric);
            });
            return this;
        }


        flush_metrics() {
            this.metrics = [];
            return this;
        }

        tags() {
            return this.with_tags();
        }

        // Combine global (base) tags with any extra tags that have been configured.
        // Pass in more tags (kvp) to be combined with the result
        // more_tags values override if keys preexist
        with_tags(more_tags) {
            var tags = {
                'host': this.host
            };

            this.extra_tags.forEach(function (t, v) {
                tags[t] = v;
            });

            if (more_tags != null && typeof(more_tags) != 'undefined') {
                more_tags.forEach(function (t, v) {
                    tags[t] = v;
                })
            }

            return tags;
        }

    }
};




