import { ChannelType } from "discord.js";
import { LoggingToChannel } from "../core/messaging.js";
import { CatchError } from "../core/catcherror.js";
import { SheduleMessageDelete } from "../core/sheduler.js";
import { CommandManager } from "../commands/commandManager.js";
import { autodeletedChannels } from "../raid/contents.js";

export function Message(message){
	try {
		if (message.author.bot) return;
		
		switch(message.channel.type){
			case ChannelType.GuildText:
				if (!message.content.startsWith("!")) {
					if(autodeletedChannels.includes(message.channel.id))
						SheduleMessageDelete(message);

					return;
				}
		
				console.log(message.member?.displayName ?? message.author.username, message.content);
				LoggingToChannel (message.guild, message.member?.displayName ?? message.author.username, message.content);
				
				var args = message.content.split(' ').filter(item => item);
				var command = CommandManager.FindCommand(args[0]);
				command?.Run(args, message);
				return;
			default:
				return;
		}
	} catch (e) {
		CatchError(e, message.channel);
	}
};