const Log = require("../../helpers/logger");
const dns = require("dns");
const { URL } = require("url");

//Resolve an IP Address from DNS Hostname
module.exports = (address, debug) => {
    return new Promise(async (resolve, reject) => {
        try {
            const url = new URL(address);
            let records = await dns.promises.resolve4(url.hostname);

            if (records.length < 1) throw new Error("Could not resolve ping hostname.");
            else { 

                let ip = records[0];
                if (debug) Log.info(`[debug][ping] Resolved IP: ${ip}`);
                resolve(ip);

            };
        } catch(error) {
            reject(error);
        }
    }); 
}