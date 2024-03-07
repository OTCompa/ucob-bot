const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lbgen')
		.setDescription('Responds with the COB Enjoyers certified LB generation infographic'),
	async execute(interaction) {
		await interaction.reply('<https://imgur.com/a/FNTZDGV> (Imgur album)');
	},
};