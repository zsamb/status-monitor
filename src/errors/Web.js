const Log = require("../helpers/logger");

class WebError extends Error {
    constructor(message) {
        super(message);
    }
}

//Webserver failed to start because the address is already being used. Provides user friendly instructions.
class AddressInUse extends WebError {
    constructor(address) {
        super(`Webserver address is already in use. ${address}`);
        this.name = "WebAddressInUse";

        Log.error("[i] Another process is using the configured webserver port.");
        Log.error("[i] Try stopping the process or using a different port.");
    }
}

module.exports = {
    AddressInUse
}