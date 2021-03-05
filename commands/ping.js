module.exports = {
	name: "ping",
	description: "Shows Latency.",
	execute(message, args, client) {
		message.channel.send(`Latency is \`${Date.now() - message.createdTimestamp}ms\`.\nAPI Ping is \`${client.ws.ping}ms\`.`);
	}
}