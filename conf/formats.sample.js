"use strict";
module.exports = function() {
    return {
        'key': {
        metric_path: 'the.path.datadog.uses.for.these.metrics',
        metric_value: {
            type: 'increment'
        },
        field_tags: ["name", "status", "full_name", "age"],
        extra_tags: {
            "env": "",
            "user": "",
            "is_test": true
        }},
        'cpu': {
            metric_path: "my.cpu.usage",
            metric
        }
    };
});