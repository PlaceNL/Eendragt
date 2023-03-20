import { PronounsType } from '../Enums/PronounsType';

export default class PronounsConstants {
    public static readonly ROLES: { [key in PronounsType]: string } = {
        hij: process.env.PRONOUNS_HE_ROLE_ID || '',
        zij: process.env.PRONOUNS_SHE_ROLE_ID || '',
        hen: process.env.PRONOUNS_HEN_ROLE_ID || '',
        die: process.env.PRONOUNS_DIE_ROLE_ID || '',
        ask: process.env.PRONOUNS_ASK_ROLE_ID || '',
    };

    public static readonly DESCRIPTION: { [key in PronounsType]: string } = {
        hij: 'Hij/Hem - He/Him',
        zij: 'Zij/Haar - She/Her',
        hen: 'Hen/Hun - They/Them',
        die: 'Die/Diens - They/Them',
        ask: 'Andere voornaamwoorden (vraag) - Other pronouns (ask)'
    };
}