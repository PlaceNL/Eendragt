import { EmbedBuilder } from 'discord.js';
import SettingsConstants from "../Constants/SettingsConstants";

export default class AutoplacerEmbeds {

    public static GetNewTemplateEmbed(data: any) {
        const embed = new EmbedBuilder()
            .setTitle('Nieuwe template!')
            .setFooter({text: data.createdAt.replace('T', ' ').replace('Z', '')})
            .setDescription(data.message)
            .setImage(data.images.order)
            .setThumbnail(data.images.priority);

        if (data.creator) {
            embed.setAuthor({name: data.creator.name, iconURL: data.creator.avatarUrl});
        }

        return embed;
    }

    public static GetErrorEmbed(old: number, current: number) {
        return new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.BAD)
            .setTitle('Teveel verkeerde pixels!')
            .setDescription(`Op dit moment zijn er ${current}% correcte pixels geplaatst. Dat is veel meer dan de ${old}% die er even geleden nog waren! Dit kan duiden op een verkeerde template!`);
    }
}
