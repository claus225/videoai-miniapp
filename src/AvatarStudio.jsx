import { useEffect, useState } from 'react'
import { Download, ImagePlus, Mic, RefreshCw, ShieldCheck, User, Video } from 'lucide-react'
import './avatar-studio.css'

const WORKER = 'http://127.0.0.1:8765'

export default function AvatarStudio() {
  const [engine, setEngine] = useState('checking')
  const [workerToken, setWorkerToken] = useState('')
  const [portrait, setPortrait] = useState(null)
  const [audio, setAudio] = useState(null)
  const [busy, setBusy] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [message, setMessage] = useState('Vérification du moteur local…')

  async function checkEngine() {
    setEngine('checking')
    try {
      const response = await fetch(WORKER + '/api/avatar/health', { signal: AbortSignal.timeout(2500) })
      if (!response.ok) throw new Error('Moteur indisponible')
      const data = await response.json()
      setEngine(data.installed && data.checkpoints_ready ? 'ready' : 'not-installed')
      setMessage(data.installed && data.checkpoints_ready
        ? 'SadTalker est prêt. Vous pouvez lancer une génération.'
        : 'Le moteur SadTalker ou ses modèles ne sont pas encore installés sur ce PC.')
    } catch {
      setEngine('offline')
      setMessage('Démarrez KREA VIDEO ENGINE sur votre PC pour vérifier SadTalker.')
    }
  }

  useEffect(() => { checkEngine() }, [])

  async function generate(event) {
    event.preventDefault()
    if (!portrait || !audio || !workerToken.trim()) return
    setBusy(true)
    setDownloadUrl('')
    setMessage('Génération de votre avatar en cours sur le PC…')
    try {
      const body = new FormData()
      body.append('portrait', portrait)
      body.append('audio', audio)
      const response = await fetch(WORKER + '/api/avatar/generate', {
        method: 'POST',
        headers: { 'X-Krea-Token': workerToken.trim() },
        body,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'La génération a échoué.')
      setDownloadUrl(WORKER + data.download_url)
      setMessage('Vidéo générée. Vérifiez le résultat avant de le publier.')
    } catch (error) {
      setMessage(error.message || 'Impossible de contacter le moteur local.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="avatar-studio">
      <header className="avatar-heading">
        <div>
          <span className="avatar-eyebrow">KREA CREATIVE TOOLS</span>
          <h1><User size={27} /> AVATAR STUDIO</h1>
          <p>Créez une vidéo parlante à partir d’un portrait autorisé et d’un audio en français.</p>
        </div>
        <span className={`avatar-status ${engine}`}><i />{engine === 'ready' ? 'Moteur prêt' : engine === 'checking' ? 'Vérification…' : engine === 'not-installed' ? 'Installation requise' : 'PC non connecté'}</span>
      </header>

      <div className="avatar-security">
        <ShieldCheck size={19} />
        <div><strong>Respect de l’image et de la voix</strong><p>Utilisez votre propre portrait ou une image dont vous avez l’autorisation. Indiquez clairement que la vidéo est générée par IA et ne l’utilisez pas pour tromper ou usurper l’identité d’une personne.</p></div>
      </div>

      <div className="avatar-layout">
        <form className="avatar-card" onSubmit={generate}>
          <label className="avatar-field">Clé de sécurité locale
            <input type="password" autoComplete="off" value={workerToken} onChange={event => setWorkerToken(event.target.value)} placeholder="Clé affichée dans le terminal du moteur" />
          </label>
          <div className="avatar-input-grid">
            <label className="avatar-upload">
              <ImagePlus size={25} />
              <strong>{portrait ? portrait.name : 'Portrait de l’avatar'}</strong>
              <span>PNG, JPG ou JPEG · 15 Mo max.</span>
              <input type="file" accept="image/png,image/jpeg" onChange={event => { setPortrait(event.target.files?.[0] || null); setDownloadUrl('') }} />
            </label>
            <label className="avatar-upload">
              <Mic size={25} />
              <strong>{audio ? audio.name : 'Voix française'}</strong>
              <span>WAV, MP3 ou M4A · 40 Mo max.</span>
              <input type="file" accept="audio/wav,audio/mpeg,audio/mp4,audio/x-m4a" onChange={event => { setAudio(event.target.files?.[0] || null); setDownloadUrl('') }} />
            </label>
          </div>
          <p className="avatar-hint">Première version : importez un enregistrement en français. La saisie d’un texte avec synthèse vocale française sera ajoutée dans une prochaine étape.</p>
          <button className="avatar-primary" type="submit" disabled={!portrait || !audio || !workerToken.trim() || busy || engine !== 'ready'}>
            <Video size={17} />{busy ? 'Génération en cours…' : 'Générer la vidéo avatar'}
          </button>
          <p className="avatar-message" role="status">{message}</p>
          {downloadUrl && <a className="avatar-download" href={downloadUrl}><Download size={17} /> Télécharger la vidéo MP4</a>}
        </form>

        <aside className="avatar-card avatar-side">
          <div className="avatar-side-icon"><User size={23} /></div>
          <h2>Rendu humain réaliste</h2>
          <p>Le moteur anime le portrait en suivant l’audio fourni. Le traitement est effectué localement sur le PC configuré.</p>
          <div className="avatar-side-note"><strong>À prévoir</strong><span>SadTalker, ses modèles et un environnement Python séparé. La vitesse dépend du processeur, de la mémoire et du GPU disponibles.</span></div>
          <button type="button" className="avatar-refresh" onClick={checkEngine}><RefreshCw size={15} /> Vérifier le moteur</button>
        </aside>
      </div>
    </section>
  )
}
