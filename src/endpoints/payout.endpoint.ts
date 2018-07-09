import { ContextRequest, FormParam, Path, POST, Preprocessor } from 'typescript-rest';
import { AdminPreprocessor } from '../preprocessors/admin.preprocessor';
import { RequestExtended } from '../interfaces/request-extended.interface';
import { MatchBetPayout } from '../payouts/match-bet.payout';

@Path('/payout')
@Preprocessor(AdminPreprocessor)
export class PayoutEndpoint {

  @Path('/match')
  @POST
  payoutMatch(
    @FormParam('id') id: number,
    @ContextRequest { pool }: RequestExtended,
  ): Promise<any> {

    return MatchBetPayout(id, pool);

  }

}