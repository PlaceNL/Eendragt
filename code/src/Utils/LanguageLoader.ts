import * as fs from 'fs';

type LangConfig = {
    ROLE_SELECTOR_PLACEHOLDER: string,
    I_WANT_TO_HELP: string,
    ROLE_APPLICATION_ALREADY_SUBMITTED: string,
    SHOW_PROOF_OF_SKILL: string,
    APPLICATION_SENT: string,
    APPLICATION_LETTER: string,
    ROLE_APPLICATIONS_CLOSED: string,
    ROLE_APPLICATION: string,
    ROLE_APPLICATION_OPEN_STATUS: string,
    OPEN: string,
    CLOSED: string
};

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
export default class LanguageLoader {
    public static LangConfig: LangConfig = {
        APPLICATION_LETTER: 'Sollicitatiebrief',
        APPLICATION_SENT: 'Je sollicitatie is verzonden!',
        ROLE_APPLICATION_ALREADY_SUBMITTED: 'Je hebt al een sollicitatie ingediend voor deze rol.',
        SHOW_PROOF_OF_SKILL: 'Link naar iets dat je hebt gemaakt',
        ROLE_SELECTOR_PLACEHOLDER: 'Selecteer een rol',
        I_WANT_TO_HELP: '🌷 Ik wil meehelpen!',
        ROLE_APPLICATIONS_CLOSED: 'Bedankt voor je interesse, maar wij nemen momenteel geen nieuwe {roleName} meer aan.\nHoud de aankondigingen in de gaten om te weten wanneer je weer voor deze rol kan solliciteren.',
        ROLE_APPLICATION: 'Sollicitatie {roleName}',
        ROLE_APPLICATION_OPEN_STATUS: 'De {roleName} sollicitaties zijn nu {status}.',
        OPEN: 'open',
        CLOSED: 'gesloten'
    };
    public static LoadLanguageConfig(languageCode: string) {
        const json = fs.readFileSync(`lang/${languageCode}.json`, 'utf8');
        try {
            const parsedObject: Partial<LangConfig> = JSON.parse(json);
            this.LangConfig = Object.assign(this.LangConfig, parsedObject);
        } catch (e) {
            console.log(e);
        }
    }
}
