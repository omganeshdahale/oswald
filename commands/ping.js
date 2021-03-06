module.exports = {
	name: "ping",
	description: "Shows Latency.",
	execute(message, args, client) {
		message.channel.send(`API Ping is \`${client.ws.ping}ms\`.`);
	}
}