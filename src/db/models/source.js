const { DataTypes } = require("sequelize");
const Database = require("../database");

const sequelize = Database.sequelize;
const AllowedSources = ["ping"];

const Source = sequelize.define("Source", {
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            allowed(value) {
                if (!AllowedSources.includes(value)) {
                    throw new Error(`Invalid source type: ${value}`);
                }
            }
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            min(value) {
                if (value.length < 1) {
                    throw new Error("Invalid source name. Should be at least 1 character.");
                }
            },
            max(value) {
                if (value.length > 32) {
                    throw new Error("Invalid source name. Should be no longer than 32 characters.");
                }
            }
        }
    },
    //TODO We can use a database table name field here to direct to the sources auto-generated status history table
    // storage: {
    //     type: DataTypes.STRING,
    // }
    // ^ this way the table can be generated with an ID without getting lost
    options: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            min(value) {
                if (value.length < 1) {
                    throw new Error("No options present.");
                }
            },
        }
    }
});

module.exports = Source;