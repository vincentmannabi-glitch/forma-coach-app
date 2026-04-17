import ProgramTrainRunner from './ProgramTrainRunner'

export default function ProgramTrainSession({ styleId = 'program', title = 'Training session' }) {
  return <ProgramTrainRunner styleId={styleId} title={title} showBackLink />
}
