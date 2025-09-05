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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `language_preference` varchar(255) DEFAULT NULL,
  `role_id` varchar(255) DEFAULT NULL,
  `tenant_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `plain_password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  KEY `ix_users_role_id` (`role_id`),
  KEY `ix_users_status` (`status`),
  KEY `ix_users_tenant_id` (`tenant_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('0285a92d-86c5-4b29-bb31-e7360b79c74c','Arjun Malhotra','arjun@dda.gov.in','$2b$12$Yitq6Gk6BJCGH9/lINKxMOiHgIvV/JjWSDks82UmkfL51QJ55M2Ci','9876543222',NULL,'active','English','573ea931-89a9-430e-a764-f4ebc26a21b2','ed8e1013-0481-4d45-ab35-3b3bcce7500d','2025-08-24 11:00:22','2025-08-24 11:00:22','password123'),('0bc46f16-4f2e-4801-b154-1fe2834cb39d','Lakshmi Devi','lakshmi@chennai.gov.in','$2b$12$ugw5DwNu8YB6v9QbqQZB6.zcDThRd2B3u8ahBoCMgdJXqs6KU8xJy','9876543241',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','872d40b9-8c55-4161-b52f-5d3af567af35','2025-08-24 11:00:24','2025-08-24 11:00:24','password123'),('2e10d3ab-3168-4051-bcc9-0da214216ef3','Riya','riya@chennai.gov.in','$2b$12$143BnzwRKA4gAs1NF9VLeeOlS0ZJTQeWTXPaRNG/MqY.qOs7EwS3u','9818384858',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','872d40b9-8c55-4161-b52f-5d3af567af35','2025-09-05 11:39:24','2025-09-05 11:39:24','password123'),('419227eb-4978-48c9-9222-6957424bcf24','Test Field Agent','test.fieldagent.1757070903@example.com','$2b$12$UNhxnUt.UwIEGJmZ5NGxo..KIziLDGlQxgQ3MakAFurX1a5jTIPJy','+1234567890',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-09-05 11:15:05','2025-09-05 11:15:05','password123'),('51d4e781-52f1-4fe0-8918-b5f83c1565f1','Rajesh Kumar','rajesh@mumbai.gov.in','$2b$12$i0N0/ITPgy/dC5yT3bKboeamMFyJmUumbTqSWuYyQ4qC8kglfZoJO','9876543210',NULL,'active','English','d864af7c-5933-421a-a570-d0db48584a80','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-08-24 11:00:20','2025-08-24 11:00:20','password123'),('6dbe5b42-09b0-446d-a6be-f816a0b9c714','Sneha Reddy','sneha@mumbai.gov.in','$2b$12$xuMZZ7ja59CvPLaDufTI7uaDTDNu7qEh1xoYJ6Q6UKi2/ujME5bSy','9876543213',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-08-24 11:00:21','2025-08-24 11:00:21','password123'),('8219e567-ab53-41b6-89cc-35f854e31f36','Test Field Agent','test.fieldagent@example.com','$2b$12$.NjJaCnKs31EXam5vqyRLezYYp9.pq/4ZPm3o6tciLJKJgEKIKPr.','+1234567890',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-09-05 11:11:15','2025-09-05 11:11:15','password123'),('906a93ef-6454-4112-b1bf-bfdb9e277939','Divya Menon','divya@bbmp.gov.in','$2b$12$u9.S/1CPm6VGNbK0SmP.D.gxlFxgYnz64ml.3XJIWE8Gcgz1T0SMC','9876543233',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','61342430-43c5-4163-9bbe-956238280951','2025-08-24 11:00:23','2025-08-24 11:00:23','password123'),('a32f26f0-04f9-457e-8da1-7b1bbcb82902','Geetha Priya','geetha@chennai.gov.in','$2b$12$Hfns5phwYPxWHDrmIwSpCehGFDUZ.A/SMgkbgPix71DkkVqZpXWo2','9876543243',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','872d40b9-8c55-4161-b52f-5d3af567af35','2025-08-24 11:00:25','2025-08-24 11:00:25','password123'),('a8579b26-8219-44c8-be54-cd5879cc85cd','Meera Gupta','meera@dda.gov.in','$2b$12$.q1bmylLeEi3goX21M/CV.8k7WeH8f9sk8w79WdK3dKTfVCtj5/s6','9876543221',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','ed8e1013-0481-4d45-ab35-3b3bcce7500d','2025-08-24 11:00:22','2025-08-24 11:00:22','password123'),('af08793e-f387-45ac-99db-8dcd41b9ae2a','Vikram Singh','vikram@dda.gov.in','$2b$12$g3WfW0V4Oe8eWktbD.B38.UDmMO1BINVRz0Els1J6C0J.yV5eUXIC','9876543220',NULL,'active','English','d864af7c-5933-421a-a570-d0db48584a80','ed8e1013-0481-4d45-ab35-3b3bcce7500d','2025-08-24 11:00:21','2025-08-24 11:00:21','password123'),('b31d795d-299d-4c7c-b936-98f047cd8535','Priya Sharma','priya@mumbai.gov.in','$2b$12$wgdLQhykAnZgnL6YEWYrPOGMsqpThe7T1fSfLO8Ht4MrvjzsFSUvm','9876543211',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-08-24 11:00:20','2025-08-24 11:00:20','password123'),('b65909a9-2298-4eb8-9d96-26431a6472e0','Test Field Agent','test.fieldagent.1757070871@example.com','$2b$12$CKuqfa.CT9lt3xoPg5sE8OE/085NhNHwEiY5YGzBXP1PIoHnBLnZS','+1234567890',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-09-05 11:14:34','2025-09-05 11:14:34','password123'),('b99a9fa7-9fde-4e61-866e-4a58f4bc8416','Test Field Agent','test.fieldagent.1757070831@example.com','$2b$12$YJOHr2HtM3ZUXczA8d2sHOcjlj6TVs6rcDzOcFiNi.ks4vi/wJDLa','+1234567890',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-09-05 11:13:53','2025-09-05 11:13:53','password123'),('bfc8ad37-5d8c-44c7-927b-c90413880225','Amit Patel','amit@mumbai.gov.in','$2b$12$fvoGIxAgEsq2KGE4GQmC8Ozhef5vc3fvSh6RAUH7S4ir6VCNEFyDG','9876543212',NULL,'active','English','573ea931-89a9-430e-a764-f4ebc26a21b2','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-08-24 11:00:21','2025-08-24 11:00:21','password123'),('ce2451af-5688-4d93-8042-1d5de2f70953','Mohan Kumar','mohan@chennai.gov.in','$2b$12$LavtZGxCgwpPEkIWttZJs.33Xp3SbRuLOmQWTzNKqjRQTlrTAlUNS','9876543242',NULL,'active','English','573ea931-89a9-430e-a764-f4ebc26a21b2','872d40b9-8c55-4161-b52f-5d3af567af35','2025-08-24 11:00:24','2025-08-24 11:00:24','password123'),('d2ba2ba5-d7ca-4f77-9cc6-ca2dc0fa137a','Rahul Iyer','rahul@bbmp.gov.in','$2b$12$xE74m4WVxtTAtxXgO/FzzuSV89nu3RqsAWvYcC9tLBrD97BeRXtde','9876543232',NULL,'active','English','573ea931-89a9-430e-a764-f4ebc26a21b2','61342430-43c5-4163-9bbe-956238280951','2025-08-24 11:00:23','2025-08-24 11:00:23','password123'),('d33aec9e-eaf7-4dad-a18b-86befb81dd02','Suresh Kumar','suresh@bbmp.gov.in','$2b$12$AXot3kRJKhKg8Q1qT5rfre6JfnukomQh6IguL4CNnipNhG/gMXu/W','9876543230',NULL,'active','English','d864af7c-5933-421a-a570-d0db48584a80','61342430-43c5-4163-9bbe-956238280951','2025-08-24 11:00:22','2025-08-24 11:00:22','password123'),('d37b364e-b2e3-404d-9125-36f78d67ede7','Kavya Joshi','kavya@dda.gov.in','$2b$12$THta0dbO7gNnrEiFUB52keFLMnbKYdAy6yyGj.UiHcZIoCQqz6YPm','9876543223',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','ed8e1013-0481-4d45-ab35-3b3bcce7500d','2025-08-24 11:00:22','2025-08-24 11:00:22','password123'),('e4ce9842-8a14-4359-9b0e-539c6e814796','Test Field Agent','test.fieldagent.1757070727@example.com','$2b$12$7YYxrtclr08NXbNQwaYoEOzJFAZ2cLNIJHK2VJR4EYLRBQSvD/y3y','+1234567890',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-09-05 11:12:10','2025-09-05 11:12:10','password123'),('e56dea6d-7a6c-46ee-82d1-835ef838926e','Test Field Agent','test.fieldagent.1757070705@example.com','$2b$12$LHUhXBkXPDxLs//iKV3kY.tFqDlvNNwk8sMKpVmst3YmpV7y9Itwe','+1234567890',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','2025-09-05 11:11:48','2025-09-05 11:11:48','password123'),('ef8f29b6-5bb3-4b2f-b1b5-ebe01a3863f6','Anjali Rao','anjali@bbmp.gov.in','$2b$12$5qx9preaHFmvUR/N7C8E2u4AFLbaHWrE2Cr2V.O0B5IS5MKWUowBO','9876543231',NULL,'active','English','dde5b8f5-9385-4f70-8d51-43c11c086f97','61342430-43c5-4163-9bbe-956238280951','2025-08-24 11:00:23','2025-08-24 11:00:23','password123'),('f30b00f6-df44-4ea7-b9ba-7723fe025459','Karthik Rajan','karthik@chennai.gov.in','$2b$12$BajYo9K6x9HmfJvggB8b9ubYnPQRcyzur7Ku8K9B/dLB2l7IjIm2O','9876543240',NULL,'active','English','d864af7c-5933-421a-a570-d0db48584a80','872d40b9-8c55-4161-b52f-5d3af567af35','2025-08-24 11:00:24','2025-08-24 11:00:24','password123');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
