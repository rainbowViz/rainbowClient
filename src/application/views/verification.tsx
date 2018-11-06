import {
    Breadcrumb,
    Button,
    ControlGroup,
    Icon,
} from '@blueprintjs/core'
import * as React from 'react'
import {connect} from 'react-redux'

// Import custom actions
import {
    nextSuggestion,
    updateSelectedYear,
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
    }

    private clickOk = () => {
        this.props.dispatch(nextSuggestion())
    }

    public render () {
        let {
            dispatch,
            verification,
        } = this.props

        let {
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
                    <Button icon={'cross'} intent={'danger'} />
                    <Button
                        icon={'tick'}
                        intent={'success'}
                        onClick={this.clickOk}
                    />
                </ControlGroup>
                <div className='input-columns'>
                    <div className='year'>{selectedYear}</div>
                    <div className='plf-paths'>
                        <PlfPath path={sourceNodePath} />
                    </div>
                </div>
                <Icon className='linking-arrow' icon='arrow-down' />
                <div className='input-columns'>
                    <div className='year'>{Number(selectedYear) + 1}</div>
                    <div className='plf-paths'>
                        <PlfPath path={targetNodePath} />
                    </div>
                </div>
            </div>
        )
    }
}
