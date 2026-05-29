const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Film = sequelize.define('Film', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    director: {
        type: DataTypes.STRING,
        allowNull: false
    },

    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    genre: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Film;