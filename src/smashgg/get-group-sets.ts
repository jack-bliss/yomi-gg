import axios, { AxiosResponse } from 'axios';
import { SmashggResponse } from '../interfaces/smashgg/smashgg-response.interface';
import { SmashggGroup } from '../interfaces/smashgg/smashgg-group.interface';
import { SmashggSet } from '../interfaces/smashgg/smashgg-set.interface';

export interface SmashggGroupSetsEntities {

  groups: SmashggGroup;
  sets: SmashggSet[];

}

export const GetGroupSets = (group_id: number): Promise<SmashggGroupSetsEntities> => {

  return new Promise((resolve, reject) => {
    axios
      .get('https://api.smash.gg/phase_group/' + group_id + '?expand[]=sets')
      .then((response: AxiosResponse<SmashggResponse<SmashggGroupSetsEntities>>) => {
        resolve(response.data.entities);
      }, err => {
        reject(err);
      });
  });

};
