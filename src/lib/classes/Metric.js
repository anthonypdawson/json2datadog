"use strict"

module.exports = function() {
    return class Metric {
        constructor(metric_path, tags) {
            this.tags = {};
            this.path = metric_path;
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

    }
};