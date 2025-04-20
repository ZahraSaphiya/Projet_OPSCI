Teibi Zahra 21211965  
Goales Saphiya 21233538

# Script de lancement et d’arrêt des services

#### Création du projet Strapi
```bash
yarn create strapi-app backend
```

#### Lancement du frontend (React)
```bash
npm run dev
```

#### Création du réseau Docker
```bash
docker network create strapi-network
```

#### Lancement des conteneurs principaux (Strapi, Kafka, PostgreSQL, Zookeeper)
```bash
docker compose up
```

#### Lancement des **consumers**
```bash
docker compose -f docker-compose-cons.yml up
```

#### Lancement des **producers**
```bash
docker compose -f docker-compose-prod.yml up --build topic-producer
```

> Remarque : `topic` doit être remplacé par l’un des sujets suivants : `stock`, `event` ou `product`.  
> On utilise `--build` car les fichiers `product.txt`, `stock.csv` et `event.csv` peuvent être modifiés.

#### Lancement de **Mosquitto** et du **Connector**
```bash
docker compose -f docker-compose-mqtt.yml up
```

#### Arrêt des conteneurs (Strapi, Kafka, PostgreSQL, Zookeeper, Producers, Consumers, Mosquitto et le Connector)

```bash
docker compose -f docker-compose-xx.yml down
```

> Remarque : `xx` doit être remplacé par le nom du fichier `docker-compose` correspondant au service qu'on veut arrêter.

#### Test du MQTT Connector
```bash
node read.js
node main.js
```