const fs = require('fs');
exports.readMachineList = function readMachineList() {
    return new Promise((resolve, reject) => {
        fs.readFile('./db/Machines.txt', 'utf-8', (err, data) => {
            if (err) reject(err);

            let jsonObjectArray = JSON.parse(data);
            resolve(jsonObjectArray);
        });
    });
}
