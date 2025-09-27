const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stack")
    .setDescription("Please stack in every Fireball after the first one!!!"),
  async execute(interaction) {
    await interaction.reply(
      `
        # Please just stack in every Fireball after the first one, no matter what role you are!!!
        A lot of people try to stay out of the 2nd Fireball stack (roughly 90s in with 2 Hatches and a random Liquid Hell).
        This has the potential to cause unnecessary deaths for no good reason, as you don't need LB3 to survive Nael -> Bahamut transition.
        https://www.youtube.com/watch?v=tZ9negg9TWk
      `
    );
  },
};
