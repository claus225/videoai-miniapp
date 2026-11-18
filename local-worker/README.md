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

Vérification : ouvrir http://127.0.0.1:8765/health ; la réponse doit contenir "ffmpeg": true.

## Utilisation
Lancer KREA STUDIO avec `npm run dev`, ouvrir l'onglet KREA VIDEO ENGINE, choisir une vidéo MP4/MOV/WebM.

- **Rendu vidéo** : recadrage et conversion MP4 par FFmpeg.
- **Sous-titres** : cliquer sur « Générer les sous-titres », modifier le texte puis exporter le fichier SRT.
- Langues proposées : détection automatique, français, anglais, espagnol, portugais et arabe.

## Modèle Whisper
Le worker utilise faster-whisper avec le modèle `tiny`, sur CPU en précision int8 pour limiter la mémoire vive. Au premier lancement, le modèle est téléchargé et mis en cache ; une connexion Internet est donc nécessaire pour cette première récupération. Les transcriptions suivantes peuvent fonctionner hors ligne si le modèle reste dans le cache.

## Limites et sécurité
- Le modèle tiny privilégie la légèreté ; la qualité de transcription peut varier selon le son et l'accent.
- Les sous-titres SRT sont exportés séparément, pas encore incrustés dans la vidéo.
- Pas encore de découpage intelligent, timeline éditable ni styles animés.
- Les exports vidéo restent dans `local-worker/data/outbox` jusqu'à suppression manuelle.
- Prototype local uniquement : ne pas le déployer publiquement. Une authentification locale et une politique de nettoyage automatique sont nécessaires avant diffusion client.
