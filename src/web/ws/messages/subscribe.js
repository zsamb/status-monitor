const ConfigHelper = require("../../../helpers/config");
const Log = require("../../../helpers/logger");
const { cache } = require("../../../helpers/cache");

const Config = new ConfigHelper();

module.exports = async (ws) => {
    
    if (Config.get("debug")) {
        Log.info(`[debug][ws] ${ws.shortId} -> Subscribed to status updates.`); 
    }

    let subscribed = cache.get("subscribed") || [];

    if (!subscribed.includes(ws.id)) {
        subscribed.push(ws.id);
    }

    cache.set("subscribed", subscribed);
}