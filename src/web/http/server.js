const Express = require("express");
const Http = require('http')
const Log = require("../../helpers/logger");
const ConfigHelper = require("../../helpers/config");
const WsServer = require("../ws/server");
const { AddressInUse: WebAddressInUse } = require("../../errors/Web");
const { URL } = require("url");

const Config = new ConfigHelper();
const { cache } = require("../../helpers/cache");

//Webserver to serve status page and starting page over http
//https://expressjs.com/
class WebServer {
    start(callback) {

            Log.info("Starting webserver...");
            const app = Express();

            //Display starting message if initialisation isn't complete.
            app.use((req, res, next) => {
                if (cache.get("starting")) {
                    res.send("Status Monitor is starting.");
                } else {
                    next();
                }
            });

            app.use("/", Express.static("public/"));
            this.server = Http.createServer(app);

            //Listen for http error event
            this.server.on("error", error => { 
                if (error.code === "EADDRINUSE") callback(new WebAddressInUse(`:${Config.get("webserver.port")}`));
                else callback(error);
            });

            this.server.on("listening" , () => {
                let { address, port } = this.server.address();
                Log.info(`WebServer listening on ${address}:${port}.`);
                callback();
            });

            //Listen for the upgrade event, which signals a websocket connection request
            this.server.on("upgrade", (req, socket, head) => {
                let reqUrl = new URL(req.url, `http://${req.headers.host}`);

                //Handle live status connections - no authentication is required here.
                if (reqUrl.pathname === "/ws/status") {
                    WsServer.wss.handleUpgrade(req, socket, head, ws => {
                        WsServer.wss.emit("connection", ws, req);
                    });
                } else {
                    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                    socket.destroy();
                }
            });

            this.server.listen(Config.get("webserver.port"));
    }
}

module.exports = new WebServer();