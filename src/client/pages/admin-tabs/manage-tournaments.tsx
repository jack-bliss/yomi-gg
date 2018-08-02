import * as React from 'react';
import { A } from '../../components/a';
import { Event } from '../../../models/event.model';
import { RootState } from '../../redux/root';
import { Dispatch } from 'redux';
import { fetchingEventMatches, eventMatchesFetched, focusEvent, fetchingEvents, eventsFetched, fetchingEventBreakdown, eventBreakdownFetched } from '../../redux/events/events_actions';
import axios, { AxiosResponse } from 'axios';
import { Match } from '../../../models/match.model';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as qs from 'qs';
import { MatchBetSpread } from '../../../models/match-bet-spread.model';
import { MatchBetSpreadComp } from '../../components/match-bet-spread-comp';


/* ===EVENT LIST=== */
const EventLink = A.extend`
  display: block;
  margin-bottom: 20px;
`;

interface EventItemProps {
  event: Event;
  onClick: (e: any) => any;
}
const EventItem = ({event, onClick}: EventItemProps) => {
  return <EventLink
    href="#" 
    data-id={event.id}
    onClick={onClick}
  >{event.name}</EventLink>
};

const EventListWrapper = styled.div`
  grid-area: list;
`;

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

/* ===HEADER=== */

const ManageHeaderWrapper = styled.div`
  grid-area: header;
`;

// buttons
const HeaderButton = styled.button`
  margin-left: 10px;
`;

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

const BetFetchButton = connect(
  mapStateToBetFetchButtonProps,
  mapDispatchToBetFetchButtonProps
)(BetFetchButtonPresenter);

interface UpdateQueueButtonProps {
  id: number;
}

const UpdateQueueButton = ({ id }: UpdateQueueButtonProps) => {
  return <HeaderButton onClick={() => {
    axios
      .post('/smashgg/update-event-queue', qs.stringify({ id }))
      .then((r: AxiosResponse) => {
        console.log(r);
      }, err => {
        console.error(err);
      });
  }}>Update Stream</HeaderButton>
}

// actual component
interface ManageHeaderProps {
  event: Event;
}
const ManageHeader = ({ event }: ManageHeaderProps) => {
  return <ManageHeaderWrapper>
    ({event.id}) {event.name} - {event.state} 
    <UpdateQueueButton id={event.smashgg_id} />
    <BetFetchButton id={event.id} />
  </ManageHeaderWrapper>;
}

/* ===DISPLAY OUTLET=== */

const DisplayOutlet = styled.div`
  grid-area: display;
`;

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
  return {
    list: state.events.event_breakdown[state.events.focused],
  }
}

const BreakDownList = connect(
  mapStateToBreakdownListLayoutProps,
)(BreakdownListLayout);

/* ===OVERALL LAYOUT=== */

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
    <InteractiveEventList></InteractiveEventList>
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