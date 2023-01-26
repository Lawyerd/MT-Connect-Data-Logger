const fs = require('fs');
// const { resolve } = require('path');
exports.getDevices = function getDevices() {
    return new Promise((resolve, reject) => {
        fs.readFile('./db/DEVICES.txt', 'utf-8', (err, data) => {
            if (err) reject(err);

            let jsonObjectArray = JSON.parse(data);
            resolve(jsonObjectArray);
        });
    });
}