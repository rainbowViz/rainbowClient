import {
    Button,
    ControlGroup,
    Spinner,
    Tab,
    TabId,
    Tabs,
    Tag,
} from '@blueprintjs/core'
import * as React from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import './style.less'

// Import custom actions
import {
    fetchPartition,
} from '../../actions/plf'
import {
    changeYear,
    updateHierarchyType,
    updateSelectedNode,
    updateSourceType,
} from './actions'

// Import custom components
import BarChart from '../../components/barChart'
import BetaHeader from '../../components/betaHeader'
import NodeViewer from '../../components/nodeViewer'
import Partition from '../../components/partition'
import StringSelect from '../../components/selects/stringSelect'
import TreeView from '../../components/treeView'

// Import custom types
import {
    IReduxStore,
    IView,
} from '../../types'

export interface IMainViewState {
    // Hierarchy type
    // (ex: comptabilité générale, compatabilité budgétaire)
    hierarchyType: string,
    // Clicked node in the visible partition
    selectedNode: {
        path: string[],
        data: {
            ae: number,
            cp: number,
        },
    },
    // Source document type
    // (ex: PLF, LFI, LR)
    sourceType: string,
    // Selected year
    // (ex: 2018)
    year: string,
}

export interface IMainView extends IView, IMainViewState {}

export interface IState {
    selectedTabId: TabId,
    shouldRedirect: boolean,
}

// Link redux state to current component's react props
// which will now be notified when changes occur in redux state
const reduxify = (mapReduxStateToReactProps: any, mapDispatchToProps?: any, mergeProps?: any, options?: any) => {
    return (target: any) => (
        connect(
            mapReduxStateToReactProps,
            mapDispatchToProps,
            mergeProps,
            options
        )(target) as any
    )
}

// Describe how redux state should be mapped to props
const mapReduxStateToReactProps = (state : IReduxStore): IMainView => {
    return {
        ...state.views.mainView,
        data: state.data,
        dispatch: state.dispatch,
    }
}

@reduxify(mapReduxStateToReactProps)
export default class MainView extends React.Component<IMainView, IState> {
    constructor(props: IMainView) {
        super(props)
        this.state = {
            selectedTabId: 'partition',
            shouldRedirect: false,
        }
    }

    public componentDidMount() {
        this.props.dispatch(changeYear('2019'))
    }

    private handleTabChange = (navbarTabId: TabId) => this.setState({
        selectedTabId: navbarTabId,
    })

    public render () {
        let {
            data,
            dispatch,
            hierarchyType,
            selectedNode,
            sourceType,
            year,
        } = this.props

        const partitionTab = <div id='partition'>
            {data.plf.loading || !(year in data.plf.plfByYear) ?
                <div className='centered-spinner'>
                    <Spinner/>
                </div> :
                <Partition
                    data={data.plf.plfByYear[year].data}
                    loadedTime={data.plf.plfByYear[year].loadedTime}
                    onMouseOverCallback={(p: any) => {
                        let path : string[] = [p.data.name]
                        let currentNode = p
                        while (currentNode.parent) {
                            path.push(currentNode.parent.data.name)
                            currentNode = currentNode.parent
                        }

                        dispatch(updateSelectedNode(path.reverse(), {
                            ae: p.data.ae,
                            cp: p.data.cp,
                        }))
                    }}
                    targetDivId={'partition'}
                />
            }
        </div>

        const listTab = <div id='tree'>
            {data.plf.loading || !(year in data.plf.plfByYear) ?
                <div className='centered-spinner'>
                    <Spinner/>
                </div> :
                <TreeView
                    data={data.plf.plfByYear[year].data}
                    onClickCallback={(nodeData: any) => {
                        console.log(nodeData)
                        dispatch(updateSelectedNode(nodeData.path, {
                            ae: nodeData.ae,
                            cp: nodeData.cp,
                        }))
                    }}
                />
            }
        </div>

        return (
            <div id='main-view-container'>
                <BetaHeader />
                {this.state.shouldRedirect ? <Redirect to='/' /> : null}
                <div id='header' className={'bp3-dark'}>
                    <div></div>
                    <ControlGroup>
                        <StringSelect
                            disabled={true}
                            items={['Comptabilité générale', 'Comptabilité budgétaire']}
                            inputItem={hierarchyType}
                            onChange={null}
                        />
                        <StringSelect
                            items={['PLF']}
                            inputItem={sourceType}
                            onChange={(target: string) => {
                                dispatch(updateSourceType(target))
                            }}
                        />
                        <StringSelect
                            items={['2017', '2018', '2019']}
                            inputItem={year}
                            onChange={(target: string) => {
                                dispatch(changeYear(target))
                            }}
                        />
                    </ControlGroup>
                    <Button
                        icon={'help'}
                        minimal={true}
                        onClick={() => this.setState({shouldRedirect: true,})}
                    >
                        Informations
                    </Button>
                </div>
                <div id='node-viewer'>
                    <div id='barchart'>
                        <BarChart
                            data={selectedNode.data}
                            loadedTime={(year in data.plf.plfByYear) ? data.plf.plfByYear[year].loadedTime : null}
                            selectedNodePath={selectedNode.path}
                            targetDivId={'barchart'}
                        />
                    </div>
                    <div id='path-breadcrumbs'>
                        <NodeViewer
                            path={selectedNode.path}
                            size={selectedNode.data.cp}
                        />
                    </div>
                </div>
                <div id='information-viewer'>
                    <Tabs
                        onChange={this.handleTabChange}
                        renderActiveTabPanelOnly={true}
                        selectedTabId={this.state.selectedTabId}
                    >
                        <Tab
                            id="partition"
                            title="Visualisation proportionelle au montant"
                            panel={partitionTab}
                        />
                        <Tab
                            id="tree"
                            title="Visualisation par liste"
                            panel={listTab}
                        />
                    </Tabs>
                </div>
            </div>
        )
    }
}
