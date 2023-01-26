const mongoose = require('mongoose');
const { getData } = require('./function/getData')
const { parseXML } = require('./function/parseXML')
const { filterObject } = require('./function/filterObject')
const { saveDeviceData } = require('./function/saveDeviceData');
const { getDevices } = require('./function/getDevices');
const AGENT_URL = 'http://192.168.10.120:5000/current'
const {MONGODB_URI} = require('./db/mongoPassword')

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
    let devices = await getDevices()
    let deviceStateChecker = new Array(devices.length).fill('INIT')
    let deviceStartTimeChecker = new Array(devices.length).fill(0)
    setInterval(async () => {
    // try {
    const result = await getData(AGENT_URL)
    const parsedXML = await parseXML(result)
    const filterdDevices = filterObject(parsedXML, devices)

    for(let i =0; i<devices.length; i++){
        console.log("CurrentTime: "+filterdDevices[i].saveTime+", Device Name: "+filterdDevices[i].deviceName+",   Last state: "+deviceStateChecker[i]+",   Current State: "+filterdDevices[i].state)
        if(deviceStateChecker[i] !="ACTIVE" && filterdDevices[i].state == "ACTIVE"){
            deviceStartTimeChecker[i] = filterdDevices[i].saveTime
        }
        
        if(filterdDevices[i].state =="STOPPED" && deviceStateChecker[i] =="STOPPED") {
            continue
        }else if(filterdDevices[i].state =="OFF" && deviceStateChecker[i] =="OFF"){
            continue
        }else if(filterdDevices[i].state =="ACTIVE" && deviceStateChecker[i] == "ACTIVE"){
            filterdDevices[i].runningTime = filterdDevices[i].saveTime - deviceStartTimeChecker[i]
            // console.log("Device Name: "+deviceStateChecker[i].device+": "+filterdDevices[i].runningTime)
            await saveDeviceData(filterdDevices[i])
            deviceStateChecker[i] = filterdDevices[i].state
        }
        else {
            filterdDevices[i].runningTime = 0
            // console.log("Device Name!: "+deviceStateChecker[i].device+": "+filterdDevices[i].runningTime)

            await saveDeviceData(filterdDevices[i])
            deviceStateChecker[i] = filterdDevices[i].state
        }
}
    // try {
    // } catch (error) {
    //     console.log(error);
    // }
    // } catch (error) {
    //     console.log(error);
    // }
    }, 500);
}

main()
