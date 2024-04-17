// src/components/FlagComponent.tsx
import React, {useEffect} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {RootState} from "../../store/store";
import {useNavigate} from "react-router-dom";
import {useLocalStorage} from "../../utils/useLocalStorage";
import useTranslations from "../../i18n/useTranslation";
const mapStateToProps = (state: RootState) => ({
    randomFlags: state.flag.randomFlags,
    answers: state.flag.answers,
    isLoose: state.flag.isLoose,
    loading: state.flag.loading,
});

const mapDispatchToProps = {
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
const today = new Date().toLocaleDateString("en-US");
const LooseComponent: React.FC<PropsFromRedux> = ({ randomFlags, answers,isLoose, loading }) => {
    const navigate = useNavigate()
    const [currentDay] = useLocalStorage('currentDay', '')
    const {t, status} = useTranslations()

    useEffect(() => {
        if (!loading && !isLoose) {
            navigate('/')
            return
        }
    }, [loading, isLoose]);

    const getFlagName = (step: number) => {
        if (currentDay[today] && currentDay[today].guessed && currentDay[today].guessed[step]) {
            return currentDay[today].guessed[step].flagName
        }
        return '?'
    }

    if (status === 'loading' || loading) {
        return (<div>{t('loading')}</div>)
    }

    return (
        <div className={'text-center dark:text-white mt-10 flex flex-col justify-around h-5/6'}>
            <div>
                <h2 className={'font-bold text-4xl flex justify-center'}>
                    {t('looser.title')}
                </h2>
                <span>{t('looser.result', {flags: currentDay[today].guessed ? currentDay[today].guessed.length : 0})}</span>
            </div>
            <div className={'flex justify-center'}>
                {randomFlags.map((flag: string, index) => (
                    <div key={index} className={'w-28 md:mx-2'}>
                        <div className={'h-24'}>
                            <img src={flag}  alt="Flag guessed" key={index} className={'p-1 rounded shadow-xl'}/>
                        </div>
                        <div>{getFlagName(index)}</div>
                    </div>
                ))}
            </div>
            <div className={'mt-10'}>
                <button onClick={() => navigate('/')}>{t('backToMenu')}</button>
            </div>
        </div>
    );
};

export default connector(LooseComponent);
