
const ShowFeedback = (props) => {
    return (
        <div>
            <p>You chose: <b>{props.choice}</b> <br />
                The correct level for this case is: <b>{props.actual}</b> <br />
                {props.correctRationale}</p>
            <button onClick={ props.handleNext }>Next</button>
        </div>
    );
};

export default ShowFeedback;