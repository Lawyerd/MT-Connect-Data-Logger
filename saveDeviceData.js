const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const deviceSchema = new mongoose.Schema({
    _id: String,
    creationTime: String,
    lastSequence: String,
    Device: Object
});

exports.saveDeviceData = async function saveDeviceData(devices) {
    const deviceNumber = devices.length

    for (let i = 0; i < deviceNumber; i++) {
        const COLLECTION_NAME = devices[i]['Device']['name']
        const deviceModel = mongoose.model(COLLECTION_NAME, deviceSchema);
        const storedData = new deviceModel(devices[i]);
        await storedData.save((error) => {
            if (error) {
                throw (error)
            }
        });
    }
}