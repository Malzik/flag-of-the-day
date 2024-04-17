// src/components/Header.tsx
import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import useTranslations from "../../i18n/useTranslation";
import {RootState} from "../../store/store";
import {resetError} from "../../store/action/flag";
import {connect, ConnectedProps} from "react-redux";
const mapStateToProps = (state: RootState) => ({
    error: state.flag.error,
});

const mapDispatchToProps = { resetError};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
const ErrorComponent: React.FC<PropsFromRedux> = ({ error, resetError }) => {
    let navigate = useNavigate();
    const {t} = useTranslations()
    let localError: any = error

    useEffect(() => {
        if (error !== null && !localError) {
            localError = error
        }
    }, [error]);

    const formatError = () => {
        if (localError && localError.statusText) {
            return localError.statusText
        }
        return ''
    }

    console.log(localError)
    return (
        <div>
            <h1>{t('error', {error: formatError()})}</h1>
            <button onClick={() => navigate('/')}>{t('backToMenu')}</button>
        </div>
    )
};

export default connector(ErrorComponent);
