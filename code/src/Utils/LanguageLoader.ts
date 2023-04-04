import * as fs from 'fs';

type LangConfig = {
    ROLE_SELECT_PLACEHOLDER: string,
    I_WANT_TO_HELP: string
};

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
class LanguageLoader {
    public static LangConfig: LangConfig = {
        ROLE_SELECT_PLACEHOLDER: 'Selecteer een rol',
        I_WANT_TO_HELP: '🌷 Ik wil meehelpen!'
    };
    public static LoadLanguageConfig(languageCode: string) {
        const json = fs.readFileSync(`lang/${languageCode}`, 'utf8');
        const parsedObject: Partial<LangConfig> = JSON.parse(json);
        this.LangConfig = Object.assign(this.LangConfig, parsedObject);
    }
}