export interface SmashggStream {
  id: number;
  eventId: number;
  tournamentId: number;
  identifier: number | string;
  streamName: string;
  streamType: number;
  streamTypeId: number;
  iconUrl: string;
  streamSource: number;
  isOnline: boolean;
  followerCount: number;
  removesTasks: any;
  streamStatus: any;
  streamGame: any;
  streamLogo: string;
  createdAt: number;
  updatedAt: number;
  enabled: boolean;
  expand: any[];
}