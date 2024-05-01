import React from 'react';
import useTranslations from "../../../i18n/useTranslation";
interface HintsComponentProps {
    hints: string[];
}
const HintsComponent: React.FC<HintsComponentProps> = ({ hints }) => {
    const {t, status} = useTranslations()
    const indexToName = (index: number) => ['hints/region', 'hints/currency', 'hints/capital', 'hints/firstLetter'][index]

    if (status === 'loading') {
        return <p>{t('loading')}</p>;
    }

    return (
        <div className={'w-full px-4'}>
            {hints.map((hint: string, index: number) => (
                <div key={index} className={'flex items-center py-1 shadow-md rounded-lg dark:bg-slate-800 my-1 dark:shadow-slate-900'}>
                    <img className={'ml-2 h-9'} src={indexToName(index) + '.png'} alt={t(indexToName(index))}/>
                    <span className={'pl-2'}>{index === 0 ? t('hints.regions.' + hint) : hint}</span>
                </div>
            ))}
        </div>
    );
};

export default HintsComponent;
