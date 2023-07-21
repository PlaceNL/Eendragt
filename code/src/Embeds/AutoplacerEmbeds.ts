import { EmbedBuilder } from 'discord.js';

export default class AutoplacerEmbeds {

    public static GetNewTemplateEmbed(data: any) {
        const embed = new EmbedBuilder()
            .setTitle('Nieuwe template!')
            .setFooter({text: data.createdAt.replace('T', ' ').replace('Z', '')})
            .setImage(data.images.order)
            .setThumbnail(data.images.priority);

        if (data.creator) {
            embed.setAuthor({name: data.creator.name, iconURL: data.creator.avatarUrl});
        }

        return embed;
    }
}