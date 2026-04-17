import ProgramTrainRunner from '../components/ProgramTrainRunner'

/** Single program-driven session — equipment + schedule from onboarding; no style tabs. */
export default function TrainSession() {
  return <ProgramTrainRunner styleId="program" title="Today's session" showBackLink />
}
