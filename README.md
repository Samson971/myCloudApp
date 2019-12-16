# Application pour le Cloud

## Introduction

Ce project représente une application web permettant de la connection à une base de données MongoDb et réaliser quelques requêtes prédéfinies.
Cette application a été réalisé en javascript avec nodeJS.

## Installation et lancement

- cloner le repository
- dans le dossier root, exécuter la commande `npm install`
- vérifier que le serveur mongodb est lancé.
    La connection se fait par défaut sur localhost:27017.\
    L'uri de connection se trouve dans le fichier [server.js](../server.js)
- exécuter la commande `node server.js` pour lancer l'application sur localhost:8080

## Présentation de l'application

La page d'accueil de l'application présente l'ensemble du projet ansi que l'équipe qui l'a réalise.
Il y a un onglet requête standard et un autre pour les requêtes administarteurs. Ces dernières sont exécutées via un lien de redirection.

### Routes

- `/`\
  root pour diriger vers la page d'accueil

- `/requestx`\
  Chaque requête est implémentée via une route.\
  Le schéma utilisé pour receuillir les données est:

  - connection à la base de donnée via la constante uri.

    ~~~js
    //connection au serveur mongos
    'mongodb://username:password@devincimdb1011.westeurope.cloudapp.azure.com:30000'

    //connection en local
    "mongodb://localhost:27017";
    ~~~

  - construction et exécution de la requête
  - retour du template et des résultats de la requête vers le client

### Templates
- [page d'acceuil](home.html)\
  Template prédéfini qui a été retravaillé afin de correspondre aux besoins du projet.

- [template pour afficher les résultats des requêtes](basic-table.html)\
  Créé pour pouvoir afficher les résultats sous forme de tableau avec les champs définis dans le controlleur.

Le moteur de template Swig a été ajouté à l'application afin que le rendu de chaque page html soit facilité.
  