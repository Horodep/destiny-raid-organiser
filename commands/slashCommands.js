import { SlashCommandBuilder, REST, Routes, Collection } from "discord.js";
import config from "../config.json" assert {type: "json"};
import { CreateRaidFromSlashCommand } from "../raid/raidManagement.js";

export async function LoadAndDeployCommands(client) {
    client.commands = new Collection();

    listOfCommands.forEach(command => client.commands.set(command.data.name , command));

    const commands = [];
    for (var [name, command] of client.commands) {
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(config.credentials.discordApiKey);

	const guilds = config.guilds.map(guild => guild.id);


	(async () => {
		try {
			//config.guilds.forEach(async guild_data => {
			//	await rest.put(Routes.applicationGuildCommands(config.credentials.applicationId, guild_data.id), { body: [] })
			//		.then(() => console.log(`Successfully updated application commands for guild ${guild_data.title} (${guild_data.id}).`))
			//		.catch(console.error);
			//});

			//rest.put(Routes.applicationCommands(config.credentials.applicationId), { body: [] })
			//	.then(() => console.log('Successfully deleted all application commands.'))
			//	.catch(console.error);
			
			await rest.put(Routes.applicationCommands(config.credentials.applicationId), { body: commands })
				.then(() => console.log('Successfully created all application commands.'))
				.catch(console.error);
		} catch (error) {
		  	console.error(error);
		}
	})();
}

export const listOfCommands = [
	{
		data: new SlashCommandBuilder()
			.setName('raid')
			.setDescription('Собрать активность на 6 игроков')
			.addStringOption(option => option
				.setName('date')
				.setDescription('Дата рейда (из выпадающего списка или в формате ДД.ММ)')
				.setRequired(true)
				.setAutocomplete(true))
			.addStringOption(option => option
				.setName('time')
				.setDescription('Время рейда по МСК (из выпадающего списка или в формате ЧЧ:ММ)')
				.setRequired(true)
				.setAutocomplete(true))
			.addStringOption(option => option
				.setName('name')
				.setDescription('Название рейда')
				.setRequired(true)
				.addChoices(
					{ name: 'Последнее Желание', value: 'Последнее Желание' },
					{ name: 'Сад Спасения', value: 'Сад Спасения' },
					{ name: 'Склеп Глубокого Камня', value: 'Склеп Глубокого Камня' },
					{ name: 'Хрустальный Чертог', value: 'Хрустальный Чертог' },
					{ name: 'Клятва Послушника', value: 'Клятва Послушника' },
					{ name: 'Гибель Короля', value: 'Гибель Короля' },
					{ name: 'Источник Кошмаров', value: 'Источник Кошмаров' },
					{ name: 'Крах Кроты', value: 'Крах Кроты' },
					{ name: 'Грань Cпасения', value: 'Грань Cпасения' },
					{ name: 'Пески Бесконечности', value: 'Пески Бесконечности' }
				))
			.addStringOption(option => option
				.setName('description')
				.setDescription('Детали сбора'))
			.addStringOption(option => option
				.setName('booking')
				.setDescription('Забронировать место за игроками'))
		,
		async autocomplete(interaction) {
			await autocompleteFunc(interaction)
		}
		,
		async execute(interaction) {
			CreateRaidFromSlashCommand(interaction, 6);
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('dungeon')
			.setDescription('Собрать данж на 3 игроков')
			.addStringOption(option => option
				.setName('date')
				.setDescription('Дата данжа (из выпадающего списка или в формате ДД.ММ)')
				.setRequired(true)
				.setAutocomplete(true))
			.addStringOption(option => option
				.setName('time')
				.setDescription('Время данжа по МСК (из выпадающего списка или в формате ЧЧ:ММ)')
				.setRequired(true)
				.setAutocomplete(true))
			.addStringOption(option => option
				.setName('name')
				.setDescription('Название данжа')
				.setRequired(true)
				.addChoices(
					{ name: 'Расколотый Трон', value: 'Расколотый Трон' },
					{ name: 'Яма Ереси', value: 'Яма Ереси' },
					{ name: 'Откровение', value: 'Откровение' },
					{ name: 'Тиски Алчности', value: 'Тиски Алчности' },
					{ name: 'Дуальность', value: 'Дуальность' },
					{ name: 'Шпиль Хранителя', value: 'Шпиль Хранителя' },
					{ name: 'Призраки Глубин', value: 'Призраки Глубин' },
					{ name: 'Руины Полководца', value: 'Руины Полководца' },
					{ name: 'В гостях на "Веспере"', value: 'В гостях на "Веспере"' },
					{ name: 'Отсеченная Вера', value: 'Отсеченная Вера' }
				))
			.addStringOption(option => option
				.setName('description')
				.setDescription('Детали сбора'))
			.addStringOption(option => option
				.setName('booking')
				.setDescription('Забронировать место за игроками'))
		,
		async autocomplete(interaction) {
			await autocompleteFunc(interaction)
		}
		,
		async execute(interaction) {
			CreateRaidFromSlashCommand(interaction, 3);
		}
	},
	{
		data: new SlashCommandBuilder()
			.setName('activity')
			.setDescription('Собрать активность на N игроков')
			.addStringOption(option => option
				.setName('date')
				.setDescription('Дата активности (из выпадающего списка или в формате ДД.ММ)')
				.setRequired(true)
				.setAutocomplete(true))
			.addStringOption(option => option
				.setName('time')
				.setDescription('Время активности по МСК (из выпадающего списка или в формате ЧЧ:ММ)')
				.setRequired(true)
				.setAutocomplete(true))
			.addStringOption(option => option
				.setName('name')
				.setDescription('Название активности')
				.setRequired(true))
			.addIntegerOption(option => option
				.setName("number-of-places")
				.setDescription('Количество мест')
				.setMinValue(2)
				.setMaxValue(18))
			.addStringOption(option => option
				.setName('description')
				.setDescription('Детали сбора'))
			.addStringOption(option => option
				.setName('booking')
				.setDescription('Забронировать место за игроками'))
		,
		async autocomplete(interaction) {
			await autocompleteFunc(interaction)
		}
		,
		async execute(interaction) {
			CreateRaidFromSlashCommand(interaction, interaction.options.getInteger('number-of-places') ?? 6);
		}
	}
];

async function autocompleteFunc(interaction) {
	const focusedOption = interaction.options.getFocused(true);
	let choices;

	switch (focusedOption.name){
		case 'date':
			choices = ['сегодня', 'завтра', 'послезавтра'];
			break;
		case 'time':
			choices = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
					   '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
			break;
		default:
			choices = [];
			break;
	}

	const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
	await interaction.respond(
		filtered.map(choice => ({ name: choice, value: choice })),
	);
}