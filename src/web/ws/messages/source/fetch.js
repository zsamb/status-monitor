const Log = require("../../../../helpers/logger");
const Source = require("../../../../db/models/source");
const { ValidationError } = require("sequelize");
const Verify = require("../../../../monitor/ping/verify");

module.exports = async (ws) => {
    //Fetch all sources from db
    try {
        const sources = await Source.findAll();
        ws.send(JSON.stringify(sources));
    } catch (error) {
        ws.send(JSON.stringify({ error: true, message: error.message }));
    }
}