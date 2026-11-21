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
- Enregistrement des brouillons et planifications dans le stockage local du navigateur (`localStorage`)
- Conservation des contenus après actualisation, sur le même navigateur et le même appareil
- Pages de connexions, statistiques et commentaires

## Important — état réel
Cette version est une **maquette fonctionnelle front-end**. Les brouillons et planifications sont conservés dans le stockage local du navigateur (`localStorage`) : ils restent disponibles après actualisation, sur le même navigateur et le même appareil. Ils ne sont pas synchronisés entre appareils et ne sont pas envoyés aux plateformes. Aucun compte social n'est connecté. Les statistiques et commentaires ne sont pas encore récupérés. N'enregistrez pas de mots de passe, de jetons d'accès ni d'autres secrets dans cette maquette.

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
