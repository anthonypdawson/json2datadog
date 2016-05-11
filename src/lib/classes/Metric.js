"use strict";

module.exports =  function() {
    return class Metric {

        constructor(metric_path, metric_type, metric_value, tags) {
            this.tags = {};
            this.path = metric_path;
            this.metric_type = metric_type;
            this.metric_value = metric_value;
            if (tags) this.tags = tags;
        }


        add_tag(tagKey, tagValue) {
            this.tags[tagKey] = tagValue;
            return this;
        }

        add_tags(tags){
            tags.forEach(function(t, v) {
                this.add_tag(t, v);
            });
        }

        is_histogram() {
            return this.metric_type.toLowerCase() == 'histogram';
        }

        is_timing() {
            return this.metric_type.toLowerCase() == 'timing';
        }

        get_metric_value() {
            if (this.is_histogram() || this.is_timing()){
                var field = this.metric_value;
                if (this.hasOwnProperty(field)) {
                    return this[field];
                }
            } else {
                switch(this.metric_type.toLowerCase()) {
                    case "incrementBy":
                        return this.metric_value;
                    case "decrementBy":
                        return this.metric_value * -1;
                    case 'decrement':
                        return -1;
                    default: return 1;
                }
            }
        }


    }
};