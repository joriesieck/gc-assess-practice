
const divStyle = {
    marginTop: '50px'
};

const PresentEx = (props) => (
    <div style={divStyle}>
        <h2>Case: {props.exId}</h2>

        <p>{props.exemplar}</p>
    </div>
);

export default PresentEx;