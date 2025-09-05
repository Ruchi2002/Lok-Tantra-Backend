-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: smart_politician_assistant
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `areas`
--

DROP TABLE IF EXISTS `areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `geojson_data` varchar(255) DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_areas_is_active` (`is_active`),
  KEY `ix_areas_tenant_id` (`tenant_id`),
  KEY `ix_areas_name` (`name`),
  CONSTRAINT `areas_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` VALUES ('090f13fc-af3a-4e06-9d61-2b00d2b9b523','Andheri West','Administrative area in Mumbai Municipal Corporation','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','{\"type\": \"Polygon\", \"coordinates\": [[[72.8364, 19.1097], [72.85640000000001, 19.1097], [72.85640000000001, 19.129700000000003], [72.8364, 19.129700000000003], [72.8364, 19.1097]]]}',19.1197,72.8464,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('2479940c-788c-481e-a964-875b0a232477','Indiranagar','Administrative area in Bangalore City Corporation','61342430-43c5-4163-9bbe-956238280951','{\"type\": \"Polygon\", \"coordinates\": [[[77.63119999999999, 12.9689], [77.6512, 12.9689], [77.6512, 12.9889], [77.63119999999999, 12.9889], [77.63119999999999, 12.9689]]]}',12.9789,77.6412,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('2bb1a029-19e1-4fc1-81f2-25a951b23a13','Marathahalli','Administrative area in Bangalore City Corporation','61342430-43c5-4163-9bbe-956238280951','{\"type\": \"Polygon\", \"coordinates\": [[[77.6914, 12.9484], [77.71140000000001, 12.9484], [77.71140000000001, 12.968399999999999], [77.6914, 12.968399999999999], [77.6914, 12.9484]]]}',12.9584,77.7014,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('38d23caf-0b85-4987-9ea6-c3cdb5f5d0b6','Koramangala','Administrative area in Bangalore City Corporation','61342430-43c5-4163-9bbe-956238280951','{\"type\": \"Polygon\", \"coordinates\": [[[77.5955, 12.924900000000001], [77.61550000000001, 12.924900000000001], [77.61550000000001, 12.9449], [77.5955, 12.9449], [77.5955, 12.924900000000001]]]}',12.9349,77.6055,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('3b5e028e-9c0f-4fb6-960e-6b6af4d1e715','Dwarka','Administrative area in Delhi Development Authority','ed8e1013-0481-4d45-ab35-3b3bcce7500d','{\"type\": \"Polygon\", \"coordinates\": [[[77.0385, 28.582099999999997], [77.05850000000001, 28.582099999999997], [77.05850000000001, 28.6021], [77.0385, 28.6021], [77.0385, 28.582099999999997]]]}',28.5921,77.0485,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('4185faff-8641-4e4f-9a6a-dfddbc96af7c','Velachery','Administrative area in Chennai Municipal Corporation','872d40b9-8c55-4161-b52f-5d3af567af35','{\"type\": \"Polygon\", \"coordinates\": [[[80.21039999999999, 12.9689], [80.2304, 12.9689], [80.2304, 12.9889], [80.21039999999999, 12.9889], [80.21039999999999, 12.9689]]]}',12.9789,80.2204,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('47e74409-44ca-492f-a556-edf61580c555','Worli','Administrative area in Mumbai Municipal Corporation','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','{\"type\": \"Polygon\", \"coordinates\": [[[72.8038, 19.0076], [72.8238, 19.0076], [72.8238, 19.027600000000003], [72.8038, 19.027600000000003], [72.8038, 19.0076]]]}',19.0176,72.8138,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('67c3b43a-8fa5-46b0-bcdb-436ae01f9928','Whitefield','Administrative area in Bangalore City Corporation','61342430-43c5-4163-9bbe-956238280951','{\"type\": \"Polygon\", \"coordinates\": [[[77.73989999999999, 12.959200000000001], [77.7599, 12.959200000000001], [77.7599, 12.9792], [77.73989999999999, 12.9792], [77.73989999999999, 12.959200000000001]]]}',12.9692,77.7499,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('6e37e0cb-30df-41d7-95d9-5b215c9446bc','Bandra West','Administrative area in Mumbai Municipal Corporation','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','{\"type\": \"Polygon\", \"coordinates\": [[[72.81949999999999, 19.049599999999998], [72.8395, 19.049599999999998], [72.8395, 19.0696], [72.81949999999999, 19.0696], [72.81949999999999, 19.049599999999998]]]}',19.0596,72.8295,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('8efd1e69-516f-4660-8fed-036decc8d510','Hauz Khas','Administrative area in Delhi Development Authority','ed8e1013-0481-4d45-ab35-3b3bcce7500d','{\"type\": \"Polygon\", \"coordinates\": [[[77.1914, 28.537799999999997], [77.21140000000001, 28.537799999999997], [77.21140000000001, 28.5578], [77.1914, 28.5578], [77.1914, 28.537799999999997]]]}',28.5478,77.2014,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('918cf8b9-5e2e-47e6-9e6d-8b53d57f8f54','Khan Market','Administrative area in Delhi Development Authority','ed8e1013-0481-4d45-ab35-3b3bcce7500d','{\"type\": \"Polygon\", \"coordinates\": [[[77.21759999999999, 28.5901], [77.2376, 28.5901], [77.2376, 28.610100000000003], [77.21759999999999, 28.610100000000003], [77.21759999999999, 28.5901]]]}',28.6001,77.2276,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('9f6a2c07-9eba-4d20-8e01-872981303836','Adyar','Administrative area in Chennai Municipal Corporation','872d40b9-8c55-4161-b52f-5d3af567af35','{\"type\": \"Polygon\", \"coordinates\": [[[80.2444, 12.9967], [80.26440000000001, 12.9967], [80.26440000000001, 13.0167], [80.2444, 13.0167], [80.2444, 12.9967]]]}',13.0067,80.2544,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('b697c630-0ca2-4633-a136-ee83386def49','Anna Nagar','Administrative area in Chennai Municipal Corporation','872d40b9-8c55-4161-b52f-5d3af567af35','{\"type\": \"Polygon\", \"coordinates\": [[[80.2607, 13.072700000000001], [80.28070000000001, 13.072700000000001], [80.28070000000001, 13.0927], [80.2607, 13.0927], [80.2607, 13.072700000000001]]]}',13.0827,80.2707,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('be376f72-9f5a-425b-981b-a0c4b2d4b2fb','Colaba','Administrative area in Mumbai Municipal Corporation','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','{\"type\": \"Polygon\", \"coordinates\": [[[72.82159999999999, 18.904899999999998], [72.8416, 18.904899999999998], [72.8416, 18.9249], [72.82159999999999, 18.9249], [72.82159999999999, 18.904899999999998]]]}',18.9149,72.8316,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('c7b50659-7d8e-41bb-9f13-2e090de2d91b','Mylapore','Administrative area in Chennai Municipal Corporation','872d40b9-8c55-4161-b52f-5d3af567af35','{\"type\": \"Polygon\", \"coordinates\": [[[80.2607, 13.027000000000001], [80.28070000000001, 13.027000000000001], [80.28070000000001, 13.047], [80.2607, 13.047], [80.2607, 13.027000000000001]]]}',13.037,80.2707,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('d4f5f965-a2af-409e-930b-d40acb09054e','Connaught Place','Administrative area in Delhi Development Authority','ed8e1013-0481-4d45-ab35-3b3bcce7500d','{\"type\": \"Polygon\", \"coordinates\": [[[77.2067, 28.621499999999997], [77.22670000000001, 28.621499999999997], [77.22670000000001, 28.6415], [77.2067, 28.6415], [77.2067, 28.621499999999997]]]}',28.6315,77.2167,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('dadbb182-ccd4-4bc4-966b-1c5c086eaef2','Juhu','Administrative area in Mumbai Municipal Corporation','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','{\"type\": \"Polygon\", \"coordinates\": [[[72.82469999999999, 19.089599999999997], [72.8447, 19.089599999999997], [72.8447, 19.1096], [72.82469999999999, 19.1096], [72.82469999999999, 19.089599999999997]]]}',19.0996,72.8347,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('f2fc9f01-1437-4ab0-a908-263f73cc93e6','Lajpat Nagar','Administrative area in Delhi Development Authority','ed8e1013-0481-4d45-ab35-3b3bcce7500d','{\"type\": \"Polygon\", \"coordinates\": [[[77.2331, 28.557499999999997], [77.2531, 28.557499999999997], [77.2531, 28.5775], [77.2331, 28.5775], [77.2331, 28.557499999999997]]]}',28.5675,77.2431,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('f731a8b0-9de3-4c94-9051-a04a3b181794','Electronic City','Administrative area in Bangalore City Corporation','61342430-43c5-4163-9bbe-956238280951','{\"type\": \"Polygon\", \"coordinates\": [[[77.6558, 12.8358], [77.67580000000001, 12.8358], [77.67580000000001, 12.8558], [77.6558, 12.8558], [77.6558, 12.8358]]]}',12.8458,77.6658,1,'2025-08-24 11:00:20','2025-08-24 11:00:20'),('fa1ee378-6116-43cd-974f-6c808085fdfd','T Nagar','Administrative area in Chennai Municipal Corporation','872d40b9-8c55-4161-b52f-5d3af567af35','{\"type\": \"Polygon\", \"coordinates\": [[[80.2323, 13.0267], [80.2523, 13.0267], [80.2523, 13.0467], [80.2323, 13.0467], [80.2323, 13.0267]]]}',13.0367,80.2423,1,'2025-08-24 11:00:20','2025-08-24 11:00:20');
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-05 22:13:18
