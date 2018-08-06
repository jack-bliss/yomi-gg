import * as React from 'react';
import styled from 'styled-components';

const MemberScoresWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 20px auto;
  grid-template-areas:
    "header"
    "."
    "outlet";
`;

export const MemberScores = () => {
  return <MemberScoresWrapper>
    
  </MemberScoresWrapper>;
}