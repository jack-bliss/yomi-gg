import * as React from 'react';
import { MatchBetSpread } from '../../models/match-bet-spread.model';
import styled from 'styled-components';
import { TertiaryColor, PrimaryColor } from '../theme';

interface MatchBetSpreadCompProps {
  mbs: MatchBetSpread;
}

const MBSWrapper = styled.div`
  margin-bottom: 10px;
`;

const MBSRound = styled.span`
`;

const MBSState = styled.span`
`;

interface MBSEntrantProps {
  isWinner: boolean;
}
const MBSEntrant = styled.span`
  background-color: ${(props: MBSEntrantProps) => props.isWinner ? TertiaryColor : 'none'};
  color: ${(props) => props.isWinner ? 'inherit' : PrimaryColor};
`;

export const MatchBetSpreadComp = ({ mbs }: MatchBetSpreadCompProps) => {
  return <MBSWrapper>
    <div>
      <MBSRound>{mbs.round}</MBSRound> - <MBSState>{mbs.state}</MBSState>
    </div>
    <div>
      {mbs.entrants.map(e => <MBSEntrant isWinner={e.is_winner}>{e.tag}: {e.backing}</MBSEntrant>)}
    </div>
  </MBSWrapper>;
}