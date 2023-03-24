const mongoose = require('mongoose');
const { getData } = require('./function/getData');
const { filterObject } = require('./function/filterObject');
const { saveDeviceData } = require('./function/saveDeviceData');
const { readMachineList } = require('./function/readMachineList');
const { determineAction } = require('./function/determineAction')
const { postMessage } = require('./function/postMessage')
const AGENT_URL = require('./db/config').AGENT_URL;
const mongoPassword = require('./db/config').mongoPassword;
const INTERVAL_TIME = 500

const slackToken = require('./db/config').slackToken;
const { WebClient } = require('@slack/web-api')
const slackBot = new WebClient(slackToken)


let connection = null;
const connect = async () => {
    if (connection && mongoose.connection.readyState === 1) return connection;
    connection = await mongoose.connect(mongoPassword, { useNewUrlParser: true });
    return connection;
};

async function main() {
    // Connect with MongoDB
    await connect();
    console.log('\x1b[36m%s\x1b[0m', '\nMongoDB connected');

    // Get deviceList from AWS Lambda function
    const devices = await readMachineList();
    console.log('\x1b[36m%s\x1b[0m', '\nGet Device from AWS Lambda');
    console.log('\x1b[32m%s\x1b[0m', '[Device List]')
    for (let device of devices) {
        console.log(`- ${device.name}`)
    }

    // Create a 'checker' to detect for changes in the device's state
    const deviceStateChecker = new Array(devices.length).fill('INIT');
    const deviceStartTimeChecker = new Array(devices.length).fill(0);

    // Reads CNC data from the device every 'INTERVAL_TIME'
    setInterval(async () => {
        // Reads data from devices currently connected to the PC
        const result = await getData(AGENT_URL);

        // Filter read data by device
        const filteredDevices = filterObject(result, devices);

        for (let i in filteredDevices) {
            let previousState = deviceStateChecker[i];
            let currentState = filteredDevices[i].state;

            console.log(`${filteredDevices[i].deviceName}   ${deviceStateChecker[i]} -> ${filteredDevices[i].state}`);
            const [shouldSave, isStart, isRunning, shouldPostMessage] = determineAction(currentState, previousState)
            if (isStart) {
                deviceStartTimeChecker[i] = filteredDevices[i].saveTime;
                console.log('\x1b[34m%s\x1b[0m', 'Machine Start')
            }

            if (isRunning) {
                filteredDevices[i].runningTime = filteredDevices[i].saveTime - deviceStartTimeChecker[i];
                console.log('\x1b[34m%s\x1b[0m', 'Running...')
            }else{
                filteredDevices[i].runningTime = 0;
            }

            if (shouldSave) {
                console.log('\x1b[34m%s\x1b[0m', 'Save Data')
                await saveDeviceData(filteredDevices[i]);
            }

            if (shouldPostMessage) {
                const targetDevice = filteredDevices[i].deviceName
                const targetChannel = devices.find(device => {
                    return targetDevice === device.name
                }).slack_channel;

                if (targetChannel) {
                    console.log('\x1b[34m%s\x1b[0m', `Post Message on Channel for [${targetDevice}]`)
                    // console.log(filteredDevices[i])
                    if(filteredDevices[i].Device.Components){
                        await postMessage(slackBot, targetChannel, targetDevice, previousState, currentState, filteredDevices[i].Device.Components.path.Events.part_count, filteredDevices[i].runningTime, filteredDevices[i].Device.Components.path.Events.block)
                    }else{
                        console.log('\x1b[31m%s\x1b[0m', `ERROR: There is no 'Conponents' element in [${targetDevice}] Stream Data`)
                    }
                } else {
                    console.log('\x1b[31m%s\x1b[0m', `ERROR: There is no Channel for [${targetDevice}]`)
                }
            }

            deviceStateChecker[i] = currentState;
        }
    }, INTERVAL_TIME);
}

main();