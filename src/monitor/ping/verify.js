const { isIP } = require("net");
const ConfigHelper = require("../../helpers/config");
const Log = require("../../helpers/logger");
const ResolveDNS = require("./resolve_dns");

const Config = new ConfigHelper();

//Verify source configuration
module.exports = (address) => {
    return new Promise(async (resolve, reject) => {
        if (!address) reject("Ping address is not configured.");
        //Evaluate IP
        if (isIP(address) !== 0) {

            if (Config.get("debug")) Log.info(`[debug][ping] Found IP: ${address}`);
            //True to signal that there is no need to resolve dns routinely.
            resolve({ address, ip: true });

        } else {
            //Attempt to resolve an IP if address is not one
            ResolveDNS(address, Config.get("debug"))
            .then(ip => resolve({ address: ip }))
            .catch(error => {
                //Elaborate certain error codes
                switch(error.code) {
                    case "ERR_INVALID_URL":
                        reject("Invalid ping adresss.");
                        break;
                    case "ENODATA":
                    case "ENOTFOUND":
                        reject("Could not resolve ping IP from hostname.");
                    default:
                        reject(error.message);
                }
            })
        }
    });
}