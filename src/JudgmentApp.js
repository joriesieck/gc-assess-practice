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
        this.state = {
            trial: 1,
            exId: exObj.exIds[0],
            choice: null,
            choiceNum: 0,
            startTime: Math.floor(startDate / 1000),
            totalTime: 0,
            fbVisible: false,
            ratVisible: false,
            scores: [],
            accuracy: 0,
            allDone: false,
            rationales: [],
            selfAssess: 1
        };
        this.levelTitles = {
            1: "Less Skilled",
            2: "Proficient",
            3: "Master"
        };
    }

    handleChoice(optionNum, option) {
        // Calculate time from task load to option selected
        const endDate = Date.now();
        const endTime = Math.floor(endDate / 1000);
        const totalTime = endTime - this.state.startTime;
        //console.log(totalTime);
        
        // Get the correct answer
        const actualNum = exObj.exGoldLevels[this.state.exId];
        const actual = this.levelTitles[actualNum];

        // Determine whether user was correct
        let correct = 0;
        //console.log(this.levelTitles[actualNum]);
        if ( option === actual ) {
            correct = 1;
        }

        // Update state
        this.setState((prevState) => {
            return {
                choice: option,
                choiceNum: optionNum,
                totalTime: totalTime,
                ratVisible: true,
                scores: prevState.scores.concat(correct)
            };
        });
    }


    handleRationale(rationale) {
        if (!rationale) {
            return "Enter a valid rationale";
        }
        else if (rationale.length > 500) {
            return "Trim your rationale down to 500 characters";
        }
        this.setState(prevState => {
            return {
                rationales: prevState.rationales.concat(rationale),
                fbVisible: true,
                ratVisible: false
            };
        });
//console.log(rationale.length);
    }

    handleSelfAssess(choice) {
        this.setState(() => {
            return {
                selfAssess: choice
            };
        });
    }
    
    handleNext() {
        if (this.state.trial < nTrials) {
            this.setState((prevState) => {
                return {
                    trial: prevState.trial + 1
                    //selfAssess: choice
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
                    //selfAssess: choice
                };
            });
            // alert("All done");
        }
        
        //console.log(this.state.totalTime);
        // save to DB
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
                judg_time: this.state.totalTime,
                learner_rationale: this.state.rationales[this.state.trial-1],
                learner_self_assess: this.state.selfAssess,
                _ajax_nonce: exObj.nonce
            },
            success : function( response ) {
                    if( !response ) {
                        alert( 'Something went wrong, try logging in!' );
                    }
                }
        });

        // set new start time
        const newStartDate = Date.now();
        const newStartTime = Math.floor(newStartDate / 1000);
        this.setState(() => {
            return {
                startTime: newStartTime
            };
        })
    }

    getCase() {
        this.setState(() => {
            return {
                exId: exObj.exIds[this.state.trial - 1],
                fbVisible: false
            };
        });
    }

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
                        // alert( 'Your score is: ' + response );
                        jQuery('#final-score').html( 100*response );
                    } else {
                        alert( 'Something went wrong, try logging in!' );
                    }
                }
        });
    }
    componentDidUpdate() {
        if ( document.getElementById("rationale") ) {
            const elDiv = document.getElementById("rationale");
            elDiv.scrollIntoView();
        }
    }
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