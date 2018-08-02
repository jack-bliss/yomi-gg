import * as React from 'react';
import { RootState } from "../../../../redux/root";
import { Dispatch } from 'redux';
import { fetchingEventBreakdown, eventBreakdownFetched } from '../../../../redux/events/events_actions';
import axios, { AxiosResponse } from 'axios';
import { MatchBetSpread } from '../../../../../models/match-bet-spread.model';
import { HeaderButton } from './header-button';
import { connect } from 'react-redux';

interface BetFetchButtonProps {
  id: number;
}

interface BetFetchButtonPresenterProps {
  fetch: (id: number) => void;
  id: number;
}

const mapStateToBetFetchButtonProps = (state: RootState, ownProps: BetFetchButtonProps): Partial<BetFetchButtonPresenterProps> => {
  return {
    id: ownProps.id,
  }
}

const mapDispatchToBetFetchButtonProps = (dispatch: Dispatch): Partial<BetFetchButtonPresenterProps> => {
  return {
    fetch: (id: number) => {
      dispatch(fetchingEventBreakdown());
      axios
        .get('/events/' + id + '/matches/breakdown')
        .then((r: AxiosResponse<MatchBetSpread[]>) => {
          dispatch(eventBreakdownFetched(id, r.data));
        });
    }
  }
}

const BetFetchButtonPresenter = ({ fetch, id }: BetFetchButtonPresenterProps) => {
  return <HeaderButton onClick={() => fetch(id)}>List Bets</HeaderButton>
}

export const BetFetchButton = connect(
  mapStateToBetFetchButtonProps,
  mapDispatchToBetFetchButtonProps
)(BetFetchButtonPresenter);