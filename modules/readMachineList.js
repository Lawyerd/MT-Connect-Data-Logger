const fs = require('fs');
const chalk = require('chalk');
const https = require('https');

exports.readMachineList = () => {
    return new Promise((resolve, reject) => {
      fs.readFile('./db/Machines.txt', 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          try {
            let jsonObjectArray = JSON.parse(data);
            resolve(jsonObjectArray);
          } catch (error) {
            console.error(chalk`{red [Error]} ${error}`);

            reject(error);
          }
        }
      });
    });
  }

exports.readMachineListFromAWS = (plantNumber) => {
    return new Promise((resolve, reject) => {
      const URL = 'https://0zd9p9qiuf.execute-api.ap-northeast-2.amazonaws.com/default/NotionReader?plantNumber=';
      https.get(URL + String(plantNumber), (res) => {
        let data = '';
  
        res.on('data', (chunk) => {
          data += chunk;
        });
  
        res.on('end', () => {
          try {
            const responseData = JSON.parse(data);
            const results = responseData.results;
            const filteredResult = filterMachinelist(results);
            resolve(filteredResult);
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  };

const filterMachinelist = (rawArray) => {
  let machineList = []
    for (let rawMachine of rawArray) {
        let machine = {}
        machine.id = rawMachine.id
        machine.name = rawMachine.properties.name.title[0].text.content
        machine.plant = rawMachine.properties.plant.select.name
        machine.adapter = rawMachine.properties.adapter.rich_text[0].text.content
        machine.host = rawMachine.properties.host.rich_text[0].text.content
        machineList.push(machine)
    }
    if (rawMachine.properties.name.title.length > 0 && rawMachine.properties.plant.select.name.length > 0){
        machineList = machineList.filter(item => item !== "");

    }
    return machineList
}