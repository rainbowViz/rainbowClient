import {
    Breadcrumb,
    Button,
    ControlGroup,
    Icon,
} from '@blueprintjs/core'
import * as React from 'react'
import {connect} from 'react-redux'
import {
    TransitionGroup,
    CSSTransition,
} from 'react-transition-group'

// Import custom actions
import {
    downvoteCurrentSuggestion,
    nextSuggestion,
    previousSuggestion,
    updateSelectedYear,
    upvoteCurrentSuggestion,
} from '../actions/verification'

// Import custom components
import StringSelect from '../components/selects/stringSelect'
import PlfPath from '../components/plfPath'

// Import mock data
import {
    inputNode,
    saleNode,
} from '../mockdata/verification'

// Import custom types
import {
    IVerificationView,
} from '../types'

// Link redux state to current component's react props
// which will now be notified when changes occur in redux state
const reduxify = (mapReduxStateToReactProps: any, mapDispatchToProps?: any, mergeProps?: any, options?: any) => {
    return (target: any) => (connect(mapReduxStateToReactProps, mapDispatchToProps, mergeProps, options)(target) as any)
}

// Describe how redux state should be mapped to props
const mapReduxStateToReactProps = (state : IVerificationView): IVerificationView => {
    return state
}

@reduxify(mapReduxStateToReactProps)
export default class VerificationView extends React.Component<IVerificationView, any> {
    public componentDidMount() {
        // TODO: should fetch data
        this.props.dispatch(updateSelectedYear('2012'))

        document.addEventListener("keydown", this.handleKeyPress, false)
    }

    public componentWillUnmount(){
        document.removeEventListener("keydown", this.handleKeyPress, false)
    }

    public handleKeyPress = (event: any) => {
        console.log(event.key)
        switch (event.key) {
            case 'ArrowRight':
                this.props.dispatch(nextSuggestion('next'))
                break

            case 'ArrowLeft':
                this.props.dispatch(previousSuggestion())
                break

            case 'ArrowDown':
                this.props.dispatch(downvoteCurrentSuggestion())
                break

            case 'ArrowUp':
                this.props.dispatch(upvoteCurrentSuggestion())
                break

            default:
                return
        }
    }

    private clickPreviousSuggestion = () => {
        this.props.dispatch(previousSuggestion())
    }

    private clickDownvoteSuggestion = () => {
        this.props.dispatch(downvoteCurrentSuggestion())
    }

    private clickUpvoteSuggestion = () => {
        this.props.dispatch(upvoteCurrentSuggestion())
    }

    private clickNextSuggestion = () => {
        this.props.dispatch(nextSuggestion('next'))
    }

    public render () {
        let {
            dispatch,
            verification,
        } = this.props

        let {
            sourceExit,
            targetExit,
            availableYears,
            currentSuggestion,
            selectedYear,
            suggestionList,
            sourcePlf,
            targetPlf,
        } = verification

        let sourceNodePath = sourcePlf[suggestionList[currentSuggestion].source_id]
        let targetNodePath = targetPlf[suggestionList[currentSuggestion].target_id]

        return (
            <div id='main-verification-container'>
                <StringSelect
                    inputItem={selectedYear}
                    items={availableYears}
                    icon={'calendar'}
                    onChange={updateSelectedYear}
                    dispatch={dispatch}
                />
                <ControlGroup id='choice-buttons'>
                    <Button
                        icon={'chevron-left'}
                        onClick={this.clickPreviousSuggestion}
                    />
                    <Button
                        icon={'cross'}
                        intent={'danger'}
                        onClick={this.clickDownvoteSuggestion}
                    />
                    <Button
                        icon={'tick'}
                        intent={'success'}
                        onClick={this.clickUpvoteSuggestion}
                    />
                    <Button
                        icon={'chevron-right'}
                        onClick={this.clickNextSuggestion}
                    />
                </ControlGroup>
                <div className='input-columns'>
                    <div className='year'>{selectedYear}</div>
                    <div className='plf-paths'>
                        <TransitionGroup
                            // Allows to change classNames before
                            // component is unmounted
                            childFactory={(child: any): any => {
                                return React.cloneElement(child, {
                                    classNames: {
                                        enter: 'plf-path-enter',
                                        enterActive: 'plf-path-enter-active',
                                        exit: `${sourceExit}-exit`,
                                        exitActive: `${sourceExit}-exit-active`,
                                    }
                                })
                            }}
                        >
                            {[sourceNodePath].map((item: any) => {
                                return <CSSTransition
                                    key={item}
                                    timeout={300}
                                    classNames={{
                                        enter: 'plf-path-enter',
                                        enterActive: 'plf-path-enter-active',
                                        exit: `${sourceExit}-exit`,
                                        exitActive: `${sourceExit}-exit-active`,
                                    }}
                                >
                                    <PlfPath
                                        path={item}
                                    />
                                </CSSTransition>
                            })}
                        </TransitionGroup>
                    </div>
                </div>
                <Icon className='linking-arrow' icon='arrow-down' />
                <div className='input-columns'>
                    <div className='year'>{Number(selectedYear) + 1}</div>
                    <div className='plf-paths'>
                        <TransitionGroup
                            childFactory={(child: any): any => {
                                return React.cloneElement(child, {
                                    classNames: {
                                        enter: 'plf-path-enter',
                                        enterActive: 'plf-path-enter-active',
                                        exit: `${targetExit}-exit`,
                                        exitActive: `${targetExit}-exit-active`,
                                    }
                                })
                            }}
                        >
                            {[targetNodePath].map((item: any) => {
                                return <CSSTransition
                                    key={item}
                                    timeout={300}
                                    classNames={{
                                        enter: 'plf-path-enter',
                                        enterActive: 'plf-path-enter-active',
                                        exit: `${targetExit}-exit`,
                                        exitActive: `${targetExit}-exit-active`,
                                    }}
                                >
                                    <PlfPath
                                        path={item}
                                    />
                                </CSSTransition>
                            })}
                        </TransitionGroup>
                    </div>
                </div>
            </div>
        )
    }
}
