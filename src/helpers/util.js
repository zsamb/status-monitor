//A timed loop is an interval that fires once, then repeats at a set interval
class TimedLoop {
    constructor(options, callback) {
        this.ms = options.ms || 60 * 1000;
        this.options = options;
        this.callback = callback;

        //Routines run once for every x times the loop runs
        if (this.options.routine) this.useRoutine = true;

        this.runs = 0;
        this.start();
    }

    stop() {
        clearInterval(this.interval);
        this.running = false;
    }

    start() {
        this.running = true;
        this.callback();
        this.interval = setInterval(() => {
            this.runs++;
            
            //Execute a routine if defined
            if (this.useRoutine) {
                if (this.runs % this.options.routine.interval === 0) {
                    this.options.routine.func();
                }
            }

            this.callback();
        }, this.ms);
    }
}

module.exports = {
    TimedLoop
}