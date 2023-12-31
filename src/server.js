require('dotenv').config();
const mongoose = require('mongoose');

const {
    Client,
    IntentsBitField
} = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});


(async () => {
    try {
        // await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Server 🤖 ...")


        eventHandler(client);

        client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error(error);
    }

})();