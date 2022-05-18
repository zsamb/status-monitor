const Log = require("../helpers/logger");

class MonitorError extends Error {
    constructor(message) {
        super(message);
    }
}

//Invalid source type has been defined. Provides user friendly instructions.
class InvalidSourceType extends MonitorError {
    constructor(type) {
        super(`Invalid source type: ${type}`);
        this.name = "MonitorInvalidSourceType";

        Log.error("[i] You have configured your monitor sources incorrectly.");
        Log.error("[i] The available source types are: ping");
    }
}

module.exports = {
    InvalidSourceType
}