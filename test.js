const { WebClient } = require('@slack/web-api')
const token = 'xoxb-4790746604496-4752529706471-LvH8nXtbzdysKxDUyv5mgdvA'
const slackBot = new WebClient(token)

const sendMessage = async (message, channel) => {
    try {
      await slackBot.chat.postMessage({
        channel: channel,
        text: message
      })
    } catch (err) {
      console.log(err.message)
    }
  }

sendMessage('hello','C04V2FKTY5V')