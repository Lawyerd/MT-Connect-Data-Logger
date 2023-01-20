const mongoose = require('mongoose');
const express = require('express')
const { getData } = require('./function/getData')
const { parseXML } = require('./function/parseXML')
const { filterObject } = require('./function/filterObject')
const { saveDeviceData } = require('./function/saveDeviceData');
const AGENT_URL = 'http://192.168.10.120:5000/current'
const MONGODB_URI = 'mongodb+srv://junseok:jim1292@cluster0.vrtl2.mongodb.net/CNC_Monitoring'
const deviceStore = require("./db/deviceList.json")

let connection = null;
const connect = () => {
    if (connection && mongoose.connection.readyState === 1)
        return Promise.resolve(connection);
    return mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
        .then(conn => { connection = conn; return connection; });
};



async function main() {
    await connect()
    console.log('connected!')
    let deviceStateChecker = deviceStore.deviceLists
    console.log(deviceStateChecker)
    setInterval(async () => {
    // try {
    const result = await getData(AGENT_URL)
    const parsedXML = await parseXML(result)
    const filterdDevices = filterObject(parsedXML)

    for(let i =0; i<deviceStateChecker.length; i++){
        console.log("Device Name: "+deviceStateChecker[i].device+",   Last state: "+deviceStateChecker[i].state+",   Current State: "+filterdDevices[i].state)

        if(filterdDevices[i].state =="STOPPED" && deviceStateChecker[i].state =="STOPPED") {
            continue
        }else if(filterdDevices[i].state =="OFF" && deviceStateChecker[i].state =="OFF"){
            continue
        }else {
            await saveDeviceData(filterdDevices[i])
            deviceStateChecker[i].state = filterdDevices[i].state
        }
}
    // try {
    // } catch (error) {
    //     console.log(error);
    // }
    // } catch (error) {
    //     console.log(error);
    // }
    }, 200);
}

main()
