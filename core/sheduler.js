import schedule from 'node-schedule';
import { CatchShedulerError } from "./catcherror.js";
import { client } from "../index.js"

import { ClearRaidList } from "../raid/raidMisc.js";

export function InitSheduler() {
	schedule.scheduleJob('0 3 * * *', () => SaveRun(() => ClearRaidList(client)));
}

export function SheduleRaid(messageId, datetime) {
	// shedule raid messaging (time -15 m)
	// shedule raid messaging (time +2 h)
	schedule.scheduleJob('57 9 26 11 *', () => SaveRun(() => console.log(456)));
	console.log(123);
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