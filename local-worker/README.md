# KREA VIDEO ENGINE — moteur local Windows

Version initiale : conversion et recadrage vidéo local avec FFmpeg. Les fichiers restent sur le PC.

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
Lancer KREA STUDIO avec `npm run dev`, ouvrir l'onglet KREA VIDEO ENGINE, choisir une vidéo MP4/MOV/WebM (500 Mo max), sélectionner le format puis lancer le rendu.

## Limites de cette version
- Conversion et recadrage FFmpeg uniquement.
- Pas encore de transcription Whisper, de sélection intelligente des meilleurs passages, de timeline éditable ni de sous-titres.
- Les exports restent dans local-worker/data/outbox jusqu'à suppression manuelle.
- Le worker est un prototype local : ne pas le déployer en public. Une authentification locale et une politique de nettoyage automatique seront requises avant une diffusion client.
