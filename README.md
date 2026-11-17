# KREA STUDIO — Social Manager

Application web React + Vite pour préparer et organiser les publications de plusieurs réseaux sociaux depuis un tableau de bord unique.

## Réseaux ciblés
- Instagram
- Facebook
- YouTube
- TikTok

## Fonctionnalités de l'interface
- Vue générale et état des comptes
- Création de publication multi-réseaux
- Enregistrement de brouillons dans la session
- Planification locale de démonstration
- Pages de connexions, statistiques et commentaires

## Important — état réel
Cette version est une **maquette fonctionnelle front-end**. Les publications programmées restent dans l'état local de l'application et ne sont pas envoyées aux plateformes. Aucun compte social n'est connecté. Les statistiques et commentaires ne sont pas encore récupérés.

Pour activer la publication automatique, il faudra construire un backend sécurisé, enregistrer les applications développeur officielles de chaque plateforme, implémenter OAuth, stocker les jetons côté serveur, respecter les autorisations et restrictions des API, puis ajouter une file de tâches planifiées. Les secrets ne doivent jamais être placés dans le code front-end.

## Démarrer
```bash
npm install
npm run dev
```

## Production
```bash
npm run build
npm run preview
```
