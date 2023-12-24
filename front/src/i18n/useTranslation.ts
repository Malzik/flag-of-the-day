import { useSelector, useDispatch } from "react-redux";
import { setLangAsync } from "./i18nSlice";

export default function useTranslations() {
    const dispatch = useDispatch();

    const translations = useSelector((state: any) => state.i18n.translations);
    const t = (key: string, params?: any) => {
        let translation = ''
        try {
            translation = key.split('.').reduce((obj, key) => obj[key], translations)
            if (params) {
                Object.keys(params).forEach((param) => {
                    translation = translation.replace(`{${param}}`, params[param])
                })
            }
            return translation
        } catch (e) {
            console.error('Translation not found for key: ', key)
            return key
        }
    }
    // @ts-ignore
    const setLang = (lang: string) => dispatch(setLangAsync(lang));
    const lang = useSelector((state: any) => state.i18n.lang);
    const supportedLang = useSelector(
        (state: any) => state.i18n.supportedLang,
    );
    const status = useSelector((state: any) => state.i18n.status);

    return {
        t,
        lang,
        setLang,
        init: setLang,
        supportedLang,
        status,
    };
}
