module.exports = {
	name: "ping",
	description: "Show Latency.",
	usage: "+ping",
	execute(message, args, client) {
		message.channel.send(`API Ping is \`${client.ws.ping}ms\`.`);
	}
}