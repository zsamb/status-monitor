/*
    Service Status Monitor
    By Sam Barfield

    This program monitors different configured services
    and displays status information to a public webpage. 

    https://trello.com/b/11qn2VJ2/pterostatus
    https://github.com/pterodactyl/daemon
*/
const Async = require("async");
const Package = require("../package.json");
const Log = require("./helpers/logger");
const Version = require("./helpers/version");
const Time = require("./helpers/time");
const Database = require("./db/database");
const WebServer = require("./web/http/server");
const MonitorManager = require("./monitor/manager");

const { cache } = require("./helpers/cache");

const Stopwatch = new Time.Stopwatch();

Log.info("Initialising status monitor.");
Stopwatch.start();
cache.set("starting", true);

Async.auto({

    check_version: callback => {
        Version.check((error, latest) => {
            if (!error) {
                if (latest === Package.version) {
                    Log.info(`Running version v${Package.version}. You're up-to-date!`);
                } else {
                    Log.warn(`Running version v${Package.version} and latest is v${latest}. Please update!`);
                }
            } else {
                Log.error(`Failed to check for latest version! Running version v${Package.version}`);
            }
            callback();
        })
    },

    connect_database: ["check_version", (results, callback) => {
        Database.connect(error => {
            if (error) { 
                Log.error("Could not connect to database.");
                callback(error);
            } else {
                Log.info("Connection to database is OK.");
                callback();
            }
        });
    }],

    start_webserver: ["connect_database", (results, callback) => {
        WebServer.start(error => {
            if (error) {
                Log.error("Failed to start webserver!");
                callback(error);
            } else {
                callback();
            }
        })
    }],

    start_manager: ["start_webserver", "connect_database", (results, callback) => {
        MonitorManager.start(error => {
            if (error) {
                Log.error("Failed to start monitor manager.");
                callback(error);
            } else {
                callback();
            }
        })
    }]

}, (error, results) => {
    //Any error in initialisation is fatal
    if (error) {
        Log.fatal("Failed to initialise status monitor.", { error });
        process.exit(1);
    } else {
        cache.set("starting", false);
        Log.info(`Initialisation complete! Took ${Stopwatch.stop()}`);
    }
});


/*  
    MONITOR MANAGER
    fork cp for monitor manager
    use event emitter pipeline to send status updates from sources e.g. like ipc between cp's
*/

/*
    WEBSOCKET SERVER

    ENDPOINTS
    + test source

    check origin to only allow websocket connections from status.sambarfield.com ect..
*/