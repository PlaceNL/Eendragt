import * as fs from 'fs';

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
class LanguageLoader {
    public static LangConfig = {
        ROLE_SELECT_PLACEHOLDER: '',
    };
    public static LoadLanguageConfig(languageCode: string) {
        const json = fs.readFileSync(`lang/${languageCode}`, 'utf8');
        this.LangConfig = JSON.parse(json);
    }
}