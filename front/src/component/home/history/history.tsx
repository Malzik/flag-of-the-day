import React from 'react';
import useTranslations from "../../../i18n/useTranslation";
import {History} from "../../../store/model/flag";
interface HistoryComponentProps {
    history: History;
}
const HistoryComponent: React.FC<HistoryComponentProps> = ({ history }) => {
    const {t, status} = useTranslations()

    if (status === 'loading') {
        return <p>{t('loading')}</p>;
    }

    return (
        <div className='bg-white dark:bg-slate-500 rounded-md shadow-md'>
            <div className="relative flex justify-center items-center w-full">
                <span
                    className="text-center flex-grow">{history.result == 'WIN' ? t('home.win') : t('home.loose')}</span>
                { history.points > 0 &&
                    <span className="absolute right-5 text-sm text-green-600 font-bold">{t('home.points', {points: history.points})}</span>
                }
            </div>


            <div className='flex justify-evenly md:justify-center gap-2 lg:gap-5 py-2.5'>
                {history.flags.map((flag, key) => (
                    <figure key={key}>
                        <img src={flag.flag} alt="French flag" className={`rounded h-12 aspect-video`}/>
                        <p className='text-sm'>
                            { flag.tries === 1
                                ? t('home.try', { tries: flag.tries})
                                : t('home.tries', { tries: flag.tries})
                            }
                        </p>
                    </figure>
                ))}
            </div>
        </div>
    );
};

export default HistoryComponent;
