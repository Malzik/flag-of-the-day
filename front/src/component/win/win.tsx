import React, {useEffect} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {RootState} from "../../store/store";
import {useNavigate} from "react-router-dom";
import {useLocalStorage} from "../../utils/useLocalStorage";
import ConfettiExplosion from "react-confetti-explosion";

const mapStateToProps = (state: RootState) => ({
    randomFlags: state.flag.randomFlags,
    answers: state.flag.answers
});

const mapDispatchToProps = {
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
const today = new Date().toLocaleDateString("en-US");
const WinComponent: React.FC<PropsFromRedux> = ({ randomFlags, answers }) => {
    const navigate = useNavigate()
    const [currentDay] = useLocalStorage('currentDay', '')

    useEffect(() => {
        if (!currentDay[today] || !currentDay[today].additionalInfo || !currentDay[today].additionalInfo.win) {
            navigate('/')
            return
        }
    }, []);

    if (!currentDay[today] || !currentDay[today].additionalInfo || !currentDay[today].additionalInfo.win) {
        return (<div></div>)
    }

    const getFlagName = (step: number) => {
        if (currentDay[today] && currentDay[today].guessed[step]) {
            return currentDay[today].guessed[step].flagName
        }
        return '?'
    }

    return (
        <>
            <ConfettiExplosion />
            <div className={'text-center dark:text-white mt-10 flex flex-col justify-around h-5/6'}>
                <div>
                    <h2 className={'font-bold text-4xl flex justify-center'}>
                        <img src="coupe.svg" alt="Coupe" className={'w-8 color-[#FCDC12]'}/>VICTOIRE<img src="coupe.svg" alt="Coupe" className={'w-8'}/>
                    </h2>
                </div>
                <div className={'flex justify-center'}>
                    {randomFlags.map((flag: any, index) => (
                        <div key={index}>
                            <div className={'h-24 w-28'}>
                                <img src={flag}  alt="Flag guessed" className={'p-1 rounded shadow-xl'}/>
                            </div>
                            <div>{getFlagName(index)}</div>
                        </div>
                    ))}
                </div>
                <div className={'mt-10'}>
                    <button onClick={() => navigate('/')}>Retour au menu</button>
                </div>
            </div>
        </>
    );
};

export default connector(WinComponent);
