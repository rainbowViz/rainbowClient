import {
    IAction,
    IVerificationView,
} from '../../types'

export const nextSuggestion = (exitClass: string) : IAction => {
    return {
        type: 'NEXT_SUGGESTION',
        payload: {
            exitClass,
        },
    }
}

export const previousSuggestion = () : IAction => {
    return {
        type: 'PREVIOUS_SUGGESTION',
    }
}

export const downvoteCurrentSuggestion = () : IAction => {
    return (dispatch: any, getState: any) => {
        const state : IVerificationView = getState()
        const suggestion = state.suggestionList[state.currentSuggestion]

        // TODO : send downvote to server

        // Update current suggestion with nearestNeighbours
        if (suggestion.targets.length > 0) {
            // Call nextNeighbour only if there actually are neighbours to be tested
            dispatch(nextNeighbour('downvote'))
        } else {
            // Otherwise, simply return the next suggestion
            dispatch(nextSuggestion('next'))
        }
    }
}

// Deprecated: no need to update the state?
export const downvoteSuggestion = (source_id: number, target_id: number, distance: number) : IAction => {
    return {
        type: 'DOWNVOTE_SUGGESTION',
        payload: {
            source_id,
            target_id,
            distance,
        }
    }
}

export const upvoteCurrentSuggestion = () : IAction => {
    return (dispatch: any, getState: any) => {
        // TODO: send upvote to server

        dispatch(nextSuggestion('upvote'))
    }
}

// Deprecated: no need to update the state?
export const upvoteSuggestion = (source_id: number, target_id: number, distance: number) : IAction => {
    return {
        type: 'UPVOTE_SUGGESTION',
        payload: {
            source_id,
            target_id,
            distance,
        }
    }
}

export const upvoteSuggestionNextNeighbour = () : IAction => {
    return (dispatch: any, getState: any) => {
        // TODO: send upvote to server

        dispatch(nextNeighbour('upvote'))
    }
}

export const nextNeighbour = (exitClass: string) : IAction => {
    return {
        type: 'NEXT_NEIGHBOUR',
        payload: {
            exitClass,
        }
    }
}

export const changeSelectedYear = (selectedYear: string) : IAction => {
    return (dispatch: any, getState: any) => {
        dispatch(loading())

        Promise.all([
            dispatch(fetchVotes(`http://api.live.rollin.ovh/plf_votes/plf${selectedYear}_to_plf${Number(selectedYear) + 1}.json`)),
            dispatch(fetchPlf(`http://api.live.rollin.ovh/plf_all_nodes/plf${selectedYear}.csv`, 'source')),
            dispatch(fetchPlf(`http://api.live.rollin.ovh/plf_all_nodes/plf${Number(selectedYear) + 1}.csv`, 'target'))
        ]).then(() => {
            dispatch(updateSelectedYear(selectedYear))
        })
    }
}

export const loading = () => {
    return {
        type: 'LOADING',
    }
}

export const updateSelectedYear = (selectedYear: string) : IAction => {
    return {
        type: 'UPDATE_SELECTED_YEAR',
        payload: selectedYear,
    }
}

export const fetchVotes = (url: string) : IAction => {
    return (dispatch: any, getState: any) => {
        return fetch(url).then((response: any) => {
            return response.json()
        }).then((response: any) => {
            dispatch(receivedVotes(response))
        }).catch((err: any) => {
            console.log(err)
            dispatch(faildedVotes(err))
        })
    }
}

export const receivedVotes = (response: any) : IAction => {
    return {
        type: 'RECEIVED_VOTES',
        payload: response,
    }
}

export const faildedVotes = (err: any) : IAction => {
    return {
        type: 'FAILED_VOTES',
        payload: err,
    }
}

export const fetchPlf = (url: string, destination: string) : IAction => {
    return (dispatch: any, getState: any) => {
        return fetch(url).then((response: any) => {
            return response.text()
        }).then((response: any) => {
            dispatch(receivedPlf(response, destination))
        }).catch((err: any) => {
            console.log(err)
            dispatch(faildedPlf(err))
        })
    }
}

export const receivedPlf = (response: any, destination: string) : IAction => {
    return {
        type: 'RECEIVED_PLF',
        payload: {
            destination,
            content: response,
        }
    }
}

export const faildedPlf = (err: any) : IAction => {
    return {
        type: 'FAILED_PLF',
        payload: err,
    }
}
