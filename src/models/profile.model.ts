import { ProfileType } from '../types/profile-type.type';

export class Profile {

  id: number;
  username: string;
  email: string;
  joined: Date;
  verified: boolean;
  coins: number;
  type: ProfileType;

  constructor(input: any) {

    this.id = input.id;
    this.username = input.username;
    this.email = input.email;
    this.joined = new Date(input.joined);
    this.verified = Boolean(input.verified);
    this.coins = input.coins;
    this.type = input.type;

  }

}