"use strict";
module.exports = function() {
    return {
        'key': {
        metric_path: 'the.path.datadog.uses.for.these.metrics',
        field_tags: ["name", "status", "full_name", "age"],
        extra_tags: {
            "env": "",
            "user": "",
            "is_test": true
        }}
    };
});