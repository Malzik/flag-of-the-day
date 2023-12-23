// src/components/FlagComponent.tsx
import React, {useEffect} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {RootState} from "../../store/store";
import {useNavigate} from "react-router-dom";
import {useLocalStorage} from "../../utils/useLocalStorage";
const mapStateToProps = (state: RootState) => ({
    randomFlags: state.flag.randomFlags,
    answers: state.flag.answers
});

const mapDispatchToProps = {
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
const today = new Date().toLocaleDateString("en-US");
const LooseComponent: React.FC<PropsFromRedux> = ({ randomFlags, answers }) => {
    const navigate = useNavigate()
    const [currentDay, setCurrentDay] = useLocalStorage('currentDay', '')
    const [profile, setProfile] = useLocalStorage('profile', '')

    useEffect(() => {
        if (!currentDay[today] || !currentDay[today].additionalInfo || !currentDay[today].additionalInfo.loose) {
            navigate('/')
            return
        }
        setProfile({...profile, streak: 0})
    }, []);

    const getFlagName = (step: number) => {
        if (currentDay[today] && currentDay[today].guessed && currentDay[today].guessed[step]) {
            return currentDay[today].guessed[step].flagName
        }
        return '?'
    }

    if (!currentDay[today] || !currentDay[today].additionalInfo || !currentDay[today].additionalInfo.loose) {
        return (<div></div>)
    }

    return (
        <div className={'text-center dark:text-white mt-10 flex flex-col justify-around h-5/6'}>
            <div>
                <h2 className={'font-bold text-4xl flex justify-center'}>
                    DEFAITE
                </h2>
                <span>Vous avez trouvez {currentDay[today].guessed ? currentDay[today].guessed.length : 0} drapeaux sur 3</span>
            </div>
            <div className={'flex justify-center'}>
                {randomFlags.map((flag: string, index) => (
                    <div key={index}>
                        <div className={'h-24 w-28'}>
                            <img src={flag}  alt="Flag guessed" key={index} className={'p-1 rounded shadow-xl'}/>
                        </div>
                        <div>{getFlagName(index)}</div>
                    </div>
                ))}
            </div>
            <div className={'mt-10'}>
                <button onClick={() => navigate('/')}>Retour au menu</button>
            </div>
        </div>
    );
};

export default connector(LooseComponent);
