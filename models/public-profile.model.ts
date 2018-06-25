import { ProfileType } from '../types/profile-type.type';
import { DateDeserialiser } from '../deserialisers/date.deserialiser';

export class PublicProfile {

  id: number;
  username: string;
  joined: Date;
  type: ProfileType;

  constructor(input: any) {
    this.id = input.id;
    this.username = input.username;
    this.joined = DateDeserialiser(input.joined);
    this.type = input.type;
  }

}