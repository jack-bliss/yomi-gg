import * as request from 'request-promise-native';
import { SmashggResponse } from '../interfaces/smashgg/smashgg-response.interface';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';

export interface SmashggSetEntities {
  sets: SmashggSet;
}

export const GetSet = (set_id: number): Promise<SmashggSet> => {

  return new Promise((resolve, reject) => {

    request({
      uri: 'https://api.smash.gg/set/' + set_id,
      json: true,
    }).then((json: SmashggResponse<SmashggSetEntities>) => {
      resolve(json.entities.sets);
    }, err => {
      reject(err);
    });

  })

};
