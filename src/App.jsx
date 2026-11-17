import { useMemo, useState } from 'react'
import {
  Activity, BarChart3, CalendarDays, Check, ChevronDown, Clock3,
  Facebook, FileText, HelpCircle, Home, Instagram, Layers3, Link2,
  MessageCircle, Plus, Send, Settings, ShieldCheck, Sparkles,
  Video, X, Youtube, Menu
} from 'lucide-react'

const channels = [
  { id: 'instagram', name: 'Instagram', Icon: Instagram, color: '#e879a8' },
  { id: 'facebook', name: 'Facebook', Icon: Facebook, color: '#6ba7ff' },
  { id: 'youtube', name: 'YouTube', Icon: Youtube, color: '#ff7777' },
  { id: 'tiktok', name: 'TikTok', Icon: Video, color: '#e7eaf2' },
]

const navigation = [
  { id: 'overview', label: 'Vue générale', Icon: Home },
  { id: 'compose', label: 'Créer une publication', Icon: Plus },
  { id: 'calendar', label: 'Calendrier', Icon: CalendarDays },
  { id: 'channels', label: 'Comptes sociaux', Icon: Layers3 },
  { id: 'analytics', label: 'Statistiques', Icon: BarChart3 },
  { id: 'comments', label: 'Commentaires', Icon: MessageCircle },
]

function App() {
  const [page, setPage] = useState('overview')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [posts, setPosts] = useState([])
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState('')
  const [selectedChannels, setSelectedChannels] = useState(['instagram', 'facebook', 'youtube', 'tiktok'])
  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [mediaName, setMediaName] = useState('')

  const scheduledCount = posts.filter(post => post.status === 'scheduled').length
  const draftCount = posts.filter(post => post.status === 'draft').length
  const connectedCount = 0
  const selectedNames = channels.filter(channel => selectedChannels.includes(channel.id)).map(channel => channel.name)

  const upcomingPosts = useMemo(
    () => [...posts].filter(post => post.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date)),
    [posts]
  )

  function changePage(id) {
    setPage(id)
    setMobileMenu(false)
    setNotice('')
  }

  function toggleChannel(id) {
    setSelectedChannels(current => current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id])
  }

  function savePost(status) {
    if (!content.trim()) {
      setNotice('Ajoutez un texte avant d’enregistrer votre publication.')
      return
    }
    if (status === 'scheduled' && (!scheduledAt || new Date(scheduledAt) <= new Date())) {
      setNotice('Choisissez une date et une heure dans le futur.')
      return
    }
    if (status === 'scheduled' && selectedChannels.length === 0) {
      setNotice('Sélectionnez au moins un réseau social.')
      return
    }
    setPosts(current => [{
      id: Date.now(),
      content: content.trim(),
      date: status === 'scheduled' ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
      channels: status === 'scheduled' ? [...selectedChannels] : [],
      status,
    }, ...current])
    setContent('')
    setScheduledAt('')
    setMediaName('')
    setNotice(status === 'scheduled'
      ? 'Publication enregistrée dans le calendrier de démonstration. Aucun réseau n’a reçu le contenu.'
      : 'Brouillon enregistré dans cette session.')
    setPage(status === 'scheduled' ? 'calendar' : 'overview')
  }

  function openConnection(channelName) {
    setModal(channelName)
  }

  function renderPost(post) {
    return (
      <article className="post-row" key={post.id}>
        <div className="post-preview"><FileText size={18} /></div>
        <div className="post-main">
          <p>{post.content}</p>
          <div className="post-meta">
            <span>{new Date(post.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            {post.channels.length > 0 && <span>· {post.channels.map(id => channels.find(channel => channel.id === id)?.name).join(', ')}</span>}
          </div>
        </div>
        <span className={`status-pill ${post.status}`}>{post.status === 'scheduled' ? 'Programmé (démo)' : 'Brouillon'}</span>
      </article>
    )
  }

  return (
    <div className="app-frame">
      <aside className={mobileMenu ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <div className="brand-symbol">K<span>.</span></div>
          <div><strong>KREA STUDIO</strong><small>SOCIAL MANAGER</small></div>
          <button className="close-menu" onClick={() => setMobileMenu(false)} aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="workspace-label">ESPACE DE TRAVAIL</div>
        <nav className="side-nav">
          {navigation.map(({ id, label, Icon }) => (
            <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => changePage(id)}>
              <Icon size={18} /><span>{label}</span>
              {id === 'calendar' && scheduledCount > 0 && <b>{scheduledCount}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><ShieldCheck size={18} /></div><strong>Vos comptes restent protégés</strong><p>Les connexions utiliseront les autorisations officielles des plateformes.</p></div>
          <button className="nav-item" onClick={() => setModal('Paramètres')}><Settings size={18} /><span>Paramètres</span></button>
          <div className="profile-row"><div className="avatar">K</div><div><strong>KREA STUDIO</strong><small>Compte administrateur</small></div><ChevronDown size={15} /></div>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Fermer le menu" />}

      <main className="main-area">
        <header className="top-header">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Ouvrir le menu"><Menu /></button>
          <div className="breadcrumb">KREA STUDIO <span>/</span> {navigation.find(item => item.id === page)?.label || 'Paramètres'}</div>
          <div className="header-right"><span className="demo-tag"><span /> MODE APERÇU</span><button className="icon-button" onClick={() => setModal('Centre d’aide')} aria-label="Aide"><HelpCircle size={18} /></button><div className="avatar small">K</div></div>
        </header>

        <div className="content-wrap">
          {page === 'overview' && <>
            <div className="page-heading"><div><div className="eyebrow">VOTRE ESPACE SOCIAL</div><h1>Vue générale</h1><p>Préparez et organisez vos contenus depuis un seul endroit.</p></div><button className="primary-button" onClick={() => changePage('compose')}><Plus size={17} /> Nouvelle publication</button></div>
            <div className="notice-banner"><Sparkles size={19} /><div><strong>Bienvenue dans KREA STUDIO Social Manager</strong><p>Le tableau de bord est en mode aperçu. Les connexions officielles et l’envoi automatique seront activés après la configuration des API et du serveur.</p></div></div>
            <section className="stats-grid">
              <div className="stat-card"><div className="stat-icon blue"><Layers3 size={19} /></div><span>Comptes connectés</span><strong>{connectedCount}<small> / 4</small></strong><em>Aucun compte connecté</em></div>
              <div className="stat-card"><div className="stat-icon violet"><CalendarDays size={19} /></div><span>Publications programmées</span><strong>{scheduledCount}</strong><em>Dans cette session de démonstration</em></div>
              <div className="stat-card"><div className="stat-icon cyan"><FileText size={19} /></div><span>Brouillons</span><strong>{draftCount}</strong><em>Enregistrés dans cette session</em></div>
              <div className="stat-card"><div className="stat-icon green"><Activity size={19} /></div><span>Statistiques disponibles</span><strong>—</strong><em>À activer après connexion</em></div>
            </section>
            <div className="section-title-row"><div><h2>Vos réseaux sociaux</h2><p>Connectez chaque plateforme avec son autorisation officielle.</p></div><button className="subtle-button" onClick={() => changePage('channels')}>Gérer les comptes <span>→</span></button></div>
            <section className="channel-grid">
              {channels.map(({ id, name, Icon, color }) => <div className="channel-card" key={id}><div className="channel-brand" style={{ '--brand-color': color }}><Icon size={22} /></div><div className="channel-info"><strong>{name}</strong><small><i /> Non connecté</small></div><button className="connect-button" onClick={() => openConnection(name)}>Connecter</button></div>)}
            </section>
            <div className="section-title-row recent-title"><div><h2>Publications à venir</h2><p>Votre planning de contenu.</p></div><button className="subtle-button" onClick={() => changePage('calendar')}>Voir le calendrier <span>→</span></button></div>
            <section className="panel">{upcomingPosts.length ? upcomingPosts.slice(0, 4).map(renderPost) : <div className="empty-state"><div className="empty-icon"><CalendarDays size={22} /></div><strong>Aucune publication programmée</strong><p>Vos publications planifiées apparaîtront ici.</p><button className="secondary-button" onClick={() => changePage('compose')}>Créer une publication</button></div>}</section>
          </>}

          {page === 'compose' && <>
            <div className="page-heading"><div><div className="eyebrow">STUDIO DE CONTENU</div><h1>Créer une publication</h1><p>Préparez un contenu et choisissez les réseaux à cibler.</p></div></div>
            <div className="compose-layout">
              <section className="panel compose-panel">
                <div className="panel-heading"><div><h2>Contenu de la publication</h2><p>Rédigez le texte qui accompagnera votre contenu.</p></div><span className="step-label">ÉTAPE 1</span></div>
                <label className="field-label">Texte de la publication<textarea value={content} onChange={e => setContent(e.target.value)} rows={7} placeholder="Que souhaitez-vous partager avec votre audience ?" /><small>{content.length} caractères</small></label>
                <label className="field-label">Média (facultatif)<div className="upload-box"><input type="file" accept="image/*,video/*" onChange={e => setMediaName(e.target.files?.[0]?.name || '')} /><div className="upload-content"><Plus size={20} /><strong>{mediaName || 'Ajouter une image ou une vidéo'}</strong><small>Fichier sélectionné localement pour cette démonstration</small></div></div></label>
                <div className="panel-heading channel-heading"><div><h2>Choisir les réseaux</h2><p>La publication sera préparée pour les plateformes sélectionnées.</p></div><span className="step-label">ÉTAPE 2</span></div>
                <div className="compose-channels">{channels.map(({ id, name, Icon, color }) => <label className={selectedChannels.includes(id) ? 'compose-channel selected' : 'compose-channel'} key={id}><input type="checkbox" checked={selectedChannels.includes(id)} onChange={() => toggleChannel(id)} /><Icon size={19} style={{ color }} /><span>{name}</span><small>À connecter</small></label>)}</div>
                <div className="panel-heading schedule-heading"><div><h2>Programmer</h2><p>Choisissez la date et l’heure souhaitées.</p></div><span className="step-label">ÉTAPE 3</span></div>
                <label className="field-label">Date et heure<input className="date-input" type="datetime-local" value={scheduledAt} min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} onChange={e => setScheduledAt(e.target.value)} /></label>
                {notice && <p className="inline-notice">{notice}</p>}
                <div className="form-actions"><button className="secondary-button" onClick={() => savePost('draft')}>Enregistrer en brouillon</button><button className="primary-button" onClick={() => savePost('scheduled')}><Clock3 size={16} /> Programmer (démo)</button></div>
                <p className="disclaimer">Important : cette version enregistre votre planification uniquement dans l’interface. Elle ne publie rien sur Instagram, Facebook, YouTube ou TikTok.</p>
              </section>
              <aside className="panel tips-panel"><div className="tips-icon"><Sparkles size={20} /></div><h3>Conseil IA</h3><p>L’assistant IA pourra proposer des légendes, des hashtags et adapter le ton de votre message à chaque réseau.</p><span className="coming-soon">À DÉVELOPPER</span><div className="tips-divider" /><h3>Avant de programmer</h3><ul><li>Vérifiez le texte et les liens.</li><li>Choisissez les bons réseaux.</li><li>Assurez-vous que vos comptes sont autorisés.</li></ul></aside>
            </div>
          </>}

          {page === 'calendar' && <>
            <div className="page-heading"><div><div className="eyebrow">PLANIFICATION</div><h1>Calendrier</h1><p>Retrouvez vos contenus enregistrés et leurs dates prévues.</p></div><button className="primary-button" onClick={() => changePage('compose')}><Plus size={17} /> Planifier</button></div>
            <div className="panel calendar-panel"><div className="calendar-top"><div><h2>Planning des publications</h2><p>Les éléments ci-dessous sont des planifications locales de démonstration.</p></div><span className="demo-tag"><span /> APERÇU</span></div>{upcomingPosts.length ? upcomingPosts.map(renderPost) : <div className="empty-state"><div className="empty-icon"><CalendarDays size={22} /></div><strong>Votre calendrier est vide</strong><p>Créez votre première publication programmée.</p><button className="primary-button" onClick={() => changePage('compose')}>Créer une publication</button></div>}</div>
          </>}

          {page === 'channels' && <>
            <div className="page-heading"><div><div className="eyebrow">CONNEXIONS OFFICIELLES</div><h1>Comptes sociaux</h1><p>Centralisez vos profils sans partager vos mots de passe.</p></div></div>
            <div className="notice-banner"><ShieldCheck size={20} /><div><strong>Connexion sécurisée par autorisation</strong><p>Chaque plateforme devra autoriser KREA STUDIO via son système officiel OAuth. Les boutons ci-dessous présentent l’état de préparation : aucune connexion réelle n’est encore configurée.</p></div></div>
            <div className="channel-list">{channels.map(({ id, name, Icon, color }) => <div className="channel-list-card" key={id}><div className="channel-brand large" style={{ '--brand-color': color }}><Icon size={24} /></div><div className="channel-info"><strong>{name}</strong><small>Publication et fonctions selon les autorisations de l’API</small></div><span className="not-connected">Non connecté</span><button className="connect-button" onClick={() => openConnection(name)}>Détails</button></div>)}</div>
            <div className="api-note"><strong>À prévoir pour activer les connexions</strong><p>Créer les applications développeur officielles, configurer les URL de retour, obtenir les validations nécessaires et protéger les jetons d’accès côté serveur. Les possibilités de publication varient selon chaque plateforme et le type de compte.</p></div>
          </>}

          {page === 'analytics' && <>
            <div className="page-heading"><div><div className="eyebrow">MESURE & PERFORMANCE</div><h1>Statistiques</h1><p>Suivez les résultats de vos publications sur les réseaux connectés.</p></div></div>
            <div className="panel empty-state tall"><div className="empty-icon"><BarChart3 size={24} /></div><strong>Les statistiques apparaîtront ici</strong><p>Connectez vos comptes et autorisez l’accès aux données analytiques. Aucun chiffre n’est affiché tant qu’il n’existe pas de données réelles.</p><button className="secondary-button" onClick={() => changePage('channels')}>Voir les connexions</button></div>
          </>}

          {page === 'comments' && <>
            <div className="page-heading"><div><div className="eyebrow">COMMUNAUTÉ</div><h1>Commentaires</h1><p>Centralisez les échanges lorsque les API des plateformes le permettent.</p></div></div>
            <div className="panel empty-state tall"><div className="empty-icon"><MessageCircle size={24} /></div><strong>Aucun commentaire disponible</strong><p>La lecture et la gestion des commentaires nécessitent des comptes connectés et des autorisations spécifiques.</p><button className="secondary-button" onClick={() => changePage('channels')}>Configurer les comptes</button></div>
          </>}
        </div>
        <footer className="app-footer"><span>© 2026 KREA STUDIO</span><span>Social Manager <i /> Mode aperçu — aucune publication envoyée</span></footer>
      </main>

      {notice && page !== 'compose' && <div className="toast"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Fermer"><X size={15} /></button></div>}
      {modal && <div className="modal-backdrop" onClick={() => setModal('')}><div className="modal-card" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setModal('')} aria-label="Fermer"><X size={18} /></button><div className="modal-icon"><ShieldCheck size={24} /></div><div className="eyebrow">CONFIGURATION REQUISE</div><h2>{modal === 'Centre d’aide' || modal === 'Paramètres' ? modal : `Connexion ${modal}`}</h2><p>{modal === 'Centre d’aide' ? 'Le centre d’aide détaillé sera ajouté dans une prochaine étape.' : modal === 'Paramètres' ? 'Les paramètres du compte, les préférences de publication et la sécurité seront configurés dans les prochaines étapes.' : `La connexion ${modal} n’est pas encore active. Il faut d’abord créer et configurer l’application développeur officielle, puis mettre en place le serveur sécurisé qui gérera l’autorisation.`}</p><div className="modal-warning">Aucun mot de passe ne vous sera demandé ici. Ne partagez jamais vos identifiants de réseaux sociaux.</div><button className="primary-button full" onClick={() => setModal('')}>Compris</button></div></div>}
    </div>
  )
}

export default App
