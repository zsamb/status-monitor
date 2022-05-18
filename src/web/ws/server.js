const { WebSocketServer, WebSocket } = require("ws");
const { v4 } = require("uuid");

const Log = require("../../helpers/logger");
const ConfigHelper = require("../../helpers/config");
const Messages = require("./messages");
const { cache } = require("../../helpers/cache");
const MonitorManager = require("../../monitor/manager");

const Config = new ConfigHelper();

//Websocket server to send live status updates to user
//https://github.com/websockets/ws#client-authentication
class WsServer {
    constructor() {
        //Create new websocket server
        this.wss = new WebSocketServer({ noServer: true });

        this.wss.on("connection", (ws, req) => {

            ws.id = v4();
            ws.shortId = ws.id.substring(0, 7);

            if (Config.get("debug")) Log.info(`[debug][ws] ${ws.shortId} -> Connected.`);
            
            ws.on("error", error => {
                Log.error(`Error on websocket connection ${ws.shortId}: ${error.message}`);
            });

            ws.on("close", () => {
                //Remove from subscribed connections
                let subscribed = cache.get("subscribed") || [];
                if (subscribed.includes(ws.id)) {
                    subscribed.splice(subscribed.indexOf(ws.id), 1);
                    cache.set("subscribed", subscribed);
                }

                if (Config.get("debug")) Log.info(`[debug][ws] ${ws.shortId} -> Disconnected.`); 
            });

            //Handle incoming messages
            ws.on('message', data => { 
                this.messageHandler(ws, data);
            });
        });

        //Broadcast status updates to all subscribed connections
        MonitorManager.on("Update", statusData => {
            let subscribed = cache.get("subscribed") || [];
            this.wss.clients.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN && subscribed.includes(ws.id)) {
                    ws.send(JSON.stringify(Object.fromEntries(statusData)));
                }
            })
        });
    };

    getIPv4(req) {
        let { address } = req.socket.address();
        return address;
    }

    //Handle messages appropriately
    messageHandler(ws, data) {
        try {

            let payload = JSON.parse(data);
            let handle = this.findHandle(payload.message);

            //Fetch message handle based on translated json message field then hand control
            if (!handle) this.sendError(ws, "Invalid message field.");
            else handle(ws, payload.data || {});
        
        } catch (error) {
            if (error instanceof SyntaxError) {
                this.sendError(ws, "Invalid message format. Expected JSON.");
            } else {
                Log.error(`Error on websocket connection ${ws.shortId}: ${error.message}`);
            }
        }
    }

    //Finds message handle
    findHandle(message) {
        //Fetch value of message from message handle index
        try {
            return message.split(".").reduce((msgs, msg) => msgs[msg], Messages);
        } catch (error) { 
            return undefined;
        }
    }

    sendError(ws, message) {
        ws.send(JSON.stringify({ error: true, message }));
    }
}

module.exports = new WsServer();
