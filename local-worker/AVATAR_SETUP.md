# KREA STUDIO — Avatar vidéo local

## État de cette première intégration

La branche `feature/krea-avatar-video` ajoute un écran Avatar Studio et une route locale de génération fondée sur SadTalker.

Le flux actuel est volontairement limité à :
1. Un portrait PNG/JPG/JPEG dont l'utilisateur détient les droits ou l'autorisation.
2. Un enregistrement audio en français WAV/MP3/M4A.
3. Une vidéo MP4 rendue localement avec SadTalker.

La saisie de texte et la synthèse vocale française ne sont pas encore intégrées. L'interface l'indique explicitement : aucun faux rendu ni audio fictif n'est produit. Piper a été évalué comme option locale, mais sa version actuelle est sous GPL-3.0 et les licences des voix sont distinctes ; son intégration commerciale est donc suspendue à une vérification de compatibilité juridique.

## Installation moteur

Le worker KREA actuel et SadTalker ont des environnements Python différents. Ne pas installer les dépendances SadTalker directement dans l'environnement du worker sans validation.

- Worker KREA : conserver l'environnement Python déjà utilisé par le worker et installer FFmpeg.
- SadTalker : installer dans un environnement Python séparé en suivant le README officiel et les versions Python/PyTorch qu'il indique.
- La génération utilise le mode portrait `--preprocess crop` en 256 px ; les fichiers audio acceptés sont normalisés en WAV mono 16 kHz avant l'inférence.
- Définir `SADTALKER_DIR` vers le dossier contenant `inference.py`.
- Définir `SADTALKER_PYTHON` vers l'interpréteur Python de l'environnement SadTalker.
- Si l'interface web est servie depuis une autre origine que `localhost:5173`, définir `KREA_ALLOWED_ORIGINS` comme une liste d'origines exactes séparées par des virgules (ex. `https://studio.example`). Ne pas utiliser `*`.
- Les modèles/checkpoints doivent être installés localement avant que le statut passe à « Moteur prêt ».

Par défaut, le dossier attendu est `local-worker/SadTalker`. Le statut `/api/avatar/health` vérifie la présence de `inference.py` et du dossier `checkpoints`.

## Routes ajoutées

- `GET /api/avatar/health` : état d'installation, sans exposer de secret.
- `POST /api/avatar/generate` : portrait + audio, protégé par la clé éphémère `X-Krea-Token`.
- Le MP4 final réutilise la route locale `GET /api/download/{job_id}`.

Les fichiers entrants sont limités à 15 Mo pour le portrait et 40 Mo pour l'audio. Le lancement du moteur utilise une liste d'arguments de processus, jamais un shell. Le worker reste lié à `127.0.0.1`. Les origines autorisées sont limitées à la liste explicite `KREA_ALLOWED_ORIGINS` plus les origines locales de développement.

## Sécurité et usage responsable

- Utiliser uniquement une image et une voix personnelles ou explicitement autorisées.
- Ne pas créer de contenu destiné à usurper l'identité d'une personne ou à tromper le public.
- Identifier les vidéos comme générées ou animées par IA.
- Ne pas exposer le worker local sur Internet.
- Vérifier séparément les licences des modèles pré-entraînés et de chaque composant tiers avant toute diffusion commerciale.

## Tests restant à faire

Cette intégration n'a pas encore été exécutée sur un PC Windows avec les modèles SadTalker. Le build React et la compilation Python ont réussi sur le premier état de la branche, avant les dernières corrections du worker. Il faut relancer ces contrôles sur le commit courant, puis vérifier le démarrage du worker, l'état de santé, une génération réelle, le téléchargement MP4, les erreurs de fichiers invalides et les limites de ressources avant toute publication.
