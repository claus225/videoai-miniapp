import { useEffect, useState } from 'react'
import { Clapperboard, Download, Film, HardDrive, RefreshCw, Scissors, ShieldCheck, UploadCloud } from 'lucide-react'
import './video-engine.css'

const WORKER = 'http://127.0.0.1:8765'

export default function VideoEngine() {
  const [worker, setWorker] = useState('checking')
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('9:16')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('Démarrez le moteur local sur votre PC pour commencer.')
  const [downloadUrl, setDownloadUrl] = useState('')

  async function checkWorker() {
    setWorker('checking')
    try {
      const response = await fetch(WORKER + '/health', { signal: AbortSignal.timeout(2500) })
      if (!response.ok) throw new Error('Worker indisponible')
      const data = await response.json()
      setWorker(data.ffmpeg ? 'online' : 'missing-ffmpeg')
    } catch {
      setWorker('offline')
    }
  }

  useEffect(() => { checkWorker() }, [])

  async function renderVideo(event) {
    event.preventDefault()
    if (!file) return
    setBusy(true)
    setMessage('Envoi de la vidéo au moteur local…')
    setDownloadUrl('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('format', format)
      const response = await fetch(WORKER + '/api/render', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Le rendu a échoué.')
      setDownloadUrl(WORKER + data.download_url)
      setMessage('Rendu terminé. Votre fichier est prêt.')
    } catch (error) {
      setMessage(error.message || 'Impossible de contacter le moteur local.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="video-engine">
      <div className="ve-heading">
        <div><span className="ve-eyebrow">KREA CREATIVE TOOLS</span><h1><Clapperboard size={27} /> KREA VIDEO ENGINE</h1><p>Studio de montage local — vos vidéos restent sur votre PC.</p></div>
        <span className={`ve-status ${worker}`}><i />{worker === 'online' ? 'Moteur connecté' : worker === 'missing-ffmpeg' ? 'FFmpeg manquant' : worker === 'checking' ? 'Vérification…' : 'PC non connecté'}</span>
      </div>
      <div className="ve-grid">
        <div className="ve-card ve-upload">
          <div className="ve-card-title"><UploadCloud /><div><h2>Importer une vidéo</h2><p>MP4, MOV ou WebM · 500 Mo maximum</p></div></div>
          <label className="ve-drop">
            <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={e => { setFile(e.target.files?.[0] || null); setDownloadUrl('') }} />
            <Film size={32} /><strong>{file ? file.name : 'Choisir une vidéo'}</strong><span>{file ? (file.size / 1024 / 1024).toFixed(1) + ' Mo' : 'Sélectionner un fichier depuis ce PC'}</span>
          </label>
          <form onSubmit={renderVideo}>
            <label className="ve-label">Format de sortie<select value={format} onChange={e => setFormat(e.target.value)}><option value="9:16">Vertical — 9:16 (Reels / Shorts / TikTok)</option><option value="1:1">Carré — 1:1</option><option value="16:9">Paysage — 16:9 (YouTube)</option><option value="original">Conserver le format original</option></select></label>
            <button className="ve-primary" disabled={!file || busy || worker !== 'online'}><Scissors size={17}/>{busy ? 'Traitement en cours…' : 'Lancer le rendu local'}</button>
          </form>
          <p className="ve-message">{message}</p>
          {downloadUrl && <a className="ve-download" href={downloadUrl}><Download size={17}/> Télécharger la vidéo MP4</a>}
        </div>
        <aside className="ve-card ve-info">
          <div className="ve-info-icon"><HardDrive size={22}/></div><h2>Traitement sur votre PC</h2><p>Le moteur local utilise FFmpeg pour convertir et recadrer la vidéo. Aucun envoi vers un service cloud n'est effectué par ce module.</p>
          <div className="ve-check"><ShieldCheck size={17}/> Fichiers traités localement</div>
          <button className="ve-refresh" onClick={checkWorker}><RefreshCw size={15}/> Vérifier la connexion</button>
          <div className="ve-note"><strong>Version initiale</strong><span>Le découpage intelligent, Whisper, les sous-titres animés et la timeline seront ajoutés après validation du premier rendu.</span></div>
        </aside>
      </div>
    </section>
  )
}
