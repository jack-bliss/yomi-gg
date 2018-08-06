import * as React from 'react';
import { connect } from 'react-redux';
import { MatchBetSpread } from '../../../../../models/match-bet-spread.model';
import styled from 'styled-components';
import { MatchBetSpreadComp } from '../../../../components/match-bet-spread-comp';
import { RootState } from '../../../../redux/root';
import { EventsState } from '../../../../redux/events/events_state.interface';

interface BreakdownListLayoutProps {
  list: MatchBetSpread[];
}

const BreakdownListWrapper = styled.div``;

const BreakdownListLayout = ({ list }: BreakdownListLayoutProps) => {
  return <BreakdownListWrapper>
    { list.map(mbs => <MatchBetSpreadComp mbs={mbs} />)}
  </BreakdownListWrapper>
}

const mapStateToBreakdownListLayoutProps = (state: RootState): Partial<BreakdownListLayoutProps> => {
  let list: MatchBetSpread[] = [];
  let es: EventsState = state.events;
  if (es.event_breakdown.hasOwnProperty(es.focused)) {
    list = state.events.event_breakdown[state.events.focused];
  }
  return {
    list,
  }
}

export const BreakDownList = connect(
  mapStateToBreakdownListLayoutProps,
)(BreakdownListLayout);