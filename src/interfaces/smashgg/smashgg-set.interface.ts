export interface SmashggSet {

  id: number;
  identifier: string;
  eventId: number;
  phaseGroupId: number;
  entrant1Id: number;
  entrant2Id: number;
  winnerId: number;
  loserId: number;
  bracketId: string;
  entrant1Score: number;
  entrant2Score: number;
  fullRoundText: string;
  entrant1PrereqType: string;
  entrant2PrereqType: string;
  round: number;
  previewOrder: number;

}