import * as React from 'react';
import { A } from '../../../../components/a';
import { Event } from '../../../../../models/event.model';

const EventLink = A.extend`
  display: block;
  margin-bottom: 20px;
`;

interface EventItemProps {
  event: Event;
  onClick: (e: any) => any;
}

export const EventItem = ({event, onClick}: EventItemProps) => {
  return <EventLink
    href="#" 
    data-id={event.id}
    onClick={onClick}
  >{event.name}</EventLink>
};