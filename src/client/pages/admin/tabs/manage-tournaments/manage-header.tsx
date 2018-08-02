import * as React from 'react';
import styled from 'styled-components';
import { BetFetchButton } from './bet-fetch-button';
import { Event } from '../../../../../models/event.model';
import { UpdateQueueButton } from './update-queue-button';

const ManageHeaderWrapper = styled.div`
  grid-area: header;
`;

interface ManageHeaderProps {
  event: Event;
}

export const ManageHeader = ({ event }: ManageHeaderProps) => {
  return <ManageHeaderWrapper>
    ({event.id}) {event.name} - {event.state} 
    <UpdateQueueButton id={event.smashgg_id} />
    <BetFetchButton id={event.id} />
  </ManageHeaderWrapper>;
}
