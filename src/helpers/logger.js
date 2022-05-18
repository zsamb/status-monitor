const Bunyan = require("bunyan");
const Path = require("path");
const ConfigHelper = require("./config");

const Config = new ConfigHelper();

const Log = Bunyan.createLogger({
    name: "status-monitor",
    serializers:  Bunyan.stdSerializers,
    streams: [
        {
            level: "info",
            stream: process.stdout
        },
        {
            level: "info",
            type: "rotating-file",
            path: Path.join(Config.get("logs.path"), "monitor.log"),
            period: "1d",
            count: Config.get("logs.history")
        }
    ]
});

module.exports = Log;