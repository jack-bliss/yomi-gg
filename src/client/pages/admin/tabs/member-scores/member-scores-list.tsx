import * as React from 'react';
import styled from 'styled-components';
import { MemberCoins, CoinDisplay } from '../../../../components/coin-display';

interface MemberScoresListProps {
  members: MemberCoins[];
}

const MemberScoresListWrapper = styled.div``;

export const MemberScoresList = ({ members }: MemberScoresListProps) => {
  return <MemberScoresListWrapper>
    {members.map((member) => <CoinDisplay profile={member}></CoinDisplay>)}
  </MemberScoresListWrapper>;
}