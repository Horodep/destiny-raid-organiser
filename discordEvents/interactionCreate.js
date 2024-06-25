import { InteractionType } from "discord.js";
import { CatchError } from "../core/catcherror.js";

export async function InteractionCreate(interaction){
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		if (interaction.isChatInputCommand())
		{
			console.log(
				interaction.member?.displayName ?? interaction.user.username, 
				"/"+interaction.commandName, 
				interaction.options.data.map(o => o.name + ":" + o.value).join(" "));
				
			await command.execute(interaction);
		}
		else if(interaction.type == InteractionType.ApplicationCommandAutocomplete)
		{
			await command.autocomplete(interaction);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: `Ошибка: ${error}`, ephemeral: true });
	}
};