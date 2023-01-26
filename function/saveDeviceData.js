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
        const deviceModel = mongoose.model(COLLECTION_NAME, deviceSchema);
        const storedData = new deviceModel(device);
        await storedData.save((error) => {
            if (error) {
                throw (error)
            }
        });
    
}