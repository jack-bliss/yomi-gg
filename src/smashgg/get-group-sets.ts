import * as request from 'request-promise-native';
import { SmashggResponse } from '../interfaces/smashgg/smashgg-response.interface';
import { SmashggGroup } from '../interfaces/smashgg/smashgg-group.interface';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';

export interface SmashggGroupSetsEntities {

  groups: SmashggGroup;
  sets: SmashggSet[];

}

export const GetGroupSets = (group_id: number): Promise<SmashggGroupSetsEntities> => {

  return new Promise((resolve, reject) => {
    request({
      uri: 'https://api.smash.gg/phase_group/' + group_id + '?expand[]=sets',
      json: true,
    }).then((json: SmashggResponse<SmashggGroupSetsEntities>) => {
      resolve(json.entities);
    }, err => {
      reject(err);
    });
  });

};
