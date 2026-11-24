import GameShell from '../../../shell/GameShell.jsx'
import css from '../styles.css?inline'
import Panel from './Panel.jsx'

// Panel del profesor (/#/panel). Usa los estilos de CodeBot.
export default function PanelPage() {
  return (
    <GameShell title="Panel del profesor" css={css}>
      <Panel />
    </GameShell>
  )
}
