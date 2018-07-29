import { SmashggResponse } from '../interfaces/smashgg/smashgg-response.interface';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';
import axios, { AxiosResponse } from 'axios';

export interface SmashggSetEntities {
  sets: SmashggSet;
}

export const GetSet = (set_id: number): Promise<SmashggSet> => {

  return new Promise((resolve, reject) => {

    axios
      .get('https://api.smash.gg/set/' + set_id)
      .then((response: AxiosResponse<SmashggResponse<SmashggSetEntities>>) => {
        resolve(response.data.entities.sets);
      }, err => {
        reject(err);
      });

  })

};
