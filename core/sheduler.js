import schedule from 'node-schedule';
import config from "../config.json" assert {type: "json"};
import { CatchShedulerError } from "./catcherror.js";
import { client } from "../index.js"

import { ClearRaidList } from "../raid/raid.js";

export function InitSheduler() {
	schedule.scheduleJob('0 3 * * *', () => SaveRun(() => ClearRaidList(client)));
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