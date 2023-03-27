const chalk = require('chalk');
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const deviceSchema = new mongoose.Schema({
    _id: String,
    deviceName:String,
    creationTime: Date,
    saveTime:Date,
    runningTime:Date,
    lastSequence: Number,
    state:String,
    instanceId:Number,
    Device: Object
});


exports.saveStreamData = async (streamData) => {
    const COLLECTION_NAME = streamData['deviceName']
    const DeviceModel = mongoose.model(COLLECTION_NAME, deviceSchema);
    const deviceModel = new DeviceModel(streamData);
    try {
        await deviceModel.save();
    } catch (error) {
        console.error(chalk`{red [Error]} ${error}`);

        throw error;
    }
}