import styled, { css } from 'styled-components';
import { TertiaryColor, PrimaryColor } from '../theme';

export const LinkStyling = css`
  color: ${TertiaryColor};
  text-decoration: none;
  padding: 3px 5px;
  border-radius: 2px;
  &:hover {
    background-color: ${TertiaryColor};
    color: ${PrimaryColor};
  }
`;

export const A = styled.a`
  ${LinkStyling}
`;