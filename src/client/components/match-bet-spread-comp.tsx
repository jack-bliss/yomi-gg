import * as React from 'react';
import { MatchBetSpread } from '../../models/match-bet-spread.model';
import styled from 'styled-components';
import { TertiaryColor, PrimaryColor, LightColor } from '../theme';

interface MatchBetSpreadCompProps {
  mbs: MatchBetSpread;
}

const MBSWrapper = styled.div`
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${LightColor};
`;

const MBSRound = styled.span`
`;

const MBSState = styled.span`
`;

const MBSBacking = styled.span`
  padding: 3px;
  border: 1px solid ${TertiaryColor};
  border-radius: 10px;
`;

interface MBSEntrantProps {
  isWinner: boolean;
}
const MBSEntrant = styled.span`
  background-color: ${(props: MBSEntrantProps) => props.isWinner ? TertiaryColor : 'transparent'};
  color: ${(props) => props.isWinner ? PrimaryColor : 'inherit'};
  display: inline-block;
  width: 40%;
`;

export const MatchBetSpreadComp = ({ mbs }: MatchBetSpreadCompProps) => {
  return <MBSWrapper>
    <div>
      <MBSRound>{mbs.round}</MBSRound> - <MBSState>{mbs.state}</MBSState>
    </div>
    <div>
      {mbs.entrants.map(e => {
        return <MBSEntrant isWinner={e.is_winner}>
          {e.tag}: <MBSBacking>{e.backing}</MBSBacking>
        </MBSEntrant>
      })}
    </div>
  </MBSWrapper>;
}