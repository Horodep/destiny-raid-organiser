import schedule from 'node-schedule';
import { client } from "../index.js"
import { CatchShedulerError } from "./catcherror.js";
import { GetRaidDataFromMessage } from "../raid/raidEmbed.js";
import { InformRaidMembers } from "../raid/raidManagement.js";
import { raidChannels } from "../raid/raidMisc.js"
import { SafeDeleteMessage } from "../core/safedeleting.js";

export function InitSheduler() {
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

	schedule.scheduleJob(message.id + "inform", inform_date, () => SaveRun(() => FetchRaidMembersAndInform(message)));
	schedule.scheduleJob(message.id + "delete", delete_date, () => SaveRun(() => SafeDeleteMessage(message)));
	console.log("События запланированы.");
}

function FetchRaidMembersAndInform(message) {
	var data = GetRaidDataFromMessage(message);
	console.log("Scheduled raid:", data.raidName, "players list:", data.members.join(", "));
	var text = "Активность, в которую вы записались, начнется через 15 минут!";
	InformRaidMembers(data, text, message.guild)
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