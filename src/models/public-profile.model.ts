import { ProfileType } from '../types/profile-type.type';

export class PublicProfile {

  static fields: (keyof PublicProfile)[] = ['id', 'username', 'joined', 'type'];

  id: number;
  username: string;
  joined: Date;
  type: ProfileType;

  constructor(input: any) {
    this.id = input.id;
    this.username = input.username;
    this.joined = new Date(input.joined);
    this.type = input.type;
  }

}