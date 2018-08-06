import * as React from 'react';
import { Event } from '../../../../../models/event.model';
import { RootState } from '../../../../redux/root';
import { Dispatch } from 'redux';
import { fetchingEvents, eventsFetched } from '../../../../redux/events/events_actions';
import axios, { AxiosResponse } from 'axios';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { EventList } from './event-list';
import { ManageHeader } from './manage-header';
import { DisplayOutlet } from '../../../../components/display-outlet';
import { BreakDownList } from './breakdown-list';

const ManageTournamentWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 20px 1fr;
  grid-template-rows: auto 20px auto;
  grid-template-areas: 
    "list . header"
    "list . . "
    "list . display";
`;

interface ManageTournamentsLayoutProps {
  focused: Event;
  loading: boolean;
  hasEvents: boolean;
  fetchEvents: () => void;
  display: 'matches' | 'breakdown' | 'none';
}
const ManageTournamentsLayout = ({ 
    focused, 
    loading, 
    hasEvents, 
    fetchEvents,
    display, 
  }: ManageTournamentsLayoutProps) => {
  if (!hasEvents && !loading) {
    fetchEvents();
  }
  return <ManageTournamentWrapper>
    <EventList></EventList>
    {focused ? <ManageHeader event={focused} /> : null}
    <DisplayOutlet>
      { display === 'breakdown' ? <BreakDownList /> : null}
    </DisplayOutlet>
  </ManageTournamentWrapper>;
}

const mapStateToManageTournamentsLayoutProps = (state: RootState): Partial<ManageTournamentsLayoutProps> => {
  let events = state.events.events;
  let focused = state.events.focused;
  return {
    hasEvents: events.length > 0,
    loading: state.events.fetching === 'events',
    focused: focused ? events.find(e => e.id === focused) : null,
    display: state.events.displaying,
  };
}

const mapDispatchToManageTournamentsLayoutProps = (dispatch: Dispatch): Partial<ManageTournamentsLayoutProps> => {
  return {
    fetchEvents: () => {
      dispatch(fetchingEvents());
      axios
        .get('/events')
        .then((r: AxiosResponse<Event[]>) => {
          dispatch(eventsFetched(r.data));
        });
    }
  }
}

export const ManageTournaments = connect(
  mapStateToManageTournamentsLayoutProps,
  mapDispatchToManageTournamentsLayoutProps,
)(ManageTournamentsLayout);