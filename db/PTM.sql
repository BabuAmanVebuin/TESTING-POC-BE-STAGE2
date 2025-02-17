/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `m_asset_task_group`
--

DROP TABLE IF EXISTS `m_asset_task_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_task_group` (
  `ASSET_TASK_GROUP_ID` int(11) NOT NULL,
  `ASSET_GROUP_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PLANT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TEAM_ID` int(11) NOT NULL,
  `ASSET_TASK_GROUP_NAME` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`ASSET_TASK_GROUP_ID`,`ASSET_GROUP_ID`,`PLANT_ID`,`TEAM_ID`),
  KEY `fk_m_asset_task_group_1_idx` (`TEAM_ID`),
  CONSTRAINT `fk_m_asset_task_group_1` FOREIGN KEY (`TEAM_ID`) REFERENCES `m_team` (`TEAM_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset_task_group_hours`
--

DROP TABLE IF EXISTS `m_asset_task_group_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_task_group_hours` (
  `ASSET_TASK_GROUP_ID` int(11) NOT NULL,
  `HOURS_PER_DAY` time DEFAULT NULL,
  PRIMARY KEY (`ASSET_TASK_GROUP_ID`),
  UNIQUE KEY `ASSET_TASK_GROUP_ID_UNIQUE` (`ASSET_TASK_GROUP_ID`),
  CONSTRAINT `fk_m_asset_task_group_id` FOREIGN KEY (`ASSET_TASK_GROUP_ID`) REFERENCES `m_asset_task_group` (`ASSET_TASK_GROUP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_designation`
--

DROP TABLE IF EXISTS `m_designation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_designation` (
  `DESIGNATION_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DESIGNATION_NAME` varchar(40) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`DESIGNATION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_event_template`
--

DROP TABLE IF EXISTS `m_event_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_event_template` (
  `EVENT_TYPE_ID` bigint(20) NOT NULL,
  `EVENT_TEMPLATE_ID` bigint(20) NOT NULL,
  `TASK_TYPE_ID` bigint(20) NOT NULL,
  `TASK_PRIORITY_ID` tinyint(4) NOT NULL,
  `EVENT_TEMPLATE_SORT_NUMBER` bigint(20) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CREATE_USER_ID` varchar(256) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UPDATE_USER_ID` varchar(256) DEFAULT NULL,
  `IS_DELETED` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`EVENT_TYPE_ID`,`EVENT_TEMPLATE_ID`,`TASK_TYPE_ID`),
  KEY `fk_m_event_template_2_idx` (`TASK_PRIORITY_ID`),
  KEY `fk_m_event_template_1_idx` (`TASK_TYPE_ID`),
  CONSTRAINT `fk_m_event_template_1` FOREIGN KEY (`TASK_TYPE_ID`) REFERENCES `m_task_type` (`TASK_TYPE_ID`),
  CONSTRAINT `fk_m_event_template_2` FOREIGN KEY (`TASK_PRIORITY_ID`) REFERENCES `m_task_priority` (`TASK_PRIORITY_ID`),
  CONSTRAINT `fk_m_event_template_3` FOREIGN KEY (`EVENT_TYPE_ID`) REFERENCES `m_event_type` (`EVENT_TYPE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_event_type`
--

DROP TABLE IF EXISTS `m_event_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_event_type` (
  `EVENT_TYPE_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `EVENT_TYPE_NAME` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `EVENT_TYPE_SORT_NUMBER` bigint(20) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CREATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UPDATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IS_ATTACHED_WITH_SAP` tinyint(1) NOT NULL DEFAULT '0',
  `IS_DELETED` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`EVENT_TYPE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_operation`
--

DROP TABLE IF EXISTS `m_operation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_operation` (
  `OPERATION_ID` int(11) NOT NULL AUTO_INCREMENT,
  `OPERATION_NAME` varchar(45) DEFAULT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`OPERATION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sap_task_category`
--

DROP TABLE IF EXISTS `m_sap_task_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_sap_task_category` (
  `SAP_TASK_CATEGORY_ID` int(11) NOT NULL AUTO_INCREMENT,
  `SAP_TASK_CATEGORY_NAME` varchar(40) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`SAP_TASK_CATEGORY_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_task_priority`
--

DROP TABLE IF EXISTS `m_task_priority`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_task_priority` (
  `TASK_PRIORITY_ID` tinyint(4) NOT NULL,
  `LANG` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TASK_PRIORITY_NAME` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TASK_PRIORITY_SORT_NUMBER` tinyint(4) NOT NULL,
  PRIMARY KEY (`TASK_PRIORITY_ID`,`LANG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_task_status`
--

DROP TABLE IF EXISTS `m_task_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_task_status` (
  `TASK_STATUS_ID` tinyint(4) NOT NULL,
  `LANG` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TASK_STATUS_NAME` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TASK_STATUS_SORT_NUMBER` tinyint(4) NOT NULL,
  PRIMARY KEY (`TASK_STATUS_ID`,`LANG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_task_type`
--

DROP TABLE IF EXISTS `m_task_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_task_type` (
  `TASK_TYPE_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `LANG` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TASK_CATEGORY_ID` bigint(20) DEFAULT NULL,
  `TASK_TYPE_NAME` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TASK_CATEGORY_NAME` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TASK_EXECUTION_TIME` time DEFAULT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CREATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UPDATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IS_ATTACHED_WITH_SAP` tinyint(1) NOT NULL DEFAULT '0',
  `IS_DELETED` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`TASK_TYPE_ID`,`LANG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_team`
--

DROP TABLE IF EXISTS `m_team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_team` (
  `TEAM_ID` int(11) NOT NULL AUTO_INCREMENT,
  `TEAM_NAME` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`TEAM_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_tot`
--

DROP TABLE IF EXISTS `m_user_tot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_tot` (
  `USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `USER_NAME` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PLANT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ASSET_TASK_GROUP_ID` int(11) NOT NULL,
  `TEAM_ID` int(11) NOT NULL,
  `DEVICE_TOKEN` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LAST_ACTIVE_TIMESTAMP` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`USER_ID`),
  KEY `fk_m_user_tot_2_idx` (`ASSET_TASK_GROUP_ID`),
  KEY `fk_m_user_tot_1_idx` (`TEAM_ID`),
  CONSTRAINT `fk_m_user_tot_1` FOREIGN KEY (`TEAM_ID`) REFERENCES `m_team` (`TEAM_ID`),
  CONSTRAINT `fk_m_user_tot_2` FOREIGN KEY (`ASSET_TASK_GROUP_ID`) REFERENCES `m_asset_task_group` (`ASSET_TASK_GROUP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
-- Table structure for table `t_asset_task_group_team_operation`
--

DROP TABLE IF EXISTS `t_asset_task_group_team_operation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_asset_task_group_team_operation` (
  `ASSET_TASK_GROUP_TEAM_OPERATION_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `ASSET_TASK_GROUP_ID` int(11) NOT NULL,
  `TEAM_ID` int(11) NOT NULL,
  `OPERATION_ID` int(11) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ASSET_TASK_GROUP_TEAM_OPERATION_ID`),
  UNIQUE KEY `t_asset_task_group_team_operation_ASSET_TASK_GROUP_ID_IDX` (`ASSET_TASK_GROUP_ID`,`TEAM_ID`,`OPERATION_ID`) USING BTREE,
  KEY `fk_t_asset_task_group_team_operation_1_idx` (`ASSET_TASK_GROUP_ID`),
  KEY `fk_t_asset_task_group_team_operation_3_idx` (`OPERATION_ID`),
  KEY `fk_t_asset_task_group_team_operation_2_idx` (`TEAM_ID`),
  CONSTRAINT `fk_t_asset_task_group_team_operation_1` FOREIGN KEY (`ASSET_TASK_GROUP_ID`) REFERENCES `m_asset_task_group` (`ASSET_TASK_GROUP_ID`),
  CONSTRAINT `fk_t_asset_task_group_team_operation_2` FOREIGN KEY (`TEAM_ID`) REFERENCES `m_team` (`TEAM_ID`),
  CONSTRAINT `fk_t_asset_task_group_team_operation_3` FOREIGN KEY (`OPERATION_ID`) REFERENCES `m_operation` (`OPERATION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_chain_memo`
--

DROP TABLE IF EXISTS `t_chain_memo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_chain_memo` (
  `CHAIN_MEMO_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `CHAIN_MEMO_TEXT` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TASK_ID` bigint(20) NOT NULL,
  `CREATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CREATE_TEAM_ID` int(11) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL,
  PRIMARY KEY (`CHAIN_MEMO_ID`),
  KEY `fk_t_chain_memo_1_idx` (`TASK_ID`),
  KEY `fk_t_chain_memo_2_idx` (`CREATE_USER_ID`),
  KEY `fk_t_chain_memo_3_idx` (`CREATE_TEAM_ID`),
  CONSTRAINT `fk_t_chain_memo_1` FOREIGN KEY (`TASK_ID`) REFERENCES `t_task` (`TASK_ID`),
  CONSTRAINT `fk_t_chain_memo_2` FOREIGN KEY (`CREATE_USER_ID`) REFERENCES `m_user_tot` (`USER_ID`),
  CONSTRAINT `fk_t_chain_memo_3` FOREIGN KEY (`CREATE_TEAM_ID`) REFERENCES `m_team` (`TEAM_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_notification`
--

DROP TABLE IF EXISTS `t_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_notification` (
  `NOTIFICATION_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `TARGET_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `MESSAGE` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TASK_ID` bigint(11) DEFAULT NULL,
  `TYPE` enum('NewAssignment','BeforeStart') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'NewAssignment' COMMENT '2 Types of Notification\nNewAssignment : When user is assign or remove\nBeforeStart : Before start task send alert notification',
  `CREATE_TIMESTAMP` datetime NOT NULL,
  PRIMARY KEY (`NOTIFICATION_ID`),
  KEY `fk_t_notification_1_idx` (`TARGET_USER_ID`),
  CONSTRAINT `fk_t_notification_1` FOREIGN KEY (`TARGET_USER_ID`) REFERENCES `m_user_tot` (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_operation_event_type`
--

DROP TABLE IF EXISTS `t_operation_event_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_operation_event_type` (
  `OPERATION_EVENT_TYPE_ID` bigint(11) NOT NULL AUTO_INCREMENT,
  `OPERATION_ID` int(11) NOT NULL,
  `EVENT_TYPE_ID` bigint(20) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CREATE_USER_ID` varchar(256) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UPDATE_USER_ID` varchar(256) DEFAULT NULL,
  `IS_DELETED` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`OPERATION_EVENT_TYPE_ID`,`OPERATION_ID`,`EVENT_TYPE_ID`),
  UNIQUE KEY `t_operation_event_type_OPERATION_ID_IDX` (`OPERATION_ID`,`EVENT_TYPE_ID`) USING BTREE,
  KEY `fk_t_operation_event_type_1_idx` (`OPERATION_ID`),
  KEY `fk_t_operation_event_type_2` (`EVENT_TYPE_ID`),
  CONSTRAINT `fk_t_operation_event_type_1` FOREIGN KEY (`OPERATION_ID`) REFERENCES `m_operation` (`OPERATION_ID`),
  CONSTRAINT `fk_t_operation_event_type_2` FOREIGN KEY (`EVENT_TYPE_ID`) REFERENCES `m_event_type` (`EVENT_TYPE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_routine_task_template`
--

DROP TABLE IF EXISTS `t_routine_task_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_routine_task_template` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `TASK_NAME` varchar(400) NOT NULL,
  `EVENT_TYPE_ID` bigint(20) NOT NULL,
  `OPERATION_ID` int(11) NOT NULL,
  `EVENT_NAME` varchar(400) DEFAULT NULL,
  `TASK_TYPE_ID` bigint(20) NOT NULL,
  `VALID_START_DATE` date NOT NULL,
  `VALID_END_DATE` date NOT NULL,
  `WORK_START_TIME` time NOT NULL,
  `WORK_END_TIME` time NOT NULL,
  `DESIGNATION_ID` int(11) NOT NULL,
  `ESTIMATED_TASK_TIME` time NOT NULL,
  `PATTERN` varchar(11) NOT NULL,
  `PATTERN_RULE` longtext NOT NULL,
  `REMARKS` varchar(250) DEFAULT NULL,
  `ASSET_TASK_GROUP_ID` int(11) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL,
  `CREATE_USER_ID` varchar(256) NOT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL,
  `UPDATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IS_DELETED` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `fk_t_routine_task_template_3_idx` (`ASSET_TASK_GROUP_ID`),
  KEY `fk_t_routine_task_template_4_idx` (`UPDATE_USER_ID`) /*!80000 INVISIBLE */,
  KEY `fk_t_routine_task_template_5_idx` (`VALID_START_DATE`),
  KEY `fk_t_routine_task_template_8_idx` (`OPERATION_ID`),
  KEY `fk_t_routine_task_template_5` (`EVENT_TYPE_ID`),
  KEY `fk_t_routine_task_template_1_idx` (`TASK_TYPE_ID`),
  KEY `fk_t_routine_task_template_2_idx` (`DESIGNATION_ID`),
  CONSTRAINT `fk_t_routine_task_template_1` FOREIGN KEY (`TASK_TYPE_ID`) REFERENCES `m_task_type` (`TASK_TYPE_ID`),
  CONSTRAINT `fk_t_routine_task_template_2` FOREIGN KEY (`DESIGNATION_ID`) REFERENCES `m_designation` (`DESIGNATION_ID`),
  CONSTRAINT `fk_t_routine_task_template_3` FOREIGN KEY (`ASSET_TASK_GROUP_ID`) REFERENCES `m_asset_task_group` (`ASSET_TASK_GROUP_ID`),
  CONSTRAINT `fk_t_routine_task_template_4` FOREIGN KEY (`UPDATE_USER_ID`) REFERENCES `m_user_tot` (`USER_ID`),
  CONSTRAINT `fk_t_routine_task_template_5` FOREIGN KEY (`EVENT_TYPE_ID`) REFERENCES `m_event_type` (`EVENT_TYPE_ID`),
  CONSTRAINT `fk_t_routine_task_template_6` FOREIGN KEY (`OPERATION_ID`) REFERENCES `m_operation` (`OPERATION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE t_routine_task_template MODIFY COLUMN VALID_END_DATE DATE NULL;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_task`
--

DROP TABLE IF EXISTS `t_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task` (
  `TASK_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `PLANT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ASSET_TASK_GROUP_ID` int(11) NOT NULL,
  `TASK_TYPE_ID` bigint(20) NOT NULL,
  `TASK_NAME` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ASSET_ID` bigint(20) DEFAULT NULL,
  `PLANNED_DATE_TIME` datetime DEFAULT NULL,
  `TASK_PRIORITY_ID` tinyint(4) DEFAULT NULL,
  `DUE_DATE_TIME` datetime DEFAULT NULL,
  `START_DATE_TIME` datetime DEFAULT NULL,
  `END_DATE_TIME` datetime DEFAULT NULL,
  `WORKING_HOURS` time DEFAULT NULL,
  `ESTIMATED_TASK_TIME` time DEFAULT NULL,
  `TASK_STATUS_ID` tinyint(4) NOT NULL,
  `TAKEOVER_TEAM_ID` int(11) DEFAULT NULL,
  `REMARKS` varchar(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ORDER_ID` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EVENT_ID` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EVENT_NAME` varchar(400) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EVENT_TYPE_ID` bigint(20) NOT NULL,
  `OPERATION_ID` int(11) NOT NULL,
  `ROUTING_ID` int(10) DEFAULT NULL,
  `ROUTING_COUNTER` int(8) DEFAULT NULL,
  `ACTIVITY_ID` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SAP_TASK_CATEGORY_ID` int(11) DEFAULT NULL,
  `IS_LOCK` tinyint(1) DEFAULT '0' COMMENT 'Locked by WOT',
  `CREATE_TIMESTAMP` datetime NOT NULL,
  `CREATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL,
  `UPDATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`TASK_ID`),
  KEY `index_TASK` (`ASSET_TASK_GROUP_ID`,`TASK_STATUS_ID`,`PLANNED_DATE_TIME`,`PLANT_ID`),
  KEY `index_t_task_1_idx` (`ACTIVITY_ID`),
  KEY `fk_t_task_11_idx` (`OPERATION_ID`),
  KEY `fk_t_task_1` (`EVENT_TYPE_ID`),
  KEY `fk_t_task_3_idx` (`TASK_TYPE_ID`),
  KEY `fk_t_task_10_idx` (`SAP_TASK_CATEGORY_ID`),
  KEY `fk_t_task_4_idx` (`TASK_PRIORITY_ID`),
  KEY `fk_t_task_5_idx` (`TASK_STATUS_ID`),
  KEY `fk_t_task_7_idx` (`UPDATE_USER_ID`),
  KEY `fk_t_task_2_idx` (`ASSET_TASK_GROUP_ID`),
  KEY `fk_t_task_6_idx` (`TAKEOVER_TEAM_ID`),
  CONSTRAINT `fk_t_task_1` FOREIGN KEY (`EVENT_TYPE_ID`) REFERENCES `m_event_type` (`EVENT_TYPE_ID`),
  CONSTRAINT `fk_t_task_10` FOREIGN KEY (`SAP_TASK_CATEGORY_ID`) REFERENCES `m_sap_task_category` (`SAP_TASK_CATEGORY_ID`),
  CONSTRAINT `fk_t_task_11` FOREIGN KEY (`OPERATION_ID`) REFERENCES `m_operation` (`OPERATION_ID`),
  CONSTRAINT `fk_t_task_2` FOREIGN KEY (`ASSET_TASK_GROUP_ID`) REFERENCES `m_asset_task_group` (`ASSET_TASK_GROUP_ID`),
  CONSTRAINT `fk_t_task_3` FOREIGN KEY (`TASK_TYPE_ID`) REFERENCES `m_task_type` (`TASK_TYPE_ID`),
  CONSTRAINT `fk_t_task_4` FOREIGN KEY (`TASK_PRIORITY_ID`) REFERENCES `m_task_priority` (`TASK_PRIORITY_ID`),
  CONSTRAINT `fk_t_task_5` FOREIGN KEY (`TASK_STATUS_ID`) REFERENCES `m_task_status` (`TASK_STATUS_ID`),
  CONSTRAINT `fk_t_task_6` FOREIGN KEY (`TAKEOVER_TEAM_ID`) REFERENCES `m_team` (`TEAM_ID`),
  CONSTRAINT `fk_t_task_7` FOREIGN KEY (`UPDATE_USER_ID`) REFERENCES `m_user_tot` (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_task_assignee`
--

DROP TABLE IF EXISTS `t_task_assignee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task_assignee` (
  `TASK_ID` bigint(20) NOT NULL,
  `USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`TASK_ID`,`USER_ID`),
  KEY `fk_t_task_assignee_2_idx` (`USER_ID`),
  CONSTRAINT `fk_t_task_assignee_1` FOREIGN KEY (`TASK_ID`) REFERENCES `t_task` (`TASK_ID`),
  CONSTRAINT `fk_t_task_assignee_2` FOREIGN KEY (`USER_ID`) REFERENCES `m_user_tot` (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_task_audit`
--

DROP TABLE IF EXISTS `t_task_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task_audit` (
  `TASK_AUDIT_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `TASK_ID` bigint(20) NOT NULL,
  `PRE_TASK_STATUS_ID` tinyint(4) DEFAULT NULL,
  `POST_TASK_STATUS_ID` tinyint(4) NOT NULL,
  `TEAM_ID` int(11) DEFAULT NULL,
  `OPERATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OPERATE_TIMESTAMP` datetime NOT NULL,
  PRIMARY KEY (`TASK_AUDIT_ID`),
  KEY `fk_t_task_audit_1_idx` (`OPERATE_USER_ID`),
  KEY `fk_t_task_audit_2_idx` (`TASK_ID`),
  KEY `fk_t_task_audit_3_idx` (`PRE_TASK_STATUS_ID`),
  KEY `fk_t_task_audit_4_idx` (`POST_TASK_STATUS_ID`),
  CONSTRAINT `fk_t_task_audit_1` FOREIGN KEY (`OPERATE_USER_ID`) REFERENCES `m_user_tot` (`USER_ID`),
  CONSTRAINT `fk_t_task_audit_2` FOREIGN KEY (`TASK_ID`) REFERENCES `t_task` (`TASK_ID`),
  CONSTRAINT `fk_t_task_audit_3` FOREIGN KEY (`PRE_TASK_STATUS_ID`) REFERENCES `m_task_status` (`TASK_STATUS_ID`),
  CONSTRAINT `fk_t_task_audit_4` FOREIGN KEY (`POST_TASK_STATUS_ID`) REFERENCES `m_task_status` (`TASK_STATUS_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_task_forecast`
--

DROP TABLE IF EXISTS `t_task_forecast`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task_forecast` (
  `TASK_FORECAST_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `EVENT_TYPE_ID` bigint(20) NOT NULL,
  `OPERATION_ID` int(11) NOT NULL,
  `TASK_TYPE_ID` bigint(20) NOT NULL,
  `MONTH` int(11) NOT NULL DEFAULT '0',
  `YEAR` int(11) NOT NULL DEFAULT '0',
  `TOTAL_HOURS` double unsigned NOT NULL DEFAULT '0',
  `TOTAL_TASKS` int(11) unsigned DEFAULT '0',
  `TEAM_ID` int(11) NOT NULL,
  `ASSET_TASK_GROUP_ID` int(11) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL,
  `CREATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL,
  `UPDATE_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`TASK_FORECAST_ID`,`EVENT_TYPE_ID`,`TASK_TYPE_ID`,`MONTH`,`YEAR`,`TEAM_ID`),
  KEY `fk_task_forecase_1_idx` (`EVENT_TYPE_ID`),
  KEY `fk_task_forecase_4_idx` (`CREATE_USER_ID`),
  KEY `fk_task_forecase_5_idx` (`UPDATE_USER_ID`),
  KEY `fk_task_forecase_6` (`ASSET_TASK_GROUP_ID`),
  KEY `fk_task_forecase_7_idx` (`OPERATION_ID`),
  KEY `fk_task_forecase_2_idx` (`TASK_TYPE_ID`),
  KEY `fk_task_forecase_3_idx` (`TEAM_ID`),
  CONSTRAINT `fk_task_forecase_1` FOREIGN KEY (`EVENT_TYPE_ID`) REFERENCES `m_event_type` (`EVENT_TYPE_ID`),
  CONSTRAINT `fk_task_forecase_2` FOREIGN KEY (`TASK_TYPE_ID`) REFERENCES `m_task_type` (`TASK_TYPE_ID`),
  CONSTRAINT `fk_task_forecase_3` FOREIGN KEY (`TEAM_ID`) REFERENCES `m_team` (`TEAM_ID`),
  CONSTRAINT `fk_task_forecase_4` FOREIGN KEY (`CREATE_USER_ID`) REFERENCES `m_user_tot` (`USER_ID`),
  CONSTRAINT `fk_task_forecase_5` FOREIGN KEY (`UPDATE_USER_ID`) REFERENCES `m_user_tot` (`USER_ID`),
  CONSTRAINT `fk_task_forecase_6` FOREIGN KEY (`ASSET_TASK_GROUP_ID`) REFERENCES `m_asset_task_group` (`ASSET_TASK_GROUP_ID`),
  CONSTRAINT `fk_task_forecase_7` FOREIGN KEY (`OPERATION_ID`) REFERENCES `m_operation` (`OPERATION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(32) NOT NULL,
  `description` varchar(128) NOT NULL,
  `createdDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


-- 2023-06-23
ALTER TABLE t_task MODIFY COLUMN REMARKS varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL;


-- 2023-10 DPM COPY
CREATE TABLE `t_kpi002_response_cache` (
  `PLANT_CODE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UNIT_CODE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `RESPONSE_JSON` json NOT NULL,
  `LAST_TRIGGERED` timestamp(3) NOT NULL,
  PRIMARY KEY (`PLANT_CODE`,`UNIT_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `t_kpi003_response_cache` (
  `PLANT_CODE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UNIT_CODE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `MEASURE` varchar(28) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `EPOCH_SECONDS` bigint(20) NOT NULL,
  `RESPONSE_JSON` json NOT NULL,
  `LAST_TRIGGERED` timestamp(3) NOT NULL,
  PRIMARY KEY (`PLANT_CODE`,`UNIT_CODE`,`EPOCH_SECONDS`,`MEASURE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2023-11 DPM business plan
CREATE TABLE `t_thermal_efficiency_forecast` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `UNIT_CODE` varchar(10)  NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `CORRECTION_VALUE` decimal(5, 2) COMMENT '単位：%',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `UNIT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `t_generation_output_plan`
--
DROP TABLE IF EXISTS `t_generation_output_plan`;
CREATE TABLE `t_generation_output_plan` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `UNIT_CODE` varchar(10)  NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `VALUE` decimal(7, 2) COMMENT '単位：GWH',
  `CORRECTION_VALUE` decimal(7, 2) COMMENT '単位：GWH',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `UNIT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `t_generation_output_forecast` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `UNIT_CODE` varchar(10)  NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `VALUE` decimal(7, 2) COMMENT '単位：GWH',
  `CORRECTION_VALUE` decimal(7, 2) COMMENT '単位：GWH',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `UNIT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `t_fuel_price_plan` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `VALUE` int(11) COMMENT '単位：円/t',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `t_fuel_price_forecast` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `VALUE` int(11) COMMENT '単位：円/t',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `t_basic_charge_forecast` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `UNIT_CODE` varchar(10)  NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `OPERATION_INPUT` decimal(5, 2) COMMENT '単位：億円',
  `MAINTENANCE_INPUT` decimal(5, 2) COMMENT '単位：億円',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `UNIT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `t_opex_forecast` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `UNIT_CODE` varchar(10)  NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `OPERATION_COST` decimal(5, 2) COMMENT '単位：億円',
  `MAINTENANCE_COST` decimal(5, 2) COMMENT '単位：億円',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `UNIT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `t_opex_plan`
--
DROP TABLE IF EXISTS `t_opex_plan`;
CREATE TABLE `t_opex_plan` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `UNIT_CODE` varchar(10)  NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `OPERATION_COST` decimal(5, 2) COMMENT '単位：億円',
  `MAINTENANCE_COST` decimal(5, 2) COMMENT '単位：億円',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `UNIT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `t_opex_forecast`
--
DROP TABLE IF EXISTS `t_opex_forecast`;
CREATE TABLE `t_opex_forecast` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `UNIT_CODE` varchar(10)  NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `OPERATION_COST` decimal(5, 2) COMMENT '単位：億円',
  `MAINTENANCE_COST` decimal(5, 2) COMMENT '単位：億円',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `UNIT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `t_basic_charge_plan`;
CREATE TABLE `t_basic_charge_plan` (
  `PLANT_CODE` varchar(10) NOT NULL,
  `UNIT_CODE` varchar(10)  NOT NULL,
  `FISCAL_YEAR` int(4) NOT NULL,
  `OPERATION_INPUT` decimal(5, 2) COMMENT '単位：億円',
  `MAINTENANCE_INPUT` decimal(5, 2) COMMENT '単位：億円',
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PLANT_CODE`, `UNIT_CODE`, `FISCAL_YEAR`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Drop table `t_operation_month_forecast`
--
DROP TABLE IF EXISTS `t_operation_month_forecast`;

select 'finish'
