const humanizeDuration = require("humanize-duration");

//Simple stopwatch to record duration
class Stopwatch {
    constructor() {
        this.startTime = undefined;
        this.active = false;
    }

    start() {
        if (!this.active) { 
            this.startTime = Date.now(); 
            this.active = true;
        }
    }

    stop() {
        this.active = false;
        return this.parseTime(this.startTime, Date.now());
    }

    parseTime(start, end) {
        return humanizeDuration(end - start);
    }
}

module.exports.Stopwatch = Stopwatch;