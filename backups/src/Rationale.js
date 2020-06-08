const { Component } = wp.element;

class Rationale extends Component {
    state = {error: undefined};
    /**
     * handleRationaleObj: cleans the user's rationale and updates state
     * Parameter: e, the user's input
     * Fires: when the user presses 'Enter Rationale'
     */
    handleRationaleObj = (e) => {
        // e is event object
        e.preventDefault();

       const rationale = e.target.elements.rationale.value.trim();
       const error = this.props.handleRationale(rationale);

        this.setState(() => ({error}));
    };
    render() {
        return (
            <div id="rationale">
                <p>You chose: <b>{this.props.choice}</b> <br />
                    The correct answer is: <b>{this.props.levelTitles[this.props.actual]}</b></p>
                {this.state.error && <p>{this.state.error}</p>}
                <form onSubmit={this.handleRationaleObj}>
                    <span>Please explain why this response is <b>{this.props.levelTitles[this.props.actual]}</b>:</span>
                    <textarea name="rationale" cols={40} rows={5} maxLength={1000} required placeholder={"125 words or less"} />
                    <button className="button">Enter Rationale</button>
                </form>
            </div>
        );
    }
}

export default Rationale;