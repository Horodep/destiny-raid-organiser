import schedule from 'node-schedule';
import { client } from "../index.js"
import { CatchShedulerError } from "./catcherror.js";
import { GetRaidDataFromMessage } from "../raid/raidEmbed.js";
import { InformRaidMembers } from "../raid/raidManagement.js";
import { raidChannels, raidDataArray, CheckAndUpdateContentMessage } from "../raid/contents.js"
import { SafeDeleteMessage } from "../core/safedeleting.js";

export async function InitSheduler() {
	for (var job in schedule.scheduledJobs)
		schedule.cancelJob(job);

	for (var id of raidChannels) {
		raidDataArray[id] = [];
		var raid_channel = GetChannel(id);
		var messages = await raid_channel?.messages.fetch({ limit: 100 });
		
		if (messages == undefined)
			continue;
		
		for (var kvp of messages) {
			var msg = kvp[1];
			try{
				if (msg.client.user.id != msg.author.id) continue;

				var data = GetRaidDataFromMessage(msg);
				raidDataArray[id].push(data);
				SheduleRaid(data, msg);
			}catch(e){
				if(e != "Сообщение не распознано как рейд.")
					CatchShedulerError(e, client);
			}
		}
	}
}

export function SheduleRaid(data, message) {
	console.log(data.date, data.header);
	var inform_date = new Date(data.date.getTime() - 15 * 60 * 1000);
	var delete_date = new Date(data.date.getTime() + 2 * 60 * 60 * 1000);

	schedule.scheduleJob(message.id + "inform", inform_date, () => SaveRun(() => FetchRaidMembersAndInform(message.channel, message.id)));
	schedule.scheduleJob(message.id + "delete", delete_date, () => SaveRun(() => SafeDeleteMessage(message)));
	schedule.scheduleJob(message.id + "startd", delete_date, () => SaveRun(() => CheckAndUpdateContentMessage(message.channel.id)));
	console.log("События запланированы.");
}

function FetchRaidMembersAndInform(channel, messageId) {
	channel.messages.fetch(messageId)
		.then(message => {
			var data = GetRaidDataFromMessage(message);
			console.log("Scheduled raid:", data.raidName, "players list:", data.members.join(", "));
			var text = "Активность, в которую вы записались, начнется через 15 минут!";
			InformRaidMembers(data, text, message.guild);
		})
		.catch(console.error);
}

export function CancelSheduledRaid(message) {
	schedule.scheduledJobs[message.id + "inform"]?.cancel();
	schedule.scheduledJobs[message.id + "delete"]?.cancel();
	schedule.scheduledJobs[message.id + "startd"]?.cancel();
	console.log("События отменены.");
}

async function SaveRun(callback) {
	try {
		await callback();
	} catch (e) {
		CatchShedulerError(e, client);
	}
}

export function GetChannel(id) {
	return client.channels.cache.get(id);
}

export function GetGuild(id) {
	return client.guilds.cache.get(id);
}