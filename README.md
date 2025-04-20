Goales Saphiya 21233538  
Teibi Zahra 21211965  
LO3IN403 \- 2024/2025

# Rapport : Infrastructure complète avec objets connectés et architecture événementielle

## Objectif

Nous souhaitons développer une plateforme permettant de gérer des produits. Celle-ci comprendra une base de données pour stocker les informations des produits, un CMS (Strapi) afin de faciliter leur gestion, ainsi qu'une interface frontend destinée à les afficher aux utilisateurs.

## Partie 1 : Infrastructure de base (Strapi, PostgreSQL, Frontend React)

Strapi est un outil qui permet de gérer facilement nos produits grâce à une interface graphique intuitive.

Nous avons créé un projet Strapi nommé backend, en choisissant le mode d'installation personnalisé (manual settings) afin d’utiliser PostgreSQL comme système de gestion de base de données. Ce dernier servira à stocker toutes les informations relatives aux produits ainsi qu'à l’administrateur. Les paramètres par défaut ont été conservés pour l'hôte et le port (5432).

Nous avons également créé le Dockerfile suivant pour générer l’image Docker du conteneur Strapi :

   ```dockerfile
FROM node:18-alpine

WORKDIR /srv/app

COPY ./package.json ./yarn.lock ./

RUN node -v 

RUN yarn install 

COPY . . 

CMD ["yarn", "develop"]
   ```

Nous avons mis en place un fichier docker-compose.yml pour orchestrer les conteneurs suivants : strapi, strapi\_pg (base de données PostgreSQL), zookeeper et kafka. Ce fichier décrit les quatre services cités, définit les connexions entre ces services et  mappe les ports locaux.

Par ailleurs, la variable d’environnement suivante, définie dans le fichier docker-compose.yml : 

```env
DATABASE_HOST=strapi-pg 
```

indique que la base de données PostgreSQL utilisée est hébergée dans le conteneur strapi-pg, présent dans le même réseau Docker strapi-network, que nous avons préalablement créé manuellement.

Pour la suite du projet, nous avons généré un token d’accès sur Strapi afin de pouvoir ajouter ou supprimer des produits et des événements. Ce token est utilisé à la fois dans le frontend React (dossier opsci-strapi-frontend, fichier config.js), et plus tard dans les variables d’environnement des consumers (fichier main.js), permettant ainsi de sécuriser les échanges.

Une fois ce conteneur lancé, l’interface graphique de Strapi est accessible à l’adresse suivante : [http://localhost:1337](http://localhost:1337)

Nous avons donc créé les collections Product et Event sur l'interface Strapi. On peut donc ajouter des produits à la base de données directement depuis l'interface admin de Strapi. Ces produits seront stockés dans PostgreSQL.

Nous avons vérifié le bon fonctionnement de la collection Product en accédant à l’URL suivante : [http://localhost:1337/products](http://localhost:1337/products)

Le frontend est l'interface fournie aux utilisateurs pour voir les produits. 

Une fois configuré avec le bon token et le bon url pour Strapi (fichier conf.ts), on peut démarrer le frontend en exécutant la commande suivante :

   ```bash
npm run dev
   ```

Ainsi, le frontend est maintenant accessible à l’adresse [http://localhost:5173](http://localhost:5173).

## Partie 2 : Architecture événementielle avec Kafka

À ce stade, notre infrastructure est opérationnelle : Kafka, Strapi, PostgreSQL et React sont tous correctement configurés.

Kafka utilise plusieurs topics pour gérer différents flux de données :

* `product` : pour l'ajout de nouveaux produits.

* `event` : pour l'enregistrement des événements liés aux produits.

* `stock` : pour la gestion des mises à jour de stock.

Il ne reste plus qu’à établir la communication entre ces différents composants. Pour cela, nous avons mis en place des producers et des consumers :

*  Les producers envoient des messages dans Kafka.

* Les consumers consomment ces messages depuis Kafka, puis envoient des requêtes vers Strapi (par exemple, pour créer ou mettre à jour des Product) en fonction des données reçues.

Dans un souci de clarté et d’organisation, nous avons séparé les services dans différents fichiers Docker Compose :

*  Les consumers sont définis dans le fichier docker-compose-cons.yml

* Les producers sont définis dans le fichier docker-compose-prod.yml

Les variables d’environnement nécessaires à ces services sont déclarées dans les fichiers main.js, présents dans les dossiers topic-consumer et topic-producer, où topic correspond à l’un des sujets suivants : stock, event ou product.

Ainsi, chaque message produit est traité par un consumer qui déclenche une requête HTTP vers l’API Strapi, permettant de modifier ou enrichir les données de la base.

## Partie 3 : TME 10-11 : Ajout à notre architecture des objets connectés

Afin d’indiquer les modifications apportées au projet pour le TME, nous avons créé une branche tme10-11 dans notre dépôt GitHub.
Nous avons décidé de faire une seule vidéo qui parcourt le projet au complet, de l'ajout d'un produit à sa mise à jour via Kafka et montrant la chaine de modification de stock: front -> MQTT -> kafka -> strapi.

Nous y avons ajouté un fichier docker-compose-mqtt.yml contenant la configuration des conteneurs Mosquitto (MQTT) et MQTT-Kafka connector, ainsi que le dossier fourni permettant de tester le fonctionnement de Mosquitto.

L’objectif de cette évolution est de simuler un système capable de récupérer des données provenant du terrain, comme le feraient des capteurs ou objets connectés.

Pour cela, nous lançons un broker MQTT via un conteneur Mosquitto, chargé de recevoir les messages envoyés par les dispositifs. Un second conteneur, mqtt-kafka-connector, assure ensuite le transfert de ces messages vers Kafka.

Concrètement, les messages envoyés par les objets connectés sont reçus par le broker MQTT, puis relayés par le connecteur vers Kafka.

Les consumers créés précédemment sont lancés pour consommer ces messages depuis Kafka et appliquer directement les modifications dans Strapi.

Pour tester l’envoi de messages, nous utilisons le frontend fourni, qui permet de publier des messages vers le broker MQTT en simulant le comportement de dispositifs connectés.
