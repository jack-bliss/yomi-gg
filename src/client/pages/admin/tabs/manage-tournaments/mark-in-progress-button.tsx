import * as React from 'react';
import { SpacedButton } from '../../../../components/spaced-button';
import axios from 'axios';
import * as qs from 'qs';

interface MarkInProgressButtonProps {
  id: number;
}

export const MarkInProgressButton = ({ id }: MarkInProgressButtonProps) => {
  return <SpacedButton onClick={() => {
    axios
      .patch('/events/' + id, qs.stringify({
        state: 'in-progress'
      }));
  }}>
    Start Tournament
  </SpacedButton>;
}