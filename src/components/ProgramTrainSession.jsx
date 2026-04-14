import ProgramTrainRunner from './ProgramTrainRunner'

export default function ProgramTrainSession({ styleId = 'gym', title = 'Training session' }) {
  return <ProgramTrainRunner styleId={styleId} title={title} showBackLink />
}
