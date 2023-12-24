import {
    createSlice,
    createAsyncThunk,
} from "@reduxjs/toolkit";
import { fetchTranslations } from "./i18nAPI";
import {defaultLang, supportedLang} from "./i18nConfig";

const initialState = {
    status: "loading",
    lang: defaultLang,
    supportedLang: { ...supportedLang },
    translations: {},
};

export const setLangAsync = createAsyncThunk(
    "i18n/setLangAsync",
    async (lang: string, { getState, dispatch }) => {
        // @ts-ignore
        const resolvedLang = lang || getState().i18n.lang;

        const translations = await fetchTranslations(
            resolvedLang,
        );

        dispatch(i18nSlice.actions.setLang(resolvedLang));

        return translations;
    },
);

export const i18nSlice = createSlice({
    name: "i18n",
    initialState,
    reducers: {
        setLang: (state, action) => {
            state.lang = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(setLangAsync.pending, (state) => {
            state.status = "loading";
        });

        builder.addCase(
            setLangAsync.fulfilled,
            (state, action) => {
                // @ts-ignore
                state.translations = action.payload;
                state.status = "idle";
            },
        );
    },
});

export default i18nSlice.reducer;
