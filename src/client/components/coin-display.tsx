import * as React from 'react';
import { Coin } from './coin';

export interface MemberCoins {
  username: string;
  coins: number;
}

interface CoinDisplayProps {
  profile: MemberCoins;
}

export const CoinDisplay = ({ profile }: CoinDisplayProps) => {
  return <div>
    {profile.username}: <Coin>{profile.coins}</Coin>
  </div>
};