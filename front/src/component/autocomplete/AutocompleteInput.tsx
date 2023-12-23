// AutocompleteInput.tsx

import React, {useEffect, useRef, useState} from 'react';
import normalizeString from "../../utils/normalize";

interface AutocompleteInputProps {
    options: string[];
    onSelect: (selectedOption: string) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ options, onSelect }) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options.sort());
    const listRef = useRef();

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
    }

    const handleOptionClick = (selectedOption: string) => {
        setInputValue(selectedOption);
        onSelect(selectedOption)
        setInputValue("")
        setShowOptions(false);
        setFilteredOptions([])
    };

    // @ts-ignore
    return (<div className="autocomplete-container" ref={listRef}>
            <input
                type="text"
                className={'text-black bg-white dark:text-white dark:bg-slate-800 focus:outline-none'}
                value={inputValue}
                onFocus={() => {
                    if (inputValue.length > 0) setShowOptions(true)
                }}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher..."
                autoFocus
            />

            {showOptions && (
                <ul className="autocomplete-options bg-slate-700 shadow max-h-52 overflow-auto absolute inset-x-1 md:inset-x-96">
                    {filteredOptions.map((option, index) => (
                        <li key={option + index} onClick={() => handleOptionClick(option)}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;
