const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('exaflare')
		.setDescription('Responds with the COB Enjoyers certified Kyou Kiri exaflare guide'),
	async execute(interaction) {
		await interaction.reply('Middle dodge Golden exas - https://www.youtube.com/watch?v=ZbrTfoIxRdE');
	},
};