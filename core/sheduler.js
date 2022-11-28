import schedule from 'node-schedule';
import config from "../config.json" assert {type: "json"};
import { client } from "../index.js"
import { CatchShedulerError } from "./catcherror.js";
import { GetRaidDataFromMessage } from "../raid/raidEmbed.js";
import { InformRaidMembers } from "../raid/raidManagement.js";

export function InitSheduler() {
	const raidChannels = config.guilds.map(guild => guild.raids);
	raidChannels.forEach(id => {
		var raid_channel = GetChannel(id);
		raid_channel?.messages.fetch({ limit: 100 }).then(messages => {
			messages.sort((a, b) => a.id > b.id ? 1 : -1).forEach(msg => {
				try{
					if (msg.client.user.id != msg.author.id) return;
					var data = GetRaidDataFromMessage(msg);
					SheduleRaid(data, msg);
				}catch(e){
					if(e != "Сообщение не распознано как рейд.")
						CatchShedulerError(e, client);
				}
			});
		}).catch(e => {
			console.error(`Error on sheduler raid messages fetch: ${e.name}: ${e.message}: ${id} (${raid_channel?.name})`);
		});
	})
	
}

export function SheduleRaid(data, message) {
	console.log(data.date, data.header);
	var inform_date = new Date(data.date.getTime() - 15 * 60 * 1000);
	var delete_date = new Date(data.date.getTime() + 2 * 60 * 60 * 1000);

	var text = "Рейд, в который вы записались, начнется через 15 минут!";
	schedule.scheduleJob(message.id + "inform", inform_date, () => SaveRun(() => InformRaidMembers(data, text, message.guild)));
	schedule.scheduleJob(message.id + "delete", delete_date, () => SaveRun(() => message.delete()));
	console.log("События запланированы.");
}

export function CancelSheduledRaid(message) {
	schedule.scheduledJobs[message.id + "inform"]?.cancel();
	schedule.scheduledJobs[message.id + "delete"]?.cancel();
	console.log("События отменены.");
}

async function SaveRun(callback) {
	try {
		await callback();
	} catch (e) {
		CatchShedulerError(e, client);
	}
}

function GetChannel(id) {
	return client.channels.cache.get(id);
}

function GetGuild(id) {
	return client.guilds.cache.get(id);
}