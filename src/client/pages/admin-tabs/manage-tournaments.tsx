import * as React from 'react';
import { A } from '../../components/a';
import { Event } from '../../../models/event.model';
import { RootState } from '../../redux/root';
import { Dispatch } from 'redux';
import { fetchingEventMatches, eventMatchesFetched, focusEvent, fetchingEvents, eventsFetched } from '../../redux/events/events_actions';
import axios, { AxiosResponse } from 'axios';
import { Match } from '../../../models/match.model';
import { connect } from 'react-redux';
import styled from 'styled-components';

interface EventItemProps {
  event: Event;
  onClick: (e: any) => any;
}
const EventItem = ({event, onClick}: EventItemProps) => {
  return <A 
    href="#" 
    data-id={event.id}
    onClick={onClick}
  >{event.name}</A>
};

const EventListWrapper = styled.div``;

interface EventListProps {
  events: Event[];
  onEventClick: (id: number) => any;
}
const EventList = ({ events, onEventClick }: EventListProps) => {
  return <EventListWrapper>
    {
      events.map(event => <EventItem 
        event={event}
        onClick={() => onEventClick(event.id)}
        ></EventItem>
      )
    }
  </EventListWrapper>;
}

const mapStateToEventListProps = (state: RootState) => {
  return {
    events: state.events.events,
  }
}

const mapDispatchToEventListProps = (dispatch: Dispatch)=> {
  return {
    onEventClick: (id: number) => {
      dispatch(focusEvent(id));
      dispatch(fetchingEventMatches());
      axios
        .get('/events/' + id + '/matches/')
        .then((response: AxiosResponse<Match[]>) => {
          dispatch(eventMatchesFetched(id, response.data));
        });
    }
  }
}

const InteractiveEventList = connect(
  mapStateToEventListProps,
  mapDispatchToEventListProps,
)(EventList);

const ManageTournamentWrapper = styled.div``;

interface ManageTournamentsLayoutProps {
  focused: Event;
  loading: boolean;
  hasEvents: boolean;
  fetchEvents: () => void;
}
const ManageTournamentsLayout = (
  { focused, loading, hasEvents, fetchEvents }: ManageTournamentsLayoutProps
) => {
  if (!hasEvents && !loading) {
    fetchEvents();
  }
  let focusedElem;
  if (focused) {
    focusedElem = <div>({focused.id}) {focused.name} : {focused.state}</div>;
  } else {
    focusedElem = null;
  }
  return <ManageTournamentWrapper>
    <InteractiveEventList></InteractiveEventList>
    {focusedElem}
  </ManageTournamentWrapper>;
}

const mapStateToManageTournamentsLayoutProps = (state: RootState): Partial<ManageTournamentsLayoutProps> => {
  let events = state.events.events;
  let focused = state.events.focused;
  return {
    hasEvents: events.length > 0,
    loading: state.events.fetching === 'events',
    focused: focused ? events.find(e => e.id === focused) : null,
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