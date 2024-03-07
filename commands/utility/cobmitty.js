const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cobmitty')
		.setDescription('Responds with the COB Enjoyers certified COBMitty'),
	async execute(interaction) {
		await interaction.reply('COBMitty - https://tinyurl.com/cobmitty');
	},
};