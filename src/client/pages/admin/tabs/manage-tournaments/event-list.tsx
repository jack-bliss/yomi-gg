import * as React from 'react';
import styled from 'styled-components';
import { EventItem } from './event-item';
import { Event } from '../../../../../models/event.model';
import { RootState } from '../../../../redux/root';
import { Dispatch } from 'redux';
import { focusEvent, fetchingEventMatches, eventMatchesFetched } from '../../../../redux/events/events_actions';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Match } from '../../../../../models/match.model';
import { connect } from 'react-redux';

const EventListWrapper = styled.div`
  grid-area: list;
`;

interface EventListProps {
  events: Event[];
  onEventClick: (id: number) => any;
}
const EventListLayout = ({ events, onEventClick }: EventListProps) => {
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

export const EventList = connect(
  mapStateToEventListProps,
  mapDispatchToEventListProps,
)(EventListLayout);