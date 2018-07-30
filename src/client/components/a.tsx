import styled from 'styled-components';
import { TertiaryColor } from '../theme';

export const A = styled.a`
  color: ${TertiaryColor};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`