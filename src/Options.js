import Option from './Option';

const Options = (props) => {
    return (
        <div>
            <Option optionText={props.levelTitles[1]}
                    handleChoice={ props.handleChoice }
            />
            <Option optionText={props.levelTitles[2]}
                    handleChoice={ props.handleChoice }
            />
            <Option optionText={props.levelTitles[3]}
                    handleChoice={ props.handleChoice }
            />
        </div>
    );
};

export default Options;