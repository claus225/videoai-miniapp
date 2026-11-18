import { useEffect, useState } from 'react'
import { Clapperboard, Download, Film, HardDrive, RefreshCw, Scissors, ShieldCheck, UploadCloud, Captions, Sparkles } from 'lucide-react'
import './video-engine.css'

const WORKER = 'http://127.0.0.1:8765'

function srtTime(seconds) {
  const ms = Math.max(0, Math.round(seconds * 1000))
  const hours = String(Math.floor(ms / 3600000)).padStart(2, '0')
  const minutes = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0')
  const secs = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
  const millis = String(ms % 1000).padStart(3, '0')
  return `${hours}:${minutes}:${secs},${millis}`
}

export default function VideoEngine() {
  const [worker, setWorker] = useState('checking')
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('9:16')
  const [busy, setBusy] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [language, setLanguage] = useState('auto')
  const [captionStyle, setCaptionStyle] = useState('clean')
  const [segments, setSegments] = useState([])
  const [detectedLanguage, setDetectedLanguage] = useState('')
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

  async function transcribeVideo() {
    if (!file) return
    setTranscribing(true)
    setSegments([])
    setDownloadUrl('')
    setMessage('Extraction de l’audio et transcription locale… Le premier lancement peut télécharger le modèle Whisper.')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('language', language)
      const response = await fetch(WORKER + '/api/transcribe', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'La transcription a échoué.')
      setSegments(data.segments || [])
      setDetectedLanguage(data.language || '')
      setMessage(`Transcription terminée : ${data.segments?.length || 0} segments détectés.`)
    } catch (error) {
      setMessage(error.message || 'Impossible de générer les sous-titres.')
    } finally {
      setTranscribing(false)
    }
  }

  async function renderWithCaptions() {
    if (!file || !segments.length) return
    setBusy(true)
    setDownloadUrl('')
    setMessage('Incrustation des sous-titres et rendu MP4 en cours sur votre PC…')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('format', format)
      body.append('style', captionStyle)
      body.append('subtitles', JSON.stringify(segments))
      const response = await fetch(WORKER + '/api/render-subtitled', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Le rendu avec sous-titres a échoué.')
      setDownloadUrl(WORKER + data.download_url)
      setMessage('Vidéo terminée : les sous-titres sont incrustés dans le MP4.')
    } catch (error) {
      setMessage(error.message || 'Impossible d’incruster les sous-titres.')
    } finally {
      setBusy(false)
    }
  }

  function updateSegment(index, text) {
    setSegments(current => current.map((segment, i) => i === index ? { ...segment, text } : segment))
  }

  function downloadSrt() {
    const srt = segments.map((segment, index) =>
      `${index + 1}\n${srtTime(segment.start)} --> ${srtTime(segment.end)}\n${segment.text}\n`
    ).join('\n')
    const url = URL.createObjectURL(new Blob([srt], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'krea-sous-titres.srt'
    link.click()
    URL.revokeObjectURL(url)
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
            <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={e => { setFile(e.target.files?.[0] || null); setDownloadUrl(''); setSegments([]); setDetectedLanguage('') }} />
            <Film size={32} /><strong>{file ? file.name : 'Choisir une vidéo'}</strong><span>{file ? (file.size / 1024 / 1024).toFixed(1) + ' Mo' : 'Sélectionner un fichier depuis ce PC'}</span>
          </label>
          <form onSubmit={renderVideo}>
            <label className="ve-label">Format de sortie<select value={format} onChange={e => setFormat(e.target.value)}><option value="9:16">Vertical — 9:16 (Reels / Shorts / TikTok)</option><option value="1:1">Carré — 1:1</option><option value="16:9">Paysage — 16:9 (YouTube)</option><option value="original">Conserver le format original</option></select></label>
            <button className="ve-primary" disabled={!file || busy || transcribing || worker !== 'online'}><Scissors size={17}/>{busy ? 'Traitement en cours…' : 'Lancer le rendu local'}</button>
          </form>
          <div className="ve-caption-tools">
            <div className="ve-card-title"><Captions /><div><h2>Sous-titres automatiques</h2><p>Whisper local · modèle léger « tiny »</p></div></div>
            <label className="ve-label">Langue de la vidéo
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="auto">Détection automatique</option><option value="fr">Français</option><option value="en">Anglais</option><option value="es">Espagnol</option><option value="pt">Portugais</option><option value="ar">Arabe</option>
              </select>
            </label>
            <button type="button" className="ve-primary" disabled={!file || transcribing || busy || worker !== 'online'} onClick={transcribeVideo}>
              <Captions size={17}/>{transcribing ? 'Transcription en cours…' : 'Générer les sous-titres'}
            </button>
            {detectedLanguage && <p className="ve-message">Langue détectée : {detectedLanguage}</p>}
            {segments.length > 0 && <div className="ve-transcript">
              <strong>Modifier le texte avant export</strong>
              {segments.map((segment, index) => <label className="ve-segment" key={index}>
                <span>{srtTime(segment.start).slice(0, 8)} – {srtTime(segment.end).slice(0, 8)}</span>
                <textarea value={segment.text} rows={2} onChange={event => updateSegment(index, event.target.value)} />
              </label>)}
              <button type="button" className="ve-download" onClick={downloadSrt}><Download size={17}/> Télécharger les sous-titres SRT</button>
              <div className="ve-style-picker">
                <label className="ve-label">Style visuel
                  <select value={captionStyle} onChange={event => setCaptionStyle(event.target.value)}>
                    <option value="clean">Clean — blanc, contour discret</option>
                    <option value="bold">Creator — jaune, caractères épais</option>
                    <option value="minimal">Minimal — blanc, contour fin</option>
                  </select>
                </label>
                <div className={`ve-caption-preview ${captionStyle}`}>Exemple de sous-titre</div>
                <button type="button" className="ve-primary" disabled={busy || worker !== 'online'} onClick={renderWithCaptions}>
                  <Sparkles size={17}/>{busy ? 'Incrustation en cours…' : 'Créer la vidéo avec sous-titres'}
                </button>
              </div>
            </div>}
          </div>
          <p className="ve-message">{message}</p>
          {downloadUrl && <a className="ve-download" href={downloadUrl}><Download size={17}/> Télécharger la vidéo MP4</a>}
        </div>
        <aside className="ve-card ve-info">
          <div className="ve-info-icon"><HardDrive size={22}/></div><h2>Traitement sur votre PC</h2><p>FFmpeg convertit, recadre et incruste les sous-titres. Whisper transcrit l’audio localement. Le premier usage de Whisper nécessite le téléchargement de son modèle.</p>
          <div className="ve-check"><ShieldCheck size={17}/> Traitement local après installation</div>
          <button className="ve-refresh" onClick={checkWorker}><RefreshCw size={15}/> Vérifier la connexion</button>
          <div className="ve-note"><strong>Styles disponibles</strong><span>Clean, Creator jaune et Minimal. Les sous-titres sont incrustés dans le MP4 final ; le rendu nécessite un nouvel encodage vidéo.</span></div>
        </aside>
      </div>
    </section>
  )
}
