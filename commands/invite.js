module.exports = {
	name: "invite",
	description: "Send Link to Invite Oswald.",
	usage: "+invite",
	execute(message, args, Discord, client, config) {
		const embed = new Discord.MessageEmbed();
		embed.setColor("#9999FF")
		.setAuthor("Oswald", client.user.displayAvatarURL())
		.setDescription("Invite Oswald to your Server.")
		.addField("Bot Invite", `[Add the bot to your server](${config.INVITE_URL})`);
		
		message.channel.send(embed);
	}
}