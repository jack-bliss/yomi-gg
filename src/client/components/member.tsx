import * as React from 'react';
import styled from 'styled-components';
import { Profile } from '../../models/profile.model';

interface MemberProps {
  profile: Profile;
}

export const Member = ({ profile }: MemberProps) => {
  return <div>
    {profile.username}: {profile.coins}
  </div>
};