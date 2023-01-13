const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const deviceSchema = new mongoose.Schema({
    _id: String,
    creationTime: String,
    saveTime:Date,
    lastSequence: String,
    state:String,
    instanceId:String,
    Device: Object
});

exports.saveDeviceData = async function saveDeviceData(device) {

        if(device.state =="OFF") return;
        const COLLECTION_NAME = device['Device']['name']
        const deviceModel = mongoose.model(COLLECTION_NAME, deviceSchema);
        const storedData = new deviceModel(device);
        await storedData.save((error) => {
            if (error) {
                throw (error)
            }
        });
    
}