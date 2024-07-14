import React, {useEffect, useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

interface EditNameProps {
    name: string;
    setName: (name: string) => void
}

const EditNameComponent: React.FC<EditNameProps> = ({name, setName}) => {
    const [nameInput, setNameInput] = useState(name);

    useEffect(() => {
        setNameInput(name)
    }, [name])
    return (
        <div className="flex items-center border rounded-md focus-within:border-blue-300 focus-within:ring-1">
            <input
                type="text"
                className="py-2 px-4 w-full rounded-l-md border-none focus:outline-none"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
            />
            <button
                className="bg-blue-500 text-white py-2 px-4 rounded-r-md hover:bg-blue-600"
                onClick={() => setName(nameInput)}
            >
                <FontAwesomeIcon icon={faEdit}/>
            </button>
        </div>
    )
};

export default EditNameComponent;
