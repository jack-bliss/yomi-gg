import * as React from 'react';
import { HeaderButton } from './header-button';
import axios, { AxiosResponse } from 'axios';
import * as qs from 'qs';

interface UpdateQueueButtonProps {
  id: number;
}

export const UpdateQueueButton = ({ id }: UpdateQueueButtonProps) => {
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
