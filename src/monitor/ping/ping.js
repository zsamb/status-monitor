const NetPing = require("net-ping");

//Ping configured address and port
module.exports = (ip) => {
    return new Promise((resolve, reject) => {
        try {  
            let session = NetPing.createSession();
            session.pingHost(ip, (error, target, sent, received) => {
                if (!error) { 
                    if (received && sent) {
                        resolve({ alive: true, time: received.getTime() - sent.getTime() });
                    } else {
                        resolve({ alive: true, time: 0 });
                    }
                }
                else {
                    if (error instanceof NetPing.RequestTimedOutError) {
                        resolve({ alive: false });
                    } else { reject(error.toString()); }
                }
            });
        } catch(error) {
            reject("Failed to create ping session.");
        }   
    });
}