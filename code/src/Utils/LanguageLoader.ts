import * as fs from 'fs';

type LangConfig = {
    ROLE_SELECTOR_PLACEHOLDER: string | null,
    I_WANT_TO_HELP: string | null
};

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
export default class LanguageLoader {
    public static LangConfig: LangConfig = {
        ROLE_SELECTOR_PLACEHOLDER: 'Selecteer een rol',
        I_WANT_TO_HELP: '🌷 Ik wil meehelpen!'
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
