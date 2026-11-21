# KREA STUDIO — Avatar vidéo local

## État de cette première intégration

La branche `feature/krea-avatar-video` ajoute un écran Avatar Studio et une route locale de génération fondée sur SadTalker.

Le flux actuel est volontairement limité à :
1. Un portrait PNG/JPG/JPEG dont l'utilisateur détient les droits ou l'autorisation.
2. Un enregistrement audio en français WAV/MP3/M4A.
3. Une vidéo MP4 rendue localement avec SadTalker.

La saisie de texte et la synthèse vocale française ne sont pas encore intégrées. L'interface l'indique explicitement : aucun faux rendu ni audio fictif n'est produit.

## Installation moteur

Le worker KREA actuel et SadTalker ont des environnements Python différents. Ne pas installer les dépendances SadTalker directement dans l'environnement du worker sans validation.

- Worker KREA : Python 3.10+ et FFmpeg.
- SadTalker : suivre le README officiel du projet pour sa version Python/PyTorch et ses modèles.
- Définir `SADTALKER_DIR` vers le dossier contenant `inference.py`.
- Définir `SADTALKER_PYTHON` vers l'interpréteur Python de l'environnement SadTalker.
- Les modèles/checkpoints doivent être installés localement avant que le statut passe à « Moteur prêt ».

Par défaut, le dossier attendu est `local-worker/SadTalker`. Le statut `/api/avatar/health` vérifie la présence de `inference.py` et du dossier `checkpoints`.

## Routes ajoutées

- `GET /api/avatar/health` : état d'installation, sans exposer de secret.
- `POST /api/avatar/generate` : portrait + audio, protégé par la clé éphémère `X-Krea-Token`.
- Le MP4 final réutilise la route locale `GET /api/download/{job_id}`.

Les fichiers entrants sont limités à 15 Mo pour le portrait et 40 Mo pour l'audio. Le lancement du moteur utilise une liste d'arguments de processus, jamais un shell. Le worker reste lié à `127.0.0.1`.

## Sécurité et usage responsable

- Utiliser uniquement une image et une voix personnelles ou explicitement autorisées.
- Ne pas créer de contenu destiné à usurper l'identité d'une personne ou à tromper le public.
- Identifier les vidéos comme générées ou animées par IA.
- Ne pas exposer le worker local sur Internet.
- Vérifier séparément les licences des modèles pré-entraînés et de chaque composant tiers avant toute diffusion commerciale.

## Tests restant à faire

Cette intégration n'a pas encore été exécutée sur un PC Windows avec les modèles SadTalker. Il faut encore vérifier le démarrage du worker, l'état de santé, une génération de test, le téléchargement MP4, les erreurs de fichiers invalides et les limites de ressources avant toute publication.
