const { WebSocket } = require("ws");
const ws = new WebSocket("ws:/localhost:3000/ws/status");

process.stdin.on("data", data => { 
    let input = data.toString().trim();
    ws.send(JSON.stringify({
        message: "source.create",
        data: {
            address: "https://sambarfield.com",

        }
    }));
})

// ws.on('open', function open() {
//     ws.send(JSON.stringify({
//         message: input,
//         data: {
//             type: "ping",
//             name: "Test Source"
//         }
//     }));
// });
  
ws.on('message', function message(data) {
    console.log('received: %s', data);
});

