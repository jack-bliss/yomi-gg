import * as React from 'react';
import styled from 'styled-components';
import { Title } from '../components/title';

const NotFoundRoot = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 100px auto;
  grid-template-areas: 
    ". . . "
    ". title .";
`;

const NotFoundTitle = Title.extend`
  grid-area: title;
`;

export const NotFound = () => {
  return <NotFoundRoot>
    <NotFoundTitle>404</NotFoundTitle>
  </NotFoundRoot>
};