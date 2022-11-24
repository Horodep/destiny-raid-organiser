// https://discordjs.guide/additional-info/changes-in-v12.html
import { Client, GatewayIntentBits, Partials, Events } from "discord.js";
import config from "./config.json" assert {type: "json"};
// events
import { Message } from "./discordEvents/message.js";
import { AsyncMessageReactionAdd } from "./discordEvents/messageReactionAdd.js";
import { AsyncMessageReactionRemove } from "./discordEvents/messageReactionRemove.js";
// core
import { CommandManager } from "./commands/commandManager.js";
import { InitSheduler } from "./core/sheduler.js";
import { FetchDefaultCatchErrorChannel } from "./core/catcherror.js";

export const client = new Client(
	{ 
		partials: [
			Partials.User,
			Partials.Message, 
			Partials.Channel, 
			Partials.Reaction
		], 
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessageReactions
		] 
	});

client.login(config.credentials.discordApiKey);

client.on(Events.ClientReady, () => {
	client.user.setActivity("Support: Horodep#2567");
	var guild = client.guilds.cache.get(config.guilds.operational[0]);
	guild.members.fetch();
	
	FetchDefaultCatchErrorChannel(client);
	InitSheduler();
	CommandManager.Init();

	console.log("Discord client connected!");
});
client.on(Events.MessageCreate, (_message) => Message(_message));
client.on(Events.MessageReactionAdd, (reaction, user) => AsyncMessageReactionAdd(reaction, user));
client.on(Events.MessageReactionRemove, (reaction, user) => AsyncMessageReactionRemove(reaction, user));
