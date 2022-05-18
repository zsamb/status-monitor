const { Sequelize, AccessDeniedError } = require("sequelize");
const { AccessDeniedError: DatabaseAccessDenied } = require("../errors/Database");
const ConfigHelper = require("../helpers/config");
const Log = require("../helpers/logger");

const Config = new ConfigHelper();

//Database wrapper
//https://sequelize.org/v6/
class Database {
    constructor() {
        let creds = Config.get("mysql.credentials");
        //Initiate new sequelize client
        this.sequelize = new Sequelize(creds.database, creds.username, creds.password, 
            {
                host: creds.host,
                port: creds.port,
                dialect: "mysql",
                //Enable debug logging if enabled in config
                logging: Config.get("debug") ? msg => Log.info(`[debug][sql] ${msg}`) : false,
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            }
        );
    }

    async connect(callback) {
        //Test connection
        try { 
            await this.sequelize.authenticate(); 
            //Sync with database
            await this.sequelize.sync();
            callback(); 
        } catch (error) { 
            if (error instanceof AccessDeniedError) callback(new DatabaseAccessDenied())
            else callback(error);
        }
    }
}

module.exports = new Database();