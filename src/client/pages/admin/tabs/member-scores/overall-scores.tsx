import { RootState } from '../../../../redux/root';
import { connect } from 'react-redux';
import { MemberScoresList } from './member-scores-list';


const mapStateToOverallScoresProps = (state: RootState) => {
  return {
    members: state.members.profiles,
  }
}

export const OverallScores = connect(
  mapStateToOverallScoresProps,
)(MemberScoresList);