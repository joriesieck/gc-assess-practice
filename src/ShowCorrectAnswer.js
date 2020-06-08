
const ShowCorrectAnswer = (props) => (
    <div>
        <p>You chose: <b>{props.choice}</b> <br />
        The correct answer is: <b>{props.levelTitles[props.actual]}</b></p>
    </div>
);

export default ShowCorrectAnswer;