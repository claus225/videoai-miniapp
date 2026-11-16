import { useState } from 'react'
import {
  ArrowUpRight, Menu, X, Megaphone, Code2, CloudUpload,
  Crown, Sparkles, Check, Instagram, Facebook, Youtube,
  Globe2, Layers3, MessageCircle, ChevronDown, Palette,
  Video, Smartphone, ShoppingBag, Search, Bot
} from 'lucide-react'

const services = [
  {
    number: '01',
    price: '10 000 FCFA',
    scope: '1 visuel, 2 retouches. Impression non comprise.',
    icon: Megaphone,
    title: 'Affiches publicitaires',
    description: 'Des visuels qui attirent le regard et donnent une vraie identité à votre marque.',
    tags: ['Flyers', 'Affiches', 'Visuels promotionnels'],
  },
  {
    number: '02',
    price: '25 000 FCFA',
    scope: 'Logo simple, 2 pistes et 2 retouches. Fichiers PNG/JPG.',
    icon: Palette,
    title: 'Création de logo professionnel',
    description: 'Un logo original et cohérent pour rendre votre marque reconnaissable.',
    tags: ['Logo', 'Charte graphique', 'Déclinaisons'],
  },
  {
    number: '03',
    price: '90 000 FCFA',
    scope: 'Site vitrine one-page responsive. Domaine et hébergement en supplément.',
    icon: Globe2,
    title: 'Création de sites web',
    description: 'Des sites modernes, rapides et adaptés aux téléphones comme aux ordinateurs.',
    tags: ['Site vitrine', 'Landing page', 'Site professionnel'],
  },
  {
    number: '04',
    price: '300 000 FCFA',
    scope: 'Prototype web simple. Fonctionnalités avancées et frais techniques sur devis.',
    icon: CloudUpload,
    title: 'Création de SaaS et outils web',
    description: 'Des applications web utiles pour transformer une idée en service numérique.',
    tags: ['Outils IA', 'Tableaux de bord', 'Automatisation'],
  },
  {
    number: '05',
    price: '45 000 FCFA / mois',
    scope: '8 publications/mois sur 1 réseau. Publicité payante non comprise.',
    icon: Smartphone,
    title: 'Gestion des réseaux sociaux',
    description: 'Une présence en ligne organisée avec des contenus adaptés à votre activité.',
    tags: ['Calendrier éditorial', 'Visuels', 'Conseils de publication'],
  },
  {
    number: '06',
    price: '15 000 FCFA',
    scope: '1 vidéo verticale jusqu’à 60 secondes. Rushes fournis par le client.',
    icon: Video,
    title: 'Montage vidéo court',
    description: 'Des vidéos montées pour présenter une activité ou dynamiser vos contenus.',
    tags: ['Reels', 'TikTok', 'YouTube Shorts'],
  },
  {
    number: '07',
    price: '180 000 FCFA',
    scope: 'Boutique simple, jusqu’à 10 produits, commande par WhatsApp. Frais externes en supplément.',
    icon: ShoppingBag,
    title: 'Création de boutique en ligne',
    description: 'Une vitrine e-commerce pour présenter vos produits et recevoir des commandes.',
    tags: ['Catalogue', 'Fiches produits', 'Boutique'],
  },
  {
    number: '08',
    price: '85 000 FCFA',
    scope: 'Assistant FAQ simple. Abonnements IA et connexions externes non compris.',
    icon: Bot,
    title: 'Automatisation et assistants IA',
    description: 'Des outils simples pour faciliter les tâches répétitives et les échanges clients.',
    tags: ['Chatbot', 'FAQ', 'Automatisation'],
  },
  {
    number: '09',
    price: '30 000 FCFA',
    scope: 'Optimisation de base jusqu’à 5 pages. Aucun classement Google garanti.',
    icon: Search,
    title: 'Optimisation web et référencement',
    description: 'Des améliorations de base pour rendre votre site plus clair et mieux structuré.',
    tags: ['SEO de base', 'Performance', 'Accessibilité'],
  },
]

const steps = [
  ['01', 'On échange', 'Vous nous présentez votre idée, vos objectifs et vos besoins.'],
  ['02', 'On conçoit', 'Nous préparons une proposition claire et une direction créative.'],
  ['03', 'On réalise', 'Nous construisons votre projet et vous le présentons pour validation.'],
]

function Brand() {
  return (
    <a className="brand" href="#accueil" aria-label="KREA STUDIO, accueil">
      <span className="brand-mark"><Crown size={19} strokeWidth={1.8} /><b>K</b></span>
      <span className="brand-name">KREA<span>STUDIO</span><small>CI · DIGITAL · WEB · IA</small></span>
    </a>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sent, setSent] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="container nav-wrap">
          <Brand />
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
            <a href="#accueil" onClick={closeMenu}>Accueil</a>
            <a href="#services" onClick={closeMenu}>Services</a>
            <a href="#methode" onClick={closeMenu}>Notre méthode</a>
            <a className="nav-cta" href="#contact" onClick={closeMenu}>Parlons du projet <ArrowUpRight size={16} /></a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero container" id="accueil">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> STUDIO DIGITAL · CÔTE D'IVOIRE</div>
            <h1>Vos idées méritent<br />de devenir <span className="gradient-text">réelles.</span></h1>
            <p className="hero-lead">Nous transformons vos idées en projets digitaux avec du design, du web et de l'intelligence artificielle.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#services">Découvrir nos services <ArrowUpRight size={18} /></a>
              <a className="text-link" href="#contact">Démarrer un projet <span>↗</span></a>
            </div>
            <div className="hero-proof">
              <span className="proof-icon"><Sparkles size={17} /></span>
              <span><b>Créativité. Technologie. Ambition.</b><small>Une idée à la fois, un projet à la fois.</small></span>
            </div>
          </div>
          <div className="hero-art" aria-label="Emblème KREA STUDIO">
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <div className="logo-halo">
              <div className="logo-crown"><Crown size={66} strokeWidth={1.15} /></div>
              <div className="logo-k">K<span className="play-cut">▶</span></div>
              <div className="logo-word">KREA</div>
              <div className="logo-studio">STUDIO</div>
              <div className="logo-caption">DIGITAL <i /> WEB <i /> IA</div>
              <div className="logo-line" />
              <div className="logo-tagline">Transformons vos idées<br />en projets digitaux</div>
            </div>
            <div className="floating-chip chip-top"><Code2 size={16} /> WEB & IA</div>
            <div className="floating-chip chip-bottom"><Sparkles size={16} /> CRÉATIVITÉ SANS LIMITE</div>
          </div>
        </section>

        <section className="services-section section container" id="services">
          <div className="section-heading">
            <div><div className="eyebrow">CE QUE NOUS FAISONS</div><h2>Le digital, <span className="gradient-text">bien pensé.</span></h2></div>
            <p>Des solutions créatives et numériques pour donner de la force à vos projets. Prix de départ en FCFA.</p>
          </div>
          <div className="service-grid">
            {services.map(({ number, icon: Icon, title, description, tags, price, scope }) => (
              <article className="service-card" key={number}>
                <div className="card-top"><span className="service-icon"><Icon size={23} /></span><span className="card-number">{number}</span></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="tag-list">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                <div className="service-price"><small>À partir de</small><strong>{price}</strong><span>{scope}</span></div>
                <a href="#contact" className="card-link">Demander un devis <ArrowUpRight size={16} /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="manifesto section">
          <div className="container manifesto-inner">
            <div className="manifesto-symbol"><Crown size={34} /><span>K</span></div>
            <div><div className="eyebrow">L'ESPRIT KREA</div><h2>Pas juste une présence en ligne.<br /><span className="gradient-text">Une identité qui marque.</span></h2><p>Chaque projet commence par une vision. Notre rôle est de lui donner une forme claire, utile et mémorable.</p></div>
          </div>
        </section>

        <section className="process-section section container" id="methode">
          <div className="section-heading">
            <div><div className="eyebrow">SIMPLE ET TRANSPARENT</div><h2>De l'idée au <span className="gradient-text">résultat.</span></h2></div>
            <p>Une méthode claire pour avancer ensemble, sans promesses floues.</p>
          </div>
          <div className="steps-grid">
            {steps.map(([number, title, description]) => <div className="step" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></div>)}
          </div>
        </section>

        <section className="contact-section section container" id="contact">
          <div className="contact-panel">
            <div className="contact-copy"><div className="eyebrow"><span className="status-dot" /> À VOUS DE JOUER</div><h2>On donne vie<br />à votre <span className="gradient-text">prochaine idée ?</span></h2><p>Présentez-nous votre projet. Nous pourrons échanger sur vos besoins et les prochaines étapes.</p><div className="contact-note"><MessageCircle size={18} /><span>Un premier échange pour mieux comprendre votre vision.</span></div><div className="whatsapp-contact"><p>Contactez KREA STUDIO sur WhatsApp :</p><a className="button button-primary" href="https://wa.me/2250714128268?text=Bonjour%20KREA%20STUDIO%2C%20je%20souhaite%20parler%20d'un%20projet." target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp · 07 14 12 82 68</a><a className="button button-secondary" href="https://wa.me/2250758252235?text=Bonjour%20KREA%20STUDIO%2C%20je%20souhaite%20parler%20d'un%20projet." target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp · 07 58 25 22 35</a></div></div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <label>Votre nom<input required name="name" placeholder="Comment vous appeler ?" /></label>
              <label>Votre adresse e-mail<input required type="email" name="email" placeholder="vous@exemple.com" /></label>
              <label>Votre projet<select name="project" defaultValue=""><option value="" disabled>Choisir un service</option><option>Affiche publicitaire</option><option>Création de logo professionnel</option><option>Création de site web</option><option>Création de SaaS et outils web</option><option>Gestion des réseaux sociaux</option><option>Montage vidéo court</option><option>Création de boutique en ligne</option><option>Automatisation et assistants IA</option><option>Optimisation web et référencement</option><option>Autre projet digital</option></select><ChevronDown className="select-chevron" size={16} /></label>
              <label>Quelques détails<textarea required name="message" rows="3" placeholder="Parlez-nous de votre idée..." /></label>
              <button className="button button-primary submit-button" type="submit">Préparer ma demande <ArrowUpRight size={18} /></button>
              {sent && <p className="form-feedback"><Check size={16} /> Formulaire de démonstration : aucun message n'a été envoyé. Le contact sera activé après configuration.</p>}
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner"><Brand /><p>© {new Date().getFullYear()} KREA STUDIO CI. Tous droits réservés.</p><div className="social-icons"><span aria-label="Instagram"><Instagram size={17} /></span><span aria-label="Facebook"><Facebook size={17} /></span><span aria-label="YouTube"><Youtube size={17} /></span></div></div>
      </footer>
    </div>
  )
}

export default App