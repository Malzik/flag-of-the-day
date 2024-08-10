// src/components/Header.tsx
import React, {useEffect, useState} from 'react';
import useDarkSide from "../../utils/useDarkSide";
import {NavLink, useNavigate} from "react-router-dom";
import useTranslations from "../../i18n/useTranslation";
import {useLocalStorage} from "../../utils/useLocalStorage";
import FlameCounter from "../../utils/FlameCounter";
import {RootState} from "../../store/store";
import {getProfile, updateName} from "../../store/action/flag";
import {connect, ConnectedProps} from "react-redux";

const mapStateToProps = (state: RootState) => ({
    id: state.flag.profile?.id,
    streak: state.flag.profile?.streak,
    points: state.flag.profile?.points,
});

const mapDispatchToProps = { getProfile };

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
const Header: React.FC<PropsFromRedux> = ({streak, points, getProfile}) => {
    let navigate = useNavigate();
    const [profile, setProfile] = useLocalStorage('profile', '')
    const {t, init, status} = useTranslations()

    useEffect(() => {
        init(profile.lang)
        if (profile.id && (streak === undefined || points === undefined)) {
            getProfile(profile.id)
        }
    }, [streak, points]);

    if (status === 'loading') {
        return (<div>{t('loading')}</div>)
    }

    return (
        <header className=" bg-blue-300 flex justify-between items-center">
            <div className='flex justify-between px-5 py-4 md:py-6 items-center container mx-auto'>
                <span className={'font-extrabold cursor-pointer'} onClick={() => navigate('/')}>
                {t('home.title')}
                </span>
                <FlameCounter count={streak ?? 0} points={points ?? 0}/>
            </div>
        </header>
    );
};

export default connector(Header);
