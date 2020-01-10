// exObj imported from php
//   exIds exemplars exGoldLevels

const { Component } = wp.element;
//import './judgmentapp.scss';
import PresentContext from './PresentContext';
import PresentEx from './PresentEx';
import Options from './Options';
import Rationale from './Rationale';
import ShowFeedback from './ShowFeedback';
import ShowEnd from './ShowEnd';

const nTrials = exObj.exIds.length;

class JudgmentApp extends Component {
    constructor( props ) {
        super(props);
        this.handleChoice = this.handleChoice.bind(this);
        this.handleRationale = this.handleRationale.bind(this);
        this.handleSelfAssess = this.handleSelfAssess.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.getCase = this.getCase.bind(this);
        this.saveResults = this.saveResults.bind(this);
        const startDate = Date.now();
        // Tracks various attributes and their changes as the user moves through the trials
        this.state = {
            trial: 1,   // Each judgment is one trial
            exId: exObj.exIds[0],   // The ID of the Exemplar being judged
            choice: null,   // Text of the user's judgment
            choiceNum: 0,   // Number of the user's judgment
            startTime: Math.floor(startDate / 1000),    // UNIX time on page load
            judgTime: 0,    // Time from page load to judgment made, in seconds
            rationStart: 0, // UNIX time on judgment made
            rationTime: 0,  // Time from judgment made to rationale submitted, in seconds
            fbVisible: false,   // Whether the 'ShowFeedback' component should be displayed
            ratVisible: false,  // Whether the 'Rationale' component should be displayed
            scores: [], // An array of the user's scores, where 0 means incorrect and 1 means correct
            accuracy: 0,    // The user's total score, as a decimal
            allDone: false, // Whether the 'ShowEnd' component should be displayed
            rationales: [], // An array of the user's rationales
            selfAssess: 1   // The user's rating of how their rationale matches the gold standard
        };
        // Labels for Exemplar judgments
        this.levelTitles = {
            1: "Less Skilled",
            2: "Proficient",
            3: "Master"
        };
    }

    /**
     * handleChoice: calculates judg_time and correct, updates state
     * Parameters: optionNum, the numerical value of the judgment; option, the text value
     * Fires: when the user clicks a 'judgment' button
     */
    handleChoice(optionNum, option) {
        // Calculate time from task load to option selected
        const endDate = Date.now();
        const endTime = Math.floor(endDate / 1000);
        const judgTime = endTime - this.state.startTime;
        
        // Get the correct answer
        const actualNum = exObj.exGoldLevels[this.state.exId];
        const actual = this.levelTitles[actualNum];

        // Determine whether user was correct
        let correct = 0;
        if ( option === actual ) {
            correct = 1;
        }

        // Update state
        this.setState((prevState) => {
            return {
                choice: option,
                choiceNum: optionNum,
                judgTime: judgTime,
                rationStart: endTime,
                ratVisible: true,
                scores: prevState.scores.concat(correct)
            };
        });
    }

    /**
     * handleRationale: verifies the rationale given by the user, calculates ration_time, and updates state.
     * Parameter: rationale, the user-inputted rationale
     * Fires: when 'Enter Rationale' is clicked
     */
    handleRationale(rationale) {
        // Verify rationale
        if (!rationale) {
            return "Enter a valid rationale";
        }
        else if (rationale.length > 500) {
            return "Trim your rationale down to 500 characters";
        }

        // Calculate time from task load to rationale submitted
        const endDate = Date.now();
        const endTime = Math.floor(endDate / 1000);
        const rationTime = endTime - this.state.rationStart;

        // Update state
        this.setState(prevState => {
            return {
                rationTime: rationTime,
                rationales: prevState.rationales.concat(rationale),
                fbVisible: true,
                ratVisible: false
            };
        });
    }

    /**
     * handleSelfAssess: updates state with the user's self-rating
     * Parameter: choice, the user's rating of how their rationale matches the gold standard
     * Fires: when the user clicks a 'rating' button
     */
    handleSelfAssess(choice) {
        this.setState(() => {
            return {
                selfAssess: choice
            };
        });
    }
    
    /**
     * handleNext: checks whether the user is finished with the current set, saves the current line to
     *      the database, and sets the new startTime
     * Parameters: none
     * Fires: when the user clicks the 'Next' button
     */
    handleNext() {
        // Check whether the user has finished all the trials
        if (this.state.trial < nTrials) {
            this.setState((prevState) => {
                return {
                    trial: prevState.trial + 1
                };
            },
                this.getCase
            );
        } else {
            let response = this.saveResults();
            this.setState(() => {
                return {
                    allDone: true,
                    accuracy: response
                };
            });
        }

        // Save to DB
        jQuery.ajax({
            url : exObj.ajax_url,
            type : 'post',
            data : {
                action : 'save_data',
                trial_num: this.state.trial,
                comp_num: exObj.compNum,
                task_num: exObj.taskNum,
                ex_id: this.state.exId,
                learner_level: this.state.choiceNum,
                gold_level: exObj.exGoldLevels[this.state.exId],
                judg_corr: this.state.scores[this.state.trial-1],
                judg_time: this.state.judgTime,
                learner_rationale: this.state.rationales[this.state.trial-1],
                ration_match: this.state.selfAssess,
                ration_time: this.state.rationTime,
                _ajax_nonce: exObj.nonce
            },
            success : function( response ) {
                    if( !response ) {
                        alert( 'Something went wrong, try logging in!' );
                    }
                }
        });

        // Set new start time
        const newStartDate = Date.now();
        const newStartTime = Math.floor(newStartDate / 1000);
        this.setState(() => {
            return {
                startTime: newStartTime
            };
        })
    }

    /**
     * getCase: gets the new Exemplar ID
     * Parameters: none
     * Fires: inside handleNext
     */
    getCase() {
        this.setState(() => {
            return {
                exId: exObj.exIds[this.state.trial - 1],
                fbVisible: false
            };
        });
    }

    /**
     * saveResults: calls 'gcap_add_scores' from gc-assess-practice.php to calculate the final score for
     *      this set of trials, displays final score
     * Parameters: none
     * Fires: inside handleNext
     */
    saveResults() {
        jQuery.ajax({
            url : exObj.ajax_url,
            type : 'post',
            data : {
                action : 'gcap_add_scores',
                scores: this.state.scores,
                _ajax_nonce: exObj.nonce
            },
            success : function( response ) {
                    if( response ) {
                        jQuery('#final-score').html( 100*response );
                    } else {
                        alert( 'Something went wrong, try logging in!' );
                    }
                }
        });
    }
    
    /**
     * componentDidUpdate: scrolls the webpage so that 'rationale' is in view
     * Parameters: none
     * Fires: after the component changes
     */
    componentDidUpdate() {
        if ( document.getElementById("rationale") ) {
            const elDiv = document.getElementById("rationale");
            elDiv.scrollIntoView();
        }
    }

    /**
     * Renders the components for JudgmentApp
     */
    render() {
        return (
            <div>
                { this.state.allDone && <ShowEnd /> }
                {!this.state.allDone &&
                    <PresentContext 
                        scenario={exObj.sContent}
                        competencies={exObj.cDefinitions}
                        levelTitles={this.levelTitles}
                        sTitle={exObj.sTitle}
                        cTitle={exObj.cTitles[4]}
                    />
                }
                { !this.state.allDone &&
                    <PresentEx
                        exId={ this.state.exId }
                        exemplar={ exObj.exemplars[this.state.exId] }
                    /> }
                { (!this.state.ratVisible && !this.state.fbVisible) &&
                    <Options 
                        handleChoice={this.handleChoice}
                        levelTitles={this.levelTitles}
                    />
                }
                {this.state.ratVisible &&
                    <Rationale
                        choice={ this.state.choice }
                        actual={exObj.exGoldLevels[this.state.exId]}
                        levelTitles={this.levelTitles}
                        handleRationale={this.handleRationale}
                    />
                }
                { (this.state.fbVisible && !this.state.allDone) &&
                    <ShowFeedback
                        rationale={ this.state.rationales[this.state.trial-1] }
                        actual={ exObj.exGoldRationales[this.state.exId] }
                        choice={this.state.selfAssess}
                        handleSelfAssess={this.handleSelfAssess}
                        handleNext={ this.handleNext }
                    />
                }
            </div>
        );
    }
}

export default JudgmentApp;