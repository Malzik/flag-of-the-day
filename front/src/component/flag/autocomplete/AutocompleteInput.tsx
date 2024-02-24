// AutocompleteInput.tsx

import React, {useEffect, useRef, useState} from 'react';
import normalizeString from "../../../utils/normalize";
import useTranslations from "../../../i18n/useTranslation";

interface AutocompleteInputProps {
    options: string[];
    onSelect: (selectedOption: string) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ options, onSelect }) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options.sort());
    const listRef = useRef();
    const {t} = useTranslations()

    const handleClickOutside = (event: Event) => {
        // @ts-ignore
        if (listRef.current && !listRef.current.contains(event.target)) {
            setShowOptions(false);
        } else if (!showOptions && inputValue.length > 0) {
            setShowOptions(true)
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [listRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Filter options based on user input
        const filtered = options.filter(option =>
            normalizeString(option).includes(normalizeString(value.toLowerCase()))
        );
        filtered.sort((a: string, b:string) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            const searchLower = value.toLowerCase();

            const aStartsWith = aLower.startsWith(searchLower);
            const bStartsWith = bLower.startsWith(searchLower);

            if (aStartsWith && !bStartsWith) {
                return -1;
            } else if (!aStartsWith && bStartsWith) {
                return 1;
            } else {
                return aLower.localeCompare(bLower);
            }
        })
        setFilteredOptions(filtered);

        setShowOptions(value.length > 0 && filtered.length > 0);
    };

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter' && filteredOptions.length > 0 && inputValue.length > 0) {
            handleOptionClick(filteredOptions[0])
        }

        if (event.key === 'Escape') {
            setShowOptions(false)
        }
    }

    const handleOptionClick = (selectedOption: string) => {
        setInputValue(selectedOption);
        onSelect(selectedOption)
        setInputValue("")
        setShowOptions(false);
        setFilteredOptions([])
    };

    // @ts-ignore
    return (<div ref={listRef} className={'mt-2 w-full md:py-2'}>
            <div className="relative h-10 px-5">
                <input
                    type="text"
                    value={inputValue}
                    onFocus={() => {
                        if (inputValue.length > 0) setShowOptions(true)
                    }}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="w-full h-full bg-transparent dark:bg-slate-800 text-blue-gray-700 focus:outline-none text-sm px-3 py-2 rounded-xl"
                    placeholder={t('game.search')} />
            </div>

            {showOptions && (
                <ul className="autocomplete-options bg-slate-200 dark:bg-slate-700 shadow max-h-52 overflow-auto absolute mx-4 md:w-1/3 w-11/12 rounded-md shadow-md dark:shadow-slate-900">
                    {filteredOptions.map((option, index) => (
                        <li key={option + index} onClick={() => handleOptionClick(option)} className={'mt-0.5'}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;
