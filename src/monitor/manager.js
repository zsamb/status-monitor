const EventEmitter = require('events');
const { v4 } = require("uuid");
const Log = require("../helpers/logger");
const Sources = require("./sources");
const ConfigHelper = require("../helpers/config");
const { InvalidSourceType } = require("../errors/Monitor");

const Config = new ConfigHelper();

class MonitorManager extends EventEmitter {
    constructor() {
        super();
        this.sources = [];
        this.statusData = new Map();
    }

    start(callback) {
        Log.info("Starting monitor manager...");
        this.configSources = Config.get("sources");
        
        this.init()
        .then(() => {
            
            //Emit update event
            setInterval(() => { this.emit("Update", this.statusData) }, 2000);
            Log.info("Monitor manager started.");
            callback();

        })
        .catch(error => callback(error));
    }

    init() {
        return new Promise((resolve, reject) => {
            //Begin initiating each monitor source, and verifying they are configured correctly.
            Log.info("Initiating monitor sources...");

            this.configSources.forEach(usrSource => { 

                const order = `[${this.sources.length + 1} of ${this.configSources.length}]`;
                Log.info(`Creating monitor ${usrSource.type} ${order}`);

                if (!usrSource.type || usrSource.type.length < 1) reject(new InvalidSourceType("none"));
                let Source = Sources(usrSource.type);

                if (Source) {
                    try {

                        let source = new Source(v4(), usrSource);

                        source.on("Verified", () => {
                            source.start();
                            this.sources.push(source);
                            resolve();
                        });

                        //TODO Implement custom errors for verification
                        source.on("VerifyFailed", error => reject(error));
                        source.on("Update", (id, status) => { this.statusData.set(id, status) });
                        source.on("Started", () => { Log.info(`Started monitor ${usrSource.type} ${order}`) });

                        source.verify();

                    } catch (error) { 
                        reject(error) 
                    }

                } else {
                    reject(new InvalidSourceType(usrSource.type));
                }
            });
        });
    }
}

module.exports = new MonitorManager();