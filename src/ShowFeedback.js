import Radio from '@material-ui/core/Radio';

const { Component } = wp.element;

class ShowFeedback extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.ratings = ["1", "2", "3", "4", "5"];
        this.state = {
            selectedValue: "1"
        };
    };

    handleChange(event) {
        event.preventDefault();

        const choice = event.target.value;
        this.props.handleSelfAssess(choice);
        this.setState(() => {
            return {
                selectedValue: choice
            };
        });
    };

    render() {
        return (
            <div>
                <p>You wrote: <br />
                    {this.props.rationale} <br />
                    The correct reasoning for this case is: <br />
                    {this.props.actual}
                </p>
                <p>Rate how you think your reasoning compares:</p>
                <div>
                <Radio name="1" value="1" 
                    checked={this.state.selectedValue === "1"} onChange={this.handleChange}/> 1
                <Radio name="2" value="2" 
                    checked={this.state.selectedValue === "2"} onChange={this.handleChange}/> 2
                <Radio name="3" value="3" 
                    checked={this.state.selectedValue === "3"} onChange={this.handleChange}/> 3
                <Radio name="4" value="4" 
                    checked={this.state.selectedValue === "4"} onChange={this.handleChange}/> 4
                <Radio name="5" value="5" 
                    checked={this.state.selectedValue === "5"} onChange={this.handleChange}/> 5
                </div>
                <br />
                <br />
                
                <button onClick={this.props.handleNext}>Next</button>
            </div>
        );
    }

};

export default ShowFeedback;