const chalk = require('chalk');


const getDesignedMessage = (deviceName, previousState, currentState, partCount, cycleTime, currentBlock) => {
    let message = `[${deviceName}]가 '${previousState}' 상태에서 '${currentState}' 상태로 변경되었습니다.`
    let blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": deviceName
            }
        },
        {
            "type": "context",
            "elements": [
                {
                    "text": `${previousState} :arrow_right: *${currentState}*`,
                    "type": "mrkdwn"
                }
            ]
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":gear: 가공 부품수: `" + partCount + "`"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":alarm_clock: 싸이클 타임: `" + cycleTime + "`"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":sunflower: 현재 블럭: `" + currentBlock + "`"
            }
        },
        {
            "type": "divider"
        },
    ]


    return [message, blocks]
}

const getFormattedTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${formattedMinutes}m ${formattedSeconds}s`;
}



exports.postMessage = async (slackBot, channel, deviceName, previousState, currentState, partCount, cycleTime, currentBlock) => {
    const [message, blocks] = getDesignedMessage(deviceName, previousState, currentState, partCount, getFormattedTime(cycleTime), currentBlock)
    console.log(getFormattedTime(cycleTime))
    try {
        await slackBot.chat.postMessage({
            channel: channel,
            text: message,
            blocks: blocks
        })
    } catch (error) {
        console.error(chalk`{red [Error]} ${error}`);
    }

}   