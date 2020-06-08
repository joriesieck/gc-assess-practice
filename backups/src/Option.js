
const Option = (props) => (
    <button
        onClick={(e) => {
            props.handleChoice(props.optionNum, props.optionText);
        }}>
        {props.optionText}
    </button>
);

export default Option;