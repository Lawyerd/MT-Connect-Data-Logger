const mongoose = require('mongoose');
const express = require('express')
const { getData } = require('./getData')
const { filterObject } = require('./filterObject')
const {saveDeviceData} = require('./saveDeviceData')
const AGENT_URL = 'http://192.168.10.120:5000/current'
const MONGODB_URI = 'mongodb+srv://junseok:jim1292@cluster0.vrtl2.mongodb.net/CNC_Monitoring'

let connection = null;
const connect = () => {
    if (connection && mongoose.connection.readyState === 1)
        return Promise.resolve(connection);
    return mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
        .then(conn => { connection = conn; return connection; });
};



async function main() {
    await connect()
    setInterval(async () => {
        try {
            const parsedXML = await getData(AGENT_URL)
            try {
                const filterdDevices = filterObject(parsedXML)
                await saveDeviceData(filterdDevices)
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            console.log(error);
        }
    }, 1000);
}

main()