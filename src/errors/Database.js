const Log = require("../helpers/logger");

class DatabaseError extends Error {
    constructor(message) {
        super(message);
    }
}

//Access to a database had been rejected. Provides user friendly instructions.
class AccessDeniedError extends DatabaseError {
    constructor() {
        super("Access denied to database using configured credentials.");
        this.name = "DatabaseAccessDenied";

        Log.error("[i] Please check the username and password are correct.");
        Log.error("[i] Alternatively, check the user has the required database permissions.");
    }
}

module.exports = {
    AccessDeniedError
}