import { ProfileType } from '../enums/profile-type.enum';

export class PublicProfile {

  id: number;
  username: string;
  joined: Date;
  type: ProfileType;

  constructor(input: any) {
    this.id = input.id;
    this.username = input.username;
    this.joined = new Date(input.joined);
    this.type = ProfileType[input.type];
  }

}