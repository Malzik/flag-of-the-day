// src/components/FlagComponent.tsx
import React, {useEffect, useState} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import store, {RootState} from "../../store/store";
import {useNavigate} from "react-router-dom";
import {useLocalStorage} from "../../utils/useLocalStorage";
import {fetchFlags, getFlagOfTheDay} from "../../store/action/flag";
import FlameCounter from "../../utils/FlameCounter";
const mapStateToProps = (state: RootState) => ({
    maxStep: state.flag.maxStep,
});

const mapDispatchToProps = {
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export async function loader() {
    return setTimeout(() => {
        // @ts-ignore
        store.dispatch(fetchFlags())
        // @ts-ignore
        store.dispatch(getFlagOfTheDay())
    }, 1500)
}

const today = new Date().toLocaleDateString("en-US");
const HomeComponent: React.FC<PropsFromRedux> = ({ maxStep }) => {
    let navigate = useNavigate();
    const [profile, setProfile] = useLocalStorage('profile', '')
    const [currentLang, setCurrentLang] = useState('fr')

    useEffect(() => {
        if (!profile.streak) {
            setProfile({...profile, streak: 0})
        }
    }, []);

    return (
        <div className={'w-full text-center text-black dark:text-white pt-6'}>
            <div className={'font-extrabold text-4xl'}>
                FLAG OF THE DAY
            </div>
            <div className={'mt-36 flex justify-center text-2xl text-black'}>
                <div className={'flex hover:shadow-inner hover:shadow-2xl dark:bg-slate-100 rounded'}>
                    <button onClick={()=> navigate("/game")} className={'p-6 rounded-l-lg border border-black dark:border-slate-300 font-semibold'}>
                        Drapeaux du jour
                    </button>
                    <div className={'p-2 rounded-r-lg border border-black dark:border-slate-300'}>
                        <FlameCounter count={profile.streak ?? 0}></FlameCounter>
                    </div>
                </div>
            </div>
            <div className={'flex mt-12 justify-center items-center'}>
                <div><img src="https://flagcdn.com/fr.svg" alt="French flag" className={`px-2 rounded ${currentLang == 'fr' ? "w-14" : "w-10"}`} onClick={() => setCurrentLang('fr')}/></div>
                <div><img src="https://flagcdn.com/gb.svg" alt="UK flag" className={`px-2 rounded grayscale  w-10 ${currentLang == 'en' ? "w-14" : "w-10"}`}/></div>
            </div>
        </div>
    );
};

export default connector(HomeComponent);
