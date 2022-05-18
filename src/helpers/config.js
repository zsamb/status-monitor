const { cache } = require("./cache");

//Config helper class
class Config {
    constructor() {
        //Skip reading config if already in cache
        if (!cache.has("config")) {
            cache.set("config", this.read());
        }
    }

    read() {
        try {
            return require("../../config.json");
        } catch (error) {
            if (error.code === "MODULE_NOT_FOUND") {
                console.error("[FATAL] Failed to initialise status monitor: ");
                console.error("[FATAL] Configuration file config.json not found!");
                process.exit(1);
            }
        }
    }

    get(key) {
        //Fetch value of key from config
        try {
            return key.split(".").reduce((conf, key) => conf[key], cache.get("config"));
        } catch (error) { return undefined }
    }
}

module.exports = Config;