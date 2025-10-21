import config from "../config.json" assert {type: "json"};

var sandbox;

export function FetchDefaultCatchErrorChannel(client) {
	sandbox = client.channels.cache.get(config.dev_config.sandbox_channel);
}

export function CatchError(e, channel, root) {
	var validChannel = channel ?? sandbox;

	if (typeof (e) == 'string') ShowInfoMessage(e, validChannel, root);
	else if (e.response) ShowHttpError(e, channel, root);
	else ShowErrorWithStack(e, validChannel, root);
}

export function CatchShedulerError(e, client, root) {
	FetchDefaultCatchErrorChannel(client);
	sandbox.send(`This is a shedule code error.`);
	ShowErrorWithStack(e, sandbox, root);
}

function ShowErrorWithStack(e, channel, root) {
	console.error(e);
	channel.send(`<@${config.dev_config.developer}>\nОшибка ${e.name}: ${e.message}\n\n${e.stack}\n\nat ${root}`, { code: 'elixir' });
}

function ShowInfoMessage(e, channel) {
	console.error(e);
	channel.send(e);
}

function ShowHttpError(e, channel) {
	if (e.response.ErrorCode == 1665) return; //DestinyPrivacyRestriction

	console.error(e);
	if (typeof (e.response) == 'string') {
		channel.send(`<@${config.dev_config.developer}>, API вернуло не JSON:\n\`endpoint: ${e.url}\``);
		channel.send(`${e.response}`, { code: 'xml' });
		channel.send(`${e.stack}`, { code: 'elixir' });
	} else {
		channel.send(`Ошибка взаимодействия с API Bungie:\n> Error #${e.response.ErrorCode}: ${e.response.ErrorStatus}\n> ${e.response.Message}`);
	}
}

export function CatchErrorAndDeleteByTimeout(e, channel, timeout) {
	var validChannel = channel ?? sandbox;

	if (typeof (e) == 'string') {
		var line = e;
	}else{
		var line =  "Данное сообщение будет удалено через " + Math.floor(timeout / 1000) + " секунд." +
					"\nПроизошла ошибка " + e.name + ": " + e.message +
					"\nПопробуйте еще раз. Если ошибка повторится, обратитесь к <@" + config.dev_config.developer + "> со скрином ошибки." +
					"\n```js\n" + e.stack + "```";
	}
	validChannel.send(line).then((msg) => {
		setTimeout(() => { msg.delete(); }, timeout);
	});
}

export function CatchRaidError(error, content, channel) {
	var line = 
		error == "Вы не можете создавать рейды." ? 
		"Ошибка сбора рейда: __" + error + "__" : 
		"Ошибка сбора рейда: __" + error + "__" +
		"\nДолжно быть:" +
		"\n```!сбор ДД.ММ ЧЧ:ММ активность, комментарии```" +
		"Вы написали:\n```" + content + "```"

	channel.send(line).then((msg) => {
			setTimeout(() => { msg.delete(); }, 15000);
		});
}