export interface SmashggEntrant {

  id: number;
  eventId: number;
  participantIds: number[];
  name: string;
  playerIds: { [key: number]: number };
  initialSeedNum: number;

}