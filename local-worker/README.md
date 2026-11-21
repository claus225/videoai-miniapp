# KREA VIDEO ENGINE — moteur local Windows

Prototype local : conversion/recadrage vidéo avec FFmpeg et transcription audio avec faster-whisper.

## Prérequis
- Windows 10/11
- Python 3.10 ou plus récent
- FFmpeg installé et accessible dans le PATH

## Installation
Depuis PowerShell, dans le dossier local-worker :

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
py app.py
```

Le service écoute uniquement sur 127.0.0.1:8765. Ne l'exposez pas sur Internet.

Au démarrage, le terminal affiche une clé aléatoire de sécurité. Copiez-la dans le champ « Clé de sécurité locale » de KREA VIDEO ENGINE. Elle est renouvelée à chaque démarrage du moteur. Ne la partagez pas et ne la mettez jamais dans GitHub.

Vérification : ouvrir http://127.0.0.1:8765/health ; la réponse doit contenir "ffmpeg": true.

## Utilisation
Lancer KREA STUDIO avec `npm run dev`, ouvrir l'onglet KREA VIDEO ENGINE, choisir une vidéo MP4/MOV/WebM.

- **Rendu vidéo** : recadrage et conversion MP4 par FFmpeg.
- **Sous-titres** : cliquer sur « Générer les sous-titres », modifier le texte puis exporter le fichier SRT.
- Langues proposées : détection automatique, français, anglais, espagnol, portugais et arabe.

## Modèle Whisper
Le worker utilise faster-whisper avec le modèle `tiny`, sur CPU en précision int8 pour limiter la mémoire vive. Au premier lancement, le modèle est téléchargé et mis en cache ; une connexion Internet est donc nécessaire pour cette première récupération. Les transcriptions suivantes peuvent fonctionner hors ligne si le modèle reste dans le cache.

## Avatar Studio (première intégration)

L'onglet **AVATAR STUDIO** anime localement un portrait autorisé à partir d'un enregistrement audio français. Cette première version prend un portrait PNG/JPG et un audio WAV/MP3/M4A ; la saisie de texte avec synthèse vocale française n'est pas encore disponible.

Le moteur optionnel SadTalker doit être installé dans un environnement Python séparé. Consultez [AVATAR_SETUP.md](AVATAR_SETUP.md) avant l'installation. Configurez `SADTALKER_DIR` vers le dépôt SadTalker et `SADTALKER_PYTHON` vers son interpréteur Python. Les modèles pré-entraînés doivent être installés localement.

Routes :
- `GET /api/avatar/health`
- `POST /api/avatar/generate` (clé `X-Krea-Token` obligatoire)

La génération reste locale et nécessite un PC suffisamment équipé. Elle n'a pas encore été testée sur une installation Windows complète.

## Limites et sécurité
- Le modèle tiny privilégie la légèreté ; la qualité de transcription peut varier selon le son et l'accent.
- Les sous-titres peuvent être exportés en SRT ou incrustés dans le MP4 avec trois styles ASS : Clean, Creator jaune et Minimal.
- La transcription demande les timestamps mot par mot ; le rendu ASS utilise un effet karaoké qui surligne les mots au fil de la parole lorsque les timestamps sont disponibles.
- Le bouton « Prévisualiser 8 secondes avec sous-titres » génère un court MP4 à partir du temps de départ choisi ; il permet de contrôler le style et la synchronisation avant le rendu complet. L'aperçu est stocké dans `local-worker/data/outbox`.
- Modifier le texte d'un segment dans l'interface désactive son ancien minutage mot par mot pour éviter une synchronisation trompeuse ; ce segment revient alors en sous-titre statique.
- Pas encore de découpage intelligent, timeline éditable ou timeline éditable.
- Les exports vidéo restent dans `local-worker/data/outbox` jusqu'à suppression manuelle.
- Prototype local uniquement : ne pas le déployer publiquement. L’authentification par clé éphémère et le contrôle d’origine sont une première barrière, pas une garantie absolue. Il reste à ajouter des tests de sécurité, une politique de nettoyage automatique, une validation approfondie des médias, des limites de concurrence et une revue avant diffusion client.
- Le dépôt GitHub est public : n’y ajoutez jamais de mot de passe, clé API, jeton ou fichier `.env`.
