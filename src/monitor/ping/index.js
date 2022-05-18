/*
    Ping Monitor Source
    Pings a specific port on the defined address, and
    checks simply whether the ping was successful or
    not.

    Note: Services behind cloudflare will not report accurate results.

    Config Options:
        address: hostname or IPv4 address to ping
        interval: interval between pings, (update rate in seconds)

    Running code (this.running) 1  = Running, 2 = Stopped, 3 = Error
*/
const EventEmitter = require('events');
const Log = require("../../helpers/logger");
const { TimedLoop } = require("../../helpers/util");
const ping = require("./ping");
const Verify = require("./verify");
const ResolveDNS = require("./resolve_dns");

class Ping extends EventEmitter {
    constructor(id, { address, name, interval = 60 }) {
        super();
        this.id = id;
        this.address = address;
        this.name = name;
        this.interval = interval;
        this.running = 2;
    }

    verify() {
        Verify(this.address)
        .then(({ address, ip }) => { 
            this.ip = address;
            this.isIP = ip || false;
            return this.test()
        })
        .then(() => { this.emit("Verified"); })
        .catch(error => this.emit("VerifyFailed", error));
    }

    start() {
        //Begin routinely pinging an IP and logging the targets status.
        this.running = 1;
        this.updateLoop = new TimedLoop({
            //TODO force dns resolve using http endpoint or websocket message (require admin auth)
            //Use a routine to check for any DNS changes every 5 pings 
                ms: this.interval * 1000,
                routine: {
                    interval: 5,
                    func: () => {
                        if (!this.isIP) {
                            ResolveDNS(this.address)
                            .then(ip => { this.ip = ip })
                            .catch(error => {
                                Log.error(`Routine DNS resolve failed: ${error.message}`);
                            })
                        }
                    }
                }
            }, () => {
                ping(this.ip)
                .then(status => { 
                    //Emit update event with status
                    this.emit("Update", this.id, {
                        type: "ping",
                        address: this.address,
                        status, 
                        lastUpdated: Date.now()
                    });
                })
                .catch(() => {
                    //Stop source and report error
                    this.updateLoop.stop();
                    this.running = 3;
                })
        });
        
        this.emit("Started");
    }

    //Fire off test ping
    test() {
        return new Promise((resolve, reject) => {
            ping(this.ip)
            .then(() => resolve())
            .catch(error => reject(error));
        });
    }
}

module.exports = Ping;