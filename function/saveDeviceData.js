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


exports.saveDeviceData = async function saveDeviceData(device) {
    const COLLECTION_NAME = device['deviceName']
    const DeviceModel = mongoose.model(COLLECTION_NAME, deviceSchema);
    const deviceModel = new DeviceModel(device);
    try {
        await deviceModel.save();
    } catch (error) {
        throw error;
    }
}