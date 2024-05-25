// https://discordjs.guide/additional-info/changes-in-v12.html
import { Client, GatewayIntentBits, Partials, Events } from "discord.js";
import config from "./config.json" assert {type: "json"};
// events
import { Message } from "./discordEvents/message.js";
import { AsyncMessageReactionAdd } from "./discordEvents/messageReactionAdd.js";
import { AsyncMessageReactionRemove } from "./discordEvents/messageReactionRemove.js";
import { InteractionCreate } from "./discordEvents/interactionCreate.js";
// core
import { CommandManager } from "./commands/commandManager.js";
import { InitSheduler } from "./core/sheduler.js";
import { GenerateContents } from "./raid/contents.js";
import { FetchDefaultCatchErrorChannel } from "./core/catcherror.js";
import { LoadAndDeployCommands } from "./commands/slashCommands.js"

export const client = new Client(
	{ 
		allowedMentions: { 
			parse: ['users', 'roles', 'everyone'], 
			repliedUser: true 
		},
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

client.on(Events.ClientReady, async () => {
	client.user.setActivity("Support: horodep");
	config.guilds.forEach(guild_data => {
		var guild = client.guilds.cache.get(guild_data.id);
		guild?.members.fetch();
	});
	
	FetchDefaultCatchErrorChannel(client);
	await InitSheduler();
	GenerateContents();
	CommandManager.Init();
	LoadAndDeployCommands(client);

	console.log("Discord client connected!");
});
client.on(Events.MessageCreate, (_message) => Message(_message));
client.on(Events.MessageReactionAdd, (reaction, user) => AsyncMessageReactionAdd(reaction, user));
client.on(Events.MessageReactionRemove, (reaction, user) => AsyncMessageReactionRemove(reaction, user));
client.on(Events.InteractionCreate, async interaction => InteractionCreate(interaction));