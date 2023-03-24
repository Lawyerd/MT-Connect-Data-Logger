MT Connect Data Logger

MT Connect Data Logger is a Node.js program that connects to CNC machines via the MT_Connect protocol, retrieves data from them, and saves the data to MongoDB. The program can also send messages to Slack when certain events occur.

Prerequisites

Node.js (v14 or later)
MongoDB
A Slack API token
Installation

Clone the repository:
bash
Copy code
git clone https://github.com/your-username/mt-connect-data-logger.git
Install dependencies:
bash
Copy code
cd mt-connect-data-logger
npm install
Configure the program by editing the db/config.js file:
javascript
Copy code
module.exports = {
  agentUrl: 'http://localhost:7878/current',
  mongoPassword: 'your-mongodb-password',
  slackToken: 'your-slack-api-token',
};
Create a Machines.txt file containing a list of devices to connect to, in the following format:
python
Copy code
[
    {
    "adapter": "Fanuc-30i-01",
    "name": "PUMA-700LM",
    "host":"192.168.10.17",
    "slack_channel": "C04V2FN165V"
    },
    {
    "adapter": "Fanuc-0id-01",
    "name": "PUMA-4100M",
    "host":"192.168.10.18",
    "slack_channel": "C04V2FKTY5V"
    }
]
...
name: The name of the device (e.g. "CNC Machine 1")
device_uuid: The UUID of the device (e.g. "00000000-0000-0000-0000-000000000001")
slack_channel: The name of the Slack channel to send messages to when events occur (e.g. "#cnc-machine-1")
Usage

To start the program, run:

bash
Copy code
npm start
The program will connect to the specified devices, retrieve data from them every intervalTime seconds (default is 1 second), and save the data to MongoDB. If any events occur (e.g. the machine starts or stops), the program will send a message to the specified Slack channel.

Acknowledgments

This program uses the following libraries:
mongoose
node-cron
@slack/web-api
chalk
License

This program is licensed under the MIT License.

Contributing

If you find any issues or would like to suggest improvements, please create an issue or a pull request in the repository. We welcome contributions from anyone!
