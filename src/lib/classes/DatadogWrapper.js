"use strict";

 module.exports = function(node_dogstatsd, log4js) {

    var logger = log4js.getLogger("DatadogWrapper");

    var DatadogAgent = node_dogstatsd.StatsD;

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
         get metric_path() {
             return this.path.join('.');
         }

         // Stores path as list
         set metric_path(path) {
             if (typeof(path) == 'string') {
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
             jsonLines.forEach(function (json) {
                 this.add_line(json);
             });

             return this;
         }

         // Reads 'field_tags' from configuration, returning all that also exist on the given object
         get_matching_fields(obj) {
             var matched_tags = [];
             var configured_tags = this.configuration.field_tags;
             for (var tag in configured_tags) {
                 // Checking if that object has the field for the given tag.  Also checks to see if we have a field to skip defined and if this matches do not push
                 if (obj.hasOwnProperty(tag) &&
                     (typeof this.skip_field != 'undefined' && this.skip_field != null && this.skip_field.toLowerCase() == tag.toLowerCase())) {
                     matched_tags.push(tag);
                 }
             }

             return matched_tags;
         }

         build_metrics() {
             var metrics = [];
             var logs = this.get_json_buffer();

             var metric_def = this.configuration.metric_value;

             this.metric_type = metric_def.type;
             this.metric_value = metric_def.value;

             if (this.metric_type == 'histogram' || this.metric_type == 'timing') {
                 this.skip_field = this.metric_value;
             }
             logs.forEach(function (log) {
                     var fields = this.get_matching_fields(log);
                     var m = new Metric(this.metric_path, this.metric_type, this.metric_value, this.tags());
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
             this.metrics.forEach(function (metric) {
                 var val = metric.get_metric_value();
                 this.log.log(metric.destination + " Type: " + this.metric_type + " Field: " + this.metric_value + " Val: " + val + " Tags: " + metric.tags)
                 switch (this.metric_type) {
                     case 'timing':
                         //this.agent.timing(metric.destination, val, metric.tags);
                         this.log.log("Datadog Timing");
                         break;
                     case 'histogram':
                         //this.agent.histogram(metric.destination, val, metric.tags);
                         this.log.log("Execute histogram");
                         break;
                     case 'increment':
                         this.log.log("Execute increment");
                         this.agent.increment(metric.destination, metric.tags);
                         break;
                     case 'incrementby':
                     case 'decrement':
                     case 'decrementby':
                         this.log.log("Execute update_stats");
                         //this.agent.update_stats(metric.destination, val, metric.tags);
                         break;
                 }
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

