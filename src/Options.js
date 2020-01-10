import Option from './Option';

const Options = (props) => (
    <div>
        <Option optionText={props.levelTitles[1]}
                handleChoice={ props.handleChoice }
                optionNum={1}
        />
        <Option optionText={props.levelTitles[2]}
                handleChoice={ props.handleChoice }
                optionNum={2}
        />
        <Option optionText={props.levelTitles[3]}
                handleChoice={ props.handleChoice }
                optionNum={3}
        />
    </div>
);

export default Options;