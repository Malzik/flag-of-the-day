const defaultButtonClass = "bg-blue-500 border-b-[1px] border-blue-400 h-16 [box-shadow:0_10px_0_0_#1b6ff8,0_15px_0_0_#1b70f841] active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841] mb-6"
export function Button({label, onClick, element, width, disabled = false, buttonClass = defaultButtonClass, labelClass = "text-white"}:
                           {label?:string, onClick: () => void, element?: JSX.Element, width?: string, disabled?: boolean, buttonClass?: string, labelClass?: string}) {
    const style = width ?? 'w-48'
    buttonClass = disabled ? 'h-16 bg-gray-300 px-4 py-2 rounded-md cursor-not-allowed opacity-50' : buttonClass

    return (
        <button
            onClick={onClick}
            className={`button rounded-lg cursor-pointer select-none
            active:translate-y-2 
            active:border-b-[0px] transition-all duration-150 
              ${style} ${buttonClass}`}
            disabled={disabled}
        >
            {label !== undefined ? <span
                className={`flex flex-col justify-center items-center h-full font-bold text-lg ${labelClass}`}>{label}</span> : ''}
            {element !== undefined ? element : ''}
        </button>
    );
}
