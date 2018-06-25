import { ProfileType } from '../types/profile-type.type';

export class PublicProfile {

  id: number;
  username: string;
  joined: Date;
  type: ProfileType;

  constructor(input: any) {
    this.id = input.id;
    this.username = input.username;
    this.joined = new Date(typeof input.joined === 'string' ? parseInt(input.joined) : input.joined);
    this.type = input.type;
  }

}