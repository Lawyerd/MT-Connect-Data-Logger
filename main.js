const mongoose = require('mongoose');
const { getData } = require('./function/getData');
const { parseXML } = require('./function/parseXML');
const { filterObject } = require('./function/filterObject');
const { saveDeviceData } = require('./function/saveDeviceData');
const { getDevices } = require('./function/getDevices');
const AGENT_URL = 'http://192.168.10.120:5000/current';
const MONGODB_URI = require('./db/mongoPassword').mongoPassword;

let connection = null;
const connect = async () => {
    if (connection && mongoose.connection.readyState === 1) return connection;
    connection = await mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
    return connection;
};

async function main() {
    await connect();
    console.log('connected!');
    const devices = await getDevices("");
    const deviceStateChecker = new Array(devices.length).fill('INIT');
    const deviceStartTimeChecker = new Array(devices.length).fill(0);

    setInterval(async () => {
        const result = await getData(AGENT_URL);
        const parsedXML = await parseXML(result);
        const filteredDevices = filterObject(parsedXML, devices);
        for (let i = 0; i < filteredDevices.length; i++) {
            console.log(`CurrentTime: ${filteredDevices[i].saveTime}, Device Name: ${filteredDevices[i].deviceName},   Last state: ${deviceStateChecker[i]},   Current State: ${filteredDevices[i].state}`);
            if (deviceStateChecker[i] !== 'ACTIVE' && filteredDevices[i].state === 'ACTIVE') {
                deviceStartTimeChecker[i] = filteredDevices[i].saveTime;
            }

            if (filteredDevices[i].state === 'STOPPED' && deviceStateChecker[i] === 'STOPPED') {
                continue;
            } else if (filteredDevices[i].state === 'OFF' && deviceStateChecker[i] === 'OFF') {
                continue;
            } else if (filteredDevices[i].state === 'INTERRUPTED' && deviceStateChecker[i] === 'INTERRUPTED') {
                continue;
            } else if (filteredDevices[i].state === 'ACTIVE' && deviceStateChecker[i] === 'ACTIVE') {
                filteredDevices[i].runningTime = filteredDevices[i].saveTime - deviceStartTimeChecker[i];
                await saveDeviceData(filteredDevices[i]);
                deviceStateChecker[i] = filteredDevices[i].state;
            } else {
                filteredDevices[i].runningTime = 0;
                await saveDeviceData(filteredDevices[i]);
                deviceStateChecker[i] = filteredDevices[i].state;
            }
        }
    }, 500);
}

main();