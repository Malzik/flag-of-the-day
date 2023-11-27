// AutocompleteInput.tsx

import React, { useState } from 'react';
import normalizeString from "../../utils/normalize";

interface AutocompleteInputProps {
    options: string[];
    onSelect: (selectedOption: string) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ options, onSelect }) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Filter options based on user input
        const filtered = options.filter(option =>
            normalizeString(option).includes(normalizeString(value.toLowerCase()))
        );
        setFilteredOptions(filtered);

        // Show options if there are matches
        setShowOptions(value.length > 0 && filtered.length > 0);
    };

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter' && filteredOptions.length > 0) {
            handleOptionClick(filteredOptions[0])
        }
    }

    const handleOptionClick = (selectedOption: string) => {
        setInputValue(selectedOption);
        setShowOptions(false);
        onSelect(selectedOption)
        setInputValue("")
    };

    return (
        <div className="autocomplete-container">
            <input
                type="text"
                className={'text-black mt-4 bg-white dark:text-white dark:bg-slate-800 focus:outline-none'}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher..."
                autoFocus
            />

            {showOptions && (
                <ul className="autocomplete-options bg-slate-700 shadow">
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
