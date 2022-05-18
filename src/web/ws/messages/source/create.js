const Log = require("../../../../helpers/logger");
const Source = require("../../../../db/models/source");
const { ValidationError } = require("sequelize");
const Verify = require("../../../../monitor/ping/verify");

module.exports = async (ws, data) => {
    //Create a new source with the payload data.
    try {
        //Validate options
        //TODO convert to universal verification (by verifying data.options and getting the verify func by source type)
        //TODO need to include interval now (verify interval data as options cannot be verified by db)
        await Verify(data.address);

        //TODO verify name with db       
        //TODO options string of options field in source table should be stringified json of verified options
        //const source = await Source.create(data);
        ws.send("beans");
        console.log(data);
    } catch (error) {
        //Interpret validation errors and send to client
        if (error instanceof ValidationError) {
            ws.send(JSON.stringify({ error: true, message: error.errors[0].message }));
        } else {
            ws.send(JSON.stringify({ error: true, message: error }));
        }
    }
}