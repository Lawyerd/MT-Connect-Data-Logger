const mongoose = require('mongoose');
const cron = require('node-cron')
const chalk = require('chalk');
const { getStreamData } = require('./modules/getStreamData');
const { filterObject } = require('./modules/filterObject');
const { saveStreamData } = require('./modules/saveStreamData');
const { readMachineList } = require('./modules/readMachineList');
const { determineAction } = require('./modules/determineAction')
const { postMessage } = require('./modules/postMessage')
const { agentUrl, mongoPassword, slackToken } = require('./db/config');
const { WebClient } = require('@slack/web-api')
const slackBot = new WebClient(slackToken)
const intervalTime = 0.1



const connect = async () => {
    let connection = null;
    if (connection && mongoose.connection.readyState === 1) return connection;
    connection = await mongoose.connect(mongoPassword, { useNewUrlParser: true });
    return connection;
};

async function main() {
    // Connect with MongoDB
    await connect();
    console.log(chalk`{greenBright.italic MongoDB} connected`);

    // Get deviceList from 'Machines.txt' file
    const devices = await readMachineList();
    console.log()
    console.log(chalk`Read Device List from {greenBright.italic 'Machines.txt'}`);
    console.log()
    console.log(chalk`{greenBright [Device List]}`)
    for (let device of devices) {
        console.log(chalk`{greenBright •} ${device.name}`)
    }

    // Create a 'checker' to detect for changes in the device's state
    const deviceStateChecker = new Array(devices.length).fill('INIT');
    const deviceStartTimeChecker = new Array(devices.length).fill(0);

    // Reads CNC data from the device every 'intervalTime'
    console.log()
    console.log(chalk`Get Stream Data every {greenBright.bold ${intervalTime}} second`);
    console.log()
    cron.schedule(`*/${intervalTime} * * * * *`, async () => {
        try {
            // Reads data from devices currently connected to the PC
            const result = await getStreamData(agentUrl);

            // Filter read data by device
            const filteredDevices = filterObject(result, devices);

            for (let i in filteredDevices) {
                let streamData = filteredDevices[i]
                let previousState = deviceStateChecker[i];
                let currentState = filteredDevices[i].state;
                let currentBlock = streamData.Device.Components.path.Events.block || undefined
                let partCount = streamData.Device.Components.path.Events.part_count || undefined
                let targetDevice = streamData.deviceName
                // Initialize runningTime
                streamData.runningTime = 0

                // Generate log message 
                // console.log(chalk`{bold ${targetDevice}: } {yellow [${previousState}] -> [${currentState}]}`)

                const [shouldSave, isStart, isRunning, isFinished, shouldPostMessage] = determineAction(currentState, previousState, currentBlock)
                if (isStart) {
                    deviceStartTimeChecker[i] = streamData.saveTime;
                    console.log(chalk`Machine Start {green.bold [${targetDevice}]}`)
                }

                if (isRunning) {
                    streamData.runningTime = streamData.saveTime - deviceStartTimeChecker[i];
                } 

                
                if (shouldPostMessage) {
                    streamData.runningTime = streamData.saveTime - deviceStartTimeChecker[i];
                    const targetChannel = devices.find(device => {
                        return targetDevice === device.name
                    }).slack_channel;

                    if (targetChannel) {
                        console.log(chalk`Post Message on Channel {green.bold [${targetDevice}]} {yellow [${previousState}] -> [${currentState}]}`)
                        if (streamData.Device.Components) {
                            await postMessage(slackBot, targetChannel, targetDevice, previousState, currentState, partCount, streamData.runningTime, currentBlock)
                        } else {
                            console.log(chalk`{red [Error]} There is no 'Conponents' element in [${targetDevice}] Stream Data`)
                        }
                    } else {
                        console.log(chalk`{red [Error]} There is no Channel for [${targetDevice}]`)
                    }
                }

                if (shouldSave) {
                    await saveStreamData(streamData);
                }
                deviceStateChecker[i] = currentState;
                if(isFinished){
                    streamData.runningTime = 0
                }
            }
        } catch (error) {
            console.error(chalk`{red [Error]} ${error}`);
        }});
}

main();