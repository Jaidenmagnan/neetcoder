const { Events } = require("discord.js")
const { logMessageDeletion } = require("../events/moderationLog")

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
    if (!message.content.includes("https://x.com")) {
        logMessageDeletion(message);
        }
    },
}