import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const { Component } = wp.element;

class ShowFeedback extends Component {
    state = {selectedValue: "1"};   // Tracks which rating the user has selected
    /**
     * handleChange: updates the radio buttons according to the user's selection
     * Parameter: event, the new button selected
     * Fires: when the user clicks a new radio button
     */
    handleChange = (event) => {
        event.preventDefault(); // Keep the page from refreshing infinitely

        const choice = event.target.value;  // Clean the input
        this.props.handleSelfAssess(choice);    // Call handleSelfAssess from JudgmentApp
        this.setState(() => ({selectedValue: choice}));   // Update state
    };

    render() {
        return (
            <div>
                <p>You wrote: <br />
                    {this.props.rationale} <br /> <br />
                    The gold standard for this case is: <br />
                    {this.props.actual}
                </p>
                <p>Rate how well your rationale matches the gold standard:</p>
                <div>
                <RadioGroup name="rating" value={this.state.selectedValue} onChange={this.handleChange} row>
                    <FormControlLabel
                        value="1"
                        control={<Radio />}
                        label="1 - low match"
                        labelPlacement="bottom"
                    />
                    <FormControlLabel
                        value="2"
                        control={<Radio />}
                        label="2"
                        labelPlacement="bottom"
                    />
                    <FormControlLabel
                        value="3"
                        control={<Radio />}
                        label="3"
                        labelPlacement="bottom"
                    />
                    <FormControlLabel
                        value="4"
                        control={<Radio />}
                        label="4"
                        labelPlacement="bottom"
                    />
                    <FormControlLabel
                        value="5"
                        control={<Radio />}
                        label="5 - high match"
                        labelPlacement="bottom"
                    />
                </RadioGroup>
                </div>
                <br />
                <br />
                
                <button onClick={this.props.handleNext}>Next</button>
            </div>
        );
    }

};

export default ShowFeedback;