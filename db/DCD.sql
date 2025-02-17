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
-- Table structure for table `m_abnormal_judgement`
--

DROP TABLE IF EXISTS `m_abnormal_judgement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_abnormal_judgement` (
  `JUDGEMENT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `RELATED_OCCURRENCE_ID` int(11) NOT NULL,
  `JUDGEMENT_TEXT_INFO` text NOT NULL,
  `ALERT_KEY` varchar(255) NOT NULL,
  `ALERT_TYPE` varchar(80) NOT NULL,
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`JUDGEMENT_ID`),
  KEY `ALERT_KEY` (`ALERT_KEY`),
  KEY `RELATED_OCCURRENCE_ID` (`RELATED_OCCURRENCE_ID`),
  CONSTRAINT `m_abnormal_judgement_ibfk_1` FOREIGN KEY (`RELATED_OCCURRENCE_ID`) REFERENCES `m_occurrence` (`OCCURRENCE_ID`) ON DELETE CASCADE,
  CONSTRAINT `m_abnormal_judgement_ibfk_2` FOREIGN KEY (`ALERT_KEY`) REFERENCES `t_alerts` (`ALERT_KEY`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_alert_dialog_config`
--

DROP TABLE IF EXISTS `m_alert_dialog_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_alert_dialog_config` (
  `UUID` varchar(100) NOT NULL,
  `ALERT_KEY` varchar(255) NOT NULL,
  `ALERT_TYPE` varchar(80) NOT NULL,
  `SETTING_VALUE` text NOT NULL,
  `OPERATION` text NOT NULL,
  `deleted` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`UUID`),
  UNIQUE KEY `ALERT_KEY` (`ALERT_KEY`,`ALERT_TYPE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_alert_factor`
--

DROP TABLE IF EXISTS `m_alert_factor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_alert_factor` (
  `ALERT_FACTOR_ID` int(11) NOT NULL AUTO_INCREMENT,
  `ALERT_KEY` varchar(255) NOT NULL,
  `ALERT_TYPE` varchar(255) NOT NULL,
  `ALERT_FACTOR_NAME` varchar(255) NOT NULL,
  `PARENT_ALERT_FACTOR_ID` int(11) DEFAULT NULL,
  `LEVEL` int(4) NOT NULL DEFAULT '0',
  `IS_DELETED` int(4) NOT NULL DEFAULT '0',
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  `UUID` varchar(100) NOT NULL,
  PRIMARY KEY (`ALERT_FACTOR_ID`),
  UNIQUE KEY `UUID` (`UUID`),
  KEY `ALERT_KEY` (`ALERT_KEY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_alert_factor_dialog_config`
--

DROP TABLE IF EXISTS `m_alert_factor_dialog_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_alert_factor_dialog_config` (
  `UUID` varchar(100) NOT NULL,
  `ALERT_FACTOR_ID` int(11) DEFAULT NULL,
  `TRANSACTION_ALERT_FACTOR_ID` int(11) DEFAULT NULL,
  `DECISION` text NOT NULL,
  `OPERATION` text NOT NULL,
  `deleted` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`UUID`),
  UNIQUE KEY `ALERT_FACTOR_ID` (`ALERT_FACTOR_ID`),
  UNIQUE KEY `TRANSACTION_ALERT_FACTOR_ID` (`TRANSACTION_ALERT_FACTOR_ID`),
  CONSTRAINT `m_alert_factor_dialog_config_ibfk_1` FOREIGN KEY (`ALERT_FACTOR_ID`) REFERENCES `m_alert_factor` (`ALERT_FACTOR_ID`) ON DELETE CASCADE,
  CONSTRAINT `m_alert_factor_dialog_config_ibfk_2` FOREIGN KEY (`TRANSACTION_ALERT_FACTOR_ID`) REFERENCES `t_alert_factor` (`TRANSACTION_ALERT_FACTOR_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_alert_temporary_fix`
--

DROP TABLE IF EXISTS `m_alert_temporary_fix`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_alert_temporary_fix` (
  `ALERT_KEY` varchar(255) NOT NULL,
  `ALERT_TYPE` varchar(80) NOT NULL,
  `TEMPORARY_FIX` text NOT NULL,
  `deleted` tinyint(4) DEFAULT '0',
  `uuid` varchar(100) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `ALERT_KEY` (`ALERT_KEY`,`ALERT_TYPE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_alert_type`
--

DROP TABLE IF EXISTS `m_alert_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_alert_type` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ALERT_TYPE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PRIORITY` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `INDEX` (`ALERT_TYPE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='This table is used to fetch the priority of Alert type for storing the detail of t_rpn_defects_cache table.\n';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset`
--

DROP TABLE IF EXISTS `m_asset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset` (
  `PLANT_ID` varchar(10) NOT NULL,
  `ASSET_ID` bigint(20) NOT NULL,
  `ASSET_NAME` varchar(300) NOT NULL,
  `ASSET_CATEGORY` varchar(30) NOT NULL,
  `ASSET_TYPE` varchar(10) NOT NULL,
  `ASSET_STATUS` varchar(30) NOT NULL,
  `ASSET_CODE` varchar(40) NOT NULL,
  `PARENT_ASSET_CODE` varchar(40) NOT NULL,
  `PARENT_ASSET_ID` bigint(20) DEFAULT NULL,
  `ASSET_KEY_FLAG` tinyint(4) NOT NULL DEFAULT '1',
  `MANUFACTURER` varchar(90) NOT NULL,
  `MODEL` varchar(60) NOT NULL,
  PRIMARY KEY (`PLANT_ID`,`ASSET_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset_b`
--

DROP TABLE IF EXISTS `m_asset_b`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_b` (
  `PLANT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ASSET_ID` bigint(20) NOT NULL,
  `ASSET_NAME` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ASSET_CATEGORY` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ASSET_TYPE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ASSET_STATUS` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ASSET_CODE` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `manufacturer` varchar(90) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '',
  `model` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '',
  `PARENT_ASSET_CODE` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PARENT_ASSET_ID` bigint(20) DEFAULT NULL,
  `ASSET_KEY_FLAG` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`PLANT_ID`,`ASSET_ID`),
  UNIQUE KEY `ASSET_CODE_UNIQUE` (`ASSET_CODE`),
  UNIQUE KEY `ASSET_ID` (`ASSET_ID`),
  KEY `PLANT_ID_x_ASSET_KEY_FLAG` (`PLANT_ID`,`ASSET_KEY_FLAG`),
  KEY `PARENT_ASSET_CODE` (`PARENT_ASSET_CODE`),
  FULLTEXT KEY `FullText` (`ASSET_NAME`,`ASSET_CODE`),
  FULLTEXT KEY `ASSET_CODE_2` (`ASSET_CODE`,`ASSET_NAME`),
  CONSTRAINT `m_asset_plant_id` FOREIGN KEY (`PLANT_ID`) REFERENCES `m_plant` (`PLANT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset_bk`
--

DROP TABLE IF EXISTS `m_asset_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_bk` (
  `PLANT_ID` varchar(10) NOT NULL,
  `ASSET_ID` bigint(20) NOT NULL,
  `ASSET_NAME` varchar(300) DEFAULT NULL,
  `ASSET_CATEGORY` varchar(30) NOT NULL,
  `ASSET_TYPE` varchar(10) NOT NULL,
  `ASSET_STATUS` varchar(30) NOT NULL,
  `ASSET_CODE` varchar(40) NOT NULL,
  `manufacturer` varchar(90) DEFAULT '',
  `model` varchar(60) DEFAULT '',
  `PARENT_ASSET_CODE` varchar(40) DEFAULT NULL,
  `PARENT_ASSET_ID` bigint(20) DEFAULT NULL,
  `ASSET_KEY_FLAG` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`PLANT_ID`,`ASSET_ID`),
  UNIQUE KEY `ASSET_ID` (`ASSET_ID`),
  UNIQUE KEY `ASSET_CODE` (`ASSET_CODE`),
  KEY `PLANT_ID_x_ASSET_KEY_FLAG` (`PLANT_ID`,`ASSET_KEY_FLAG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset_component_failure_modes`
--

DROP TABLE IF EXISTS `m_asset_component_failure_modes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_component_failure_modes` (
  `ASSET_CODE` varchar(40) NOT NULL,
  `FMID` varchar(255) NOT NULL,
  `EQUIPMENT_ID` varchar(32) NOT NULL,
  `ASSESSMENT_ID` varchar(255) NOT NULL,
  `FMEA_DISPLAY_ID` varchar(255) NOT NULL,
  `PUBLISHED_DATE` date NOT NULL,
  `CM_FM_DISPLAY_ID` varchar(255) NOT NULL,
  `CM_FM_DESCRIPTION` varchar(255) NOT NULL,
  `FMEAMAP_ID` varchar(255) NOT NULL,
  `CREATE_TIMESTAMP` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `UPDATE_TIMESTAMP` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`ASSET_CODE`,`FMID`),
  KEY `SEARCH_CM_FM_DISPLAY_ID` (`ASSET_CODE`,`CM_FM_DISPLAY_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset_fmea`
--

DROP TABLE IF EXISTS `m_asset_fmea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_fmea` (
  `ASSET_CODE` varchar(40) NOT NULL,
  `EQUIPMENT_ID` varchar(32) NOT NULL,
  `FMEA_DISPLAY_ID` varchar(255) NOT NULL,
  `MAX_RPN` int(11) NOT NULL DEFAULT '0',
  `ASSESSMENT_ID` varchar(255) NOT NULL,
  `PUBLISHED_DATE` date NOT NULL,
  `CREATE_TIMESTAMP` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `UPDATE_TIMESTAMP` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`ASSET_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset_group`
--

DROP TABLE IF EXISTS `m_asset_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_group` (
  `PLANT_ID` varchar(10) NOT NULL,
  `ASSET_GROUP_ID` varchar(10) NOT NULL,
  `ASSET_GROUP_NAME` varchar(120) NOT NULL,
  `UNIT_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`PLANT_ID`,`ASSET_GROUP_ID`),
  CONSTRAINT `m_asset_group_ibfk_1` FOREIGN KEY (`PLANT_ID`) REFERENCES `m_plant` (`PLANT_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset_group_item`
--

DROP TABLE IF EXISTS `m_asset_group_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_group_item` (
  `PLANT_ID` varchar(10) NOT NULL,
  `ASSET_GROUP_ID` varchar(10) NOT NULL,
  `ASSET_ID` bigint(20) NOT NULL,
  `VALID_FROM` date NOT NULL,
  `VALID_TO` date NOT NULL,
  PRIMARY KEY (`PLANT_ID`,`ASSET_GROUP_ID`,`ASSET_ID`),
  UNIQUE KEY `ASSET_ID` (`ASSET_ID`),
  KEY `asset_id_join` (`ASSET_ID`),
  KEY `asset_group_id_search` (`ASSET_GROUP_ID`),
  KEY `PLANT_ID` (`PLANT_ID`,`ASSET_ID`),
  CONSTRAINT `m_asset_group_item_ibfk_1` FOREIGN KEY (`PLANT_ID`, `ASSET_GROUP_ID`) REFERENCES `m_asset_group` (`PLANT_ID`, `ASSET_GROUP_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `m_asset_group_item_ibfk_2` FOREIGN KEY (`PLANT_ID`, `ASSET_ID`) REFERENCES `m_asset_bk` (`PLANT_ID`, `ASSET_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset_model_cm_fm`
--

DROP TABLE IF EXISTS `m_asset_model_cm_fm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_model_cm_fm` (
  `ASSET_CODE` varchar(40) NOT NULL,
  `EQUIPMENT_ID` varchar(32) DEFAULT NULL,
  `CM_FM_DISPLAY_ID` varchar(255) NOT NULL,
  `CM_FM_DESCRIPTION` varchar(255) NOT NULL,
  `FM_ID` varchar(255) NOT NULL,
  `MODEL_ID` varchar(255) NOT NULL,
  `MODEL_NAME` varchar(255) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ASSET_CODE`,`FM_ID`),
  KEY `SEARCH_CM_FM_DISPLAY_ID` (`ASSET_CODE`,`CM_FM_DISPLAY_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_asset_type`
--

DROP TABLE IF EXISTS `m_asset_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_asset_type` (
  `ASSET_TYPE` varchar(10) NOT NULL,
  `LANG` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ASSET_TYPE_NAME` varchar(120) NOT NULL,
  PRIMARY KEY (`ASSET_TYPE`,`LANG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_basis_measuring_item`
--

DROP TABLE IF EXISTS `m_basis_measuring_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_basis_measuring_item` (
  `BASIS_MEASURING_ITEM_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `PLANT_ID` varchar(10) NOT NULL,
  `DEFAULT_NAME` varchar(255) NOT NULL,
  `DEFAULT_CHARACTERISTICS_ID` varchar(30) NOT NULL,
  `DEFAULT_MANDATORY` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`BASIS_MEASURING_ITEM_ID`),
  UNIQUE KEY `plant_id_x_default_name` (`PLANT_ID`,`DEFAULT_NAME`),
  KEY `DEFAULT_CHARACTERISTICS_ID` (`DEFAULT_CHARACTERISTICS_ID`),
  CONSTRAINT `m_basis_measuring_item_ibfk_1` FOREIGN KEY (`DEFAULT_CHARACTERISTICS_ID`) REFERENCES `m_characteristics` (`CHARACTERISTICS_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `m_basis_measuring_item_ibfk_2` FOREIGN KEY (`PLANT_ID`) REFERENCES `m_plant` (`PLANT_ID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_budget_forecast_version`
--

DROP TABLE IF EXISTS `m_budget_forecast_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_budget_forecast_version` (
  `INTERFACE_ID` varchar(40) NOT NULL,
  `VALID_FROM` date NOT NULL,
  `VALID_TO` date NOT NULL,
  `SEQ` int(11) NOT NULL,
  `BUDGET_DATA_CLASS` varchar(1) NOT NULL,
  `BUDGET_VERSION` varchar(3) NOT NULL,
  PRIMARY KEY (`INTERFACE_ID`,`VALID_FROM`,`SEQ`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_characteristics`
--

DROP TABLE IF EXISTS `m_characteristics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_characteristics` (
  `CHARACTERISTICS_ID` varchar(30) NOT NULL,
  `DATA_TYPE` varchar(10) NOT NULL,
  `LENGTH` int(11) NOT NULL,
  `DECIMAL_LENGTH` int(11) DEFAULT NULL,
  `UOM` varchar(15) NOT NULL,
  PRIMARY KEY (`CHARACTERISTICS_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_characteristics_name`
--

DROP TABLE IF EXISTS `m_characteristics_name`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_characteristics_name` (
  `CHARACTERISTICS_ID` varchar(30) NOT NULL,
  `LANG` char(2) NOT NULL,
  `CHARACTERISTICS_NAME` varchar(90) NOT NULL,
  PRIMARY KEY (`CHARACTERISTICS_ID`,`LANG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_characteristics_value_options`
--

DROP TABLE IF EXISTS `m_characteristics_value_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_characteristics_value_options` (
  `CHARACTERISTICS_ID` varchar(30) NOT NULL,
  `LANG` char(2) NOT NULL,
  `SEQ_NO` int(11) NOT NULL,
  `VALUE` varchar(30) NOT NULL,
  PRIMARY KEY (`CHARACTERISTICS_ID`,`LANG`,`SEQ_NO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_code`
--

DROP TABLE IF EXISTS `m_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_code` (
  `CATEGORY_TYPE` varchar(20) NOT NULL,
  `CODE_GROUP` varchar(20) NOT NULL,
  `CODE` varchar(20) NOT NULL,
  `CODE_NAME` varchar(256) NOT NULL,
  `DISPLAY_ORDER` int(11) NOT NULL,
  `IS_DELETED` int(4) NOT NULL DEFAULT '0',
  `CREATED_BY` varchar(256) DEFAULT NULL,
  `UPDATED_BY` varchar(256) DEFAULT NULL,
  `CREATED_DATE` datetime NOT NULL,
  `UPDATED_DATE` datetime NOT NULL,
  PRIMARY KEY (`CATEGORY_TYPE`,`CODE_GROUP`,`CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_document`
--

DROP TABLE IF EXISTS `m_document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_document` (
  `DOC_ID` bigint(20) NOT NULL,
  `ASSET_ID` bigint(20) NOT NULL,
  `DOC_TYPE` varchar(100) NOT NULL,
  `DOC_NAME` varchar(100) NOT NULL,
  `URI` varchar(2048) NOT NULL,
  PRIMARY KEY (`DOC_ID`,`ASSET_ID`),
  KEY `ASSET_ID` (`ASSET_ID`),
  CONSTRAINT `m_document_ibfk_1` FOREIGN KEY (`ASSET_ID`) REFERENCES `m_asset_bk` (`ASSET_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_factor`
--

DROP TABLE IF EXISTS `m_factor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_factor` (
  `FACTOR_ID` int(11) NOT NULL AUTO_INCREMENT,
  `PARENT_OCCURRENCE` int(11) NOT NULL,
  `PARENT_FACTOR` int(11) DEFAULT NULL,
  `LEVEL` int(4) NOT NULL DEFAULT '0',
  `FACTOR_NAME` varchar(255) NOT NULL,
  `IS_DELETED` int(4) NOT NULL DEFAULT '0',
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FACTOR_ID`),
  KEY `PARENT_OCCURRENCE` (`PARENT_OCCURRENCE`),
  KEY `PARENT_FACTOR` (`PARENT_FACTOR`),
  CONSTRAINT `m_factor_ibfk_1` FOREIGN KEY (`PARENT_OCCURRENCE`) REFERENCES `m_occurrence` (`OCCURRENCE_ID`) ON DELETE CASCADE,
  CONSTRAINT `m_factor_ibfk_2` FOREIGN KEY (`PARENT_FACTOR`) REFERENCES `m_factor` (`FACTOR_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_measuring_item`
--

DROP TABLE IF EXISTS `m_measuring_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_measuring_item` (
  `ASSET_ID` bigint(20) DEFAULT NULL,
  `MEASURING_ITEM_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `MEASURING_PATTERN_ID` bigint(20) DEFAULT NULL,
  `BASIS_MEASURING_ITEM_ID` bigint(20) DEFAULT NULL,
  `MEASURING_ITEM_NAME` varchar(120) NOT NULL,
  `MANDATORY` tinyint(4) NOT NULL,
  `CHARACTERISTICS_ID` varchar(30) NOT NULL,
  `UPPER_LIMIT` decimal(16,6) DEFAULT NULL,
  `LOWER_LIMIT` decimal(16,6) DEFAULT NULL,
  `NORMAL_VALUE` decimal(16,6) DEFAULT NULL,
  `MEASURING_ITEM_KEY_FLAG` tinyint(1) NOT NULL DEFAULT '1',
  `ASSOCIATED_FLAG` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`MEASURING_ITEM_ID`),
  UNIQUE KEY `MEASURING_PATTERN_ID` (`MEASURING_PATTERN_ID`,`BASIS_MEASURING_ITEM_ID`),
  KEY `BASIS_MEASURING_ITEM_ID` (`BASIS_MEASURING_ITEM_ID`),
  KEY `CHARACTERISTICS_ID` (`CHARACTERISTICS_ID`),
  KEY `PATTERN_ID_x_ID_x_NAME` (`MEASURING_PATTERN_ID`,`MEASURING_ITEM_ID`,`MEASURING_ITEM_NAME`),
  CONSTRAINT `m_measuring_item_ibfk_1` FOREIGN KEY (`MEASURING_PATTERN_ID`) REFERENCES `m_measuring_pattern` (`MEASURING_PATTERN_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `m_measuring_item_ibfk_2` FOREIGN KEY (`BASIS_MEASURING_ITEM_ID`) REFERENCES `m_basis_measuring_item` (`BASIS_MEASURING_ITEM_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `m_measuring_item_ibfk_3` FOREIGN KEY (`CHARACTERISTICS_ID`) REFERENCES `m_characteristics` (`CHARACTERISTICS_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_measuring_item_set`
--

DROP TABLE IF EXISTS `m_measuring_item_set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_measuring_item_set` (
  `ASSET_ID` bigint(20) NOT NULL,
  `MEASURING_ITEM_SET_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `MEASURING_ITEM_SET_NAME` varchar(90) NOT NULL,
  `CHARACTERISTICS_ID` varchar(30) NOT NULL,
  PRIMARY KEY (`MEASURING_ITEM_SET_ID`),
  KEY `ASSET_ID` (`ASSET_ID`),
  KEY `CHARACTERISTICS_ID` (`CHARACTERISTICS_ID`),
  CONSTRAINT `m_measuring_item_set_ibfk_1` FOREIGN KEY (`ASSET_ID`) REFERENCES `m_asset_bk` (`ASSET_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `m_measuring_item_set_ibfk_2` FOREIGN KEY (`CHARACTERISTICS_ID`) REFERENCES `m_characteristics` (`CHARACTERISTICS_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_measuring_item_set_location`
--

DROP TABLE IF EXISTS `m_measuring_item_set_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_measuring_item_set_location` (
  `MEASURING_ITEM_SET_ID` bigint(20) NOT NULL,
  `MEASURING_ITEM_SET_LOCATION_ID` bigint(20) NOT NULL,
  `MEASURING_ITEM_SET_LOCATION_SORT_NUMBER` bigint(20) NOT NULL,
  `MEASURING_ITEM_ID` bigint(20) NOT NULL,
  `MEASURING_ITEM_SORT_NUMBER` bigint(20) NOT NULL,
  PRIMARY KEY (`MEASURING_ITEM_SET_ID`,`MEASURING_ITEM_SET_LOCATION_ID`,`MEASURING_ITEM_ID`),
  UNIQUE KEY `MEASURING_ITEM_ID` (`MEASURING_ITEM_ID`),
  KEY `MEASURING_ITEM_SET_LOCATION_ID` (`MEASURING_ITEM_SET_LOCATION_ID`),
  CONSTRAINT `m_measuring_item_set_location_ibfk_1` FOREIGN KEY (`MEASURING_ITEM_SET_ID`) REFERENCES `m_measuring_item_set` (`MEASURING_ITEM_SET_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `m_measuring_item_set_location_ibfk_2` FOREIGN KEY (`MEASURING_ITEM_ID`) REFERENCES `m_measuring_item` (`MEASURING_ITEM_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `m_measuring_item_set_location_ibfk_3` FOREIGN KEY (`MEASURING_ITEM_SET_LOCATION_ID`) REFERENCES `m_measuring_item_set_location_name` (`MEASURING_ITEM_SET_LOCATION_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_measuring_item_set_location_name`
--

DROP TABLE IF EXISTS `m_measuring_item_set_location_name`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_measuring_item_set_location_name` (
  `MEASURING_ITEM_SET_LOCATION_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `MEASURING_ITEM_SET_LOCATION_NAME` varchar(120) NOT NULL,
  PRIMARY KEY (`MEASURING_ITEM_SET_LOCATION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_measuring_pattern`
--

DROP TABLE IF EXISTS `m_measuring_pattern`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_measuring_pattern` (
  `MEASURING_PATTERN_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `NAME` varchar(255) NOT NULL,
  `ASSET_ID` bigint(20) NOT NULL,
  `MEASURING_TEMPLATE_PATTERN_ID` bigint(20) NOT NULL,
  `ASSOCIATED_FLAG` tinyint(1) NOT NULL DEFAULT '1',
  `MEASURING_PATTERN_MEMO` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MEASURING_PATTERN_ID`),
  UNIQUE KEY `ASSET_ID` (`ASSET_ID`,`MEASURING_TEMPLATE_PATTERN_ID`),
  KEY `MEASURING_TEMPLATE_PATTERN_ID` (`MEASURING_TEMPLATE_PATTERN_ID`),
  KEY `NAME_x_ID` (`NAME`,`MEASURING_PATTERN_ID`),
  CONSTRAINT `m_measuring_pattern_ibfk_1` FOREIGN KEY (`ASSET_ID`) REFERENCES `m_asset_bk` (`ASSET_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `m_measuring_pattern_ibfk_2` FOREIGN KEY (`MEASURING_TEMPLATE_PATTERN_ID`) REFERENCES `m_measuring_template_pattern` (`MEASURING_TEMPLATE_PATTERN_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_measuring_template_item`
--

DROP TABLE IF EXISTS `m_measuring_template_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_measuring_template_item` (
  `MEASURING_TEMPLATE_PATTERN_ID` bigint(20) NOT NULL,
  `BASIS_MEASURING_ITEM_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`MEASURING_TEMPLATE_PATTERN_ID`,`BASIS_MEASURING_ITEM_ID`),
  KEY `BASIS_MEASURING_ITEM_ID` (`BASIS_MEASURING_ITEM_ID`),
  CONSTRAINT `m_measuring_template_item_ibfk_1` FOREIGN KEY (`MEASURING_TEMPLATE_PATTERN_ID`) REFERENCES `m_measuring_template_pattern` (`MEASURING_TEMPLATE_PATTERN_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `m_measuring_template_item_ibfk_2` FOREIGN KEY (`BASIS_MEASURING_ITEM_ID`) REFERENCES `m_basis_measuring_item` (`BASIS_MEASURING_ITEM_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_measuring_template_pattern`
--

DROP TABLE IF EXISTS `m_measuring_template_pattern`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_measuring_template_pattern` (
  `MEASURING_TEMPLATE_PATTERN_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `PLANT_ID` varchar(10) NOT NULL,
  `NAME` varchar(255) NOT NULL,
  `MEASURING_TEMPLATE_PATTERN_MEMO` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MEASURING_TEMPLATE_PATTERN_ID`),
  UNIQUE KEY `PLANT_ID_X_NAME` (`PLANT_ID`,`NAME`),
  CONSTRAINT `m_measuring_template_pattern_ibfk_1` FOREIGN KEY (`PLANT_ID`) REFERENCES `m_plant` (`PLANT_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_notification_email_recipient`
--

DROP TABLE IF EXISTS `m_notification_email_recipient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_notification_email_recipient` (
  `PLANT_ID` varchar(10) NOT NULL,
  `EMAIL_ADDRESS` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`PLANT_ID`,`EMAIL_ADDRESS`),
  CONSTRAINT `m_notification_email_recipient_ibfk_1` FOREIGN KEY (`PLANT_ID`) REFERENCES `m_plant` (`PLANT_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_notification_email_recipient_bk`
--

DROP TABLE IF EXISTS `m_notification_email_recipient_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_notification_email_recipient_bk` (
  `PLANT_ID` varchar(10) NOT NULL,
  `EMAIL_ADDRESS` varchar(255) NOT NULL,
  PRIMARY KEY (`PLANT_ID`,`EMAIL_ADDRESS`),
  CONSTRAINT `m_notification_email_recipient_bk_ibfk_1` FOREIGN KEY (`PLANT_ID`) REFERENCES `m_plant` (`PLANT_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_notification_settings`
--

DROP TABLE IF EXISTS `m_notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_notification_settings` (
  `PLANT_ID` varchar(10) NOT NULL,
  `CHANGE_AMOUNT_THRESHOLD` bigint(20) NOT NULL,
  `CHANGE_TIME_THRESHOLD` enum('half-year','5-months','4-months','3-months','2-months','1-month','3-weeks','2-weeks','1-week') DEFAULT NULL,
  `START_DATETIME_THRESHOLD` int(11) DEFAULT '0',
  PRIMARY KEY (`PLANT_ID`),
  CONSTRAINT `m_notification_settings_ibfk_1` FOREIGN KEY (`PLANT_ID`) REFERENCES `m_plant` (`PLANT_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_notification_settings_bk`
--

DROP TABLE IF EXISTS `m_notification_settings_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_notification_settings_bk` (
  `PLANT_ID` varchar(10) NOT NULL,
  `CHANGE_AMOUNT_THRESHOLD` bigint(20) NOT NULL,
  `CHANGE_TIME_THRESHOLD` enum('half-year','5-months','4-months','3-months','2-months','1-month','3-weeks','2-weeks','1-week') DEFAULT NULL,
  `START_DATETIME_THRESHOLD` int(11) DEFAULT '0',
  PRIMARY KEY (`PLANT_ID`),
  CONSTRAINT `m_notification_settings_bk_ibfk_1` FOREIGN KEY (`PLANT_ID`) REFERENCES `m_plant` (`PLANT_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_occurrence`
--

DROP TABLE IF EXISTS `m_occurrence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_occurrence` (
  `OCCURRENCE_ID` int(11) NOT NULL AUTO_INCREMENT,
  `OCCURRENCE_NAME` varchar(255) NOT NULL,
  `RELATED_KKS_CODE` varchar(255) DEFAULT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `PLANT_UNIT_ID` varchar(10) NOT NULL,
  `IS_DELETED` int(4) NOT NULL DEFAULT '0',
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`OCCURRENCE_ID`),
  KEY `RELATED_KKS_CODE` (`RELATED_KKS_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_occurrence_kks`
--

DROP TABLE IF EXISTS `m_occurrence_kks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_occurrence_kks` (
  `OCCURRENCE_ID` int(11) NOT NULL,
  `KKS_CODE` varchar(255) NOT NULL,
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`OCCURRENCE_ID`,`KKS_CODE`),
  UNIQUE KEY `OCCURRENCE_ID` (`OCCURRENCE_ID`,`KKS_CODE`),
  KEY `KKS_CODE` (`KKS_CODE`),
  CONSTRAINT `m_occurrence_kks_ibfk_1` FOREIGN KEY (`OCCURRENCE_ID`) REFERENCES `m_occurrence` (`OCCURRENCE_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_part`
--

DROP TABLE IF EXISTS `m_part`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_part` (
  `PLANT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PART_CODE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PART_NAME` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CREATE_TIMESTAMP` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PLANT_ID`,`PART_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_pid_kks`
--

DROP TABLE IF EXISTS `m_pid_kks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_pid_kks` (
  `T_PID` varchar(23) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `KKS_CD` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DELETE_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '0',
  `CREATION_DATE_TIME` datetime DEFAULT NULL,
  `UPDATE_DATE_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`T_PID`,`KKS_CD`),
  KEY `findRelatedKks` (`T_PID`) USING BTREE,
  KEY `findRelatedPid` (`KKS_CD`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_pidmaster_est`
--

DROP TABLE IF EXISTS `m_pidmaster_est`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_pidmaster_est` (
  `DATABASE` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `MEASUREMENT` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `PID` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `T_PID_NO` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `ITEM_CLASSIFICATION` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TRANSFORM_LOGIC` float DEFAULT NULL,
  `CREATE_TIMESTAMP` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`DATABASE`,`MEASUREMENT`,`PID`,`T_PID_NO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_pids`
--

DROP TABLE IF EXISTS `m_pids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_pids` (
  `T_PID` varchar(23) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_UNIT` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IOT_PID` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_NAME` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_CD` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `VALUE_SEG_CD` int(11) DEFAULT NULL,
  `VALUE_SEG_NAME` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SI_UNIT` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOWER_LIMIT` decimal(20,10) DEFAULT NULL,
  `UPPER_LIMIT` decimal(20,10) DEFAULT NULL,
  `DECIMAL_POINT_POSITION` tinyint(4) DEFAULT NULL,
  `OFF_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ON_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ALARM_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DELETE_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CREATION_DATE_TIME` datetime DEFAULT NULL,
  `UPDATE_DATE_TIME` datetime DEFAULT NULL,
  `plant_id` varchar(10) NOT NULL DEFAULT 'HE',
  `CONDITION_FLG` char(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_pids_bk_20230420`
--

DROP TABLE IF EXISTS `m_pids_bk_20230420`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_pids_bk_20230420` (
  `T_PID` varchar(23) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_UNIT` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IOT_PID` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_NAME` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_CD` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `VALUE_SEG_CD` int(11) DEFAULT NULL,
  `VALUE_SEG_NAME` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SI_UNIT` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOWER_LIMIT` decimal(20,10) DEFAULT NULL,
  `UPPER_LIMIT` decimal(20,10) DEFAULT NULL,
  `DECIMAL_POINT_POSITION` tinyint(4) DEFAULT NULL,
  `OFF_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ON_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ALARM_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DELETE_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CREATION_DATE_TIME` datetime DEFAULT NULL,
  `UPDATE_DATE_TIME` datetime DEFAULT NULL,
  `plant_id` varchar(10) NOT NULL DEFAULT 'HE',
  `CONDITION_FLG` char(1) DEFAULT NULL,
  PRIMARY KEY (`T_PID`),
  UNIQUE KEY `pid_no` (`T_PID`,`T_PID_UNIT`),
  KEY `location` (`T_PID_UNIT`) USING BTREE,
  KEY `pid` (`T_PID`) USING BTREE,
  KEY `ALARM_FLG` (`ALARM_FLG`),
  KEY `plant_id` (`plant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_pids_bk_20230523`
--

DROP TABLE IF EXISTS `m_pids_bk_20230523`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_pids_bk_20230523` (
  `T_PID` varchar(23) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_UNIT` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IOT_PID` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_NAME` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_CD` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `VALUE_SEG_CD` int(11) DEFAULT NULL,
  `VALUE_SEG_NAME` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SI_UNIT` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOWER_LIMIT` decimal(20,10) DEFAULT NULL,
  `UPPER_LIMIT` decimal(20,10) DEFAULT NULL,
  `DECIMAL_POINT_POSITION` tinyint(4) DEFAULT NULL,
  `OFF_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ON_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ALARM_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DELETE_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CREATION_DATE_TIME` datetime DEFAULT NULL,
  `UPDATE_DATE_TIME` datetime DEFAULT NULL,
  `plant_id` varchar(10) NOT NULL DEFAULT 'HE',
  `CONDITION_FLG` char(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_pids_bk_20230616`
--

DROP TABLE IF EXISTS `m_pids_bk_20230616`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_pids_bk_20230616` (
  `T_PID` varchar(23) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_UNIT` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IOT_PID` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_NAME` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_CD` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `VALUE_SEG_CD` int(11) DEFAULT NULL,
  `VALUE_SEG_NAME` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SI_UNIT` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOWER_LIMIT` decimal(20,10) DEFAULT NULL,
  `UPPER_LIMIT` decimal(20,10) DEFAULT NULL,
  `DECIMAL_POINT_POSITION` tinyint(4) DEFAULT NULL,
  `OFF_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ON_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ALARM_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DELETE_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CREATION_DATE_TIME` datetime DEFAULT NULL,
  `UPDATE_DATE_TIME` datetime DEFAULT NULL,
  `plant_id` varchar(10) NOT NULL DEFAULT 'HE',
  `CONDITION_FLG` char(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_pids_bk_20230620`
--

DROP TABLE IF EXISTS `m_pids_bk_20230620`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_pids_bk_20230620` (
  `T_PID` varchar(23) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_UNIT` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IOT_PID` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `T_PID_NAME` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_CD` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATA_SEG_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `VALUE_SEG_CD` int(11) DEFAULT NULL,
  `VALUE_SEG_NAME` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SI_UNIT` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LOWER_LIMIT` decimal(20,10) DEFAULT NULL,
  `UPPER_LIMIT` decimal(20,10) DEFAULT NULL,
  `DECIMAL_POINT_POSITION` tinyint(4) DEFAULT NULL,
  `OFF_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ON_STATUS_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ALARM_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DELETE_FLG` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CREATION_DATE_TIME` datetime DEFAULT NULL,
  `UPDATE_DATE_TIME` datetime DEFAULT NULL,
  `plant_id` varchar(10) NOT NULL DEFAULT 'HE',
  `CONDITION_FLG` char(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_plant`
--

DROP TABLE IF EXISTS `m_plant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_plant` (
  `PLANT_ID` varchar(10) NOT NULL,
  `PLANT_TEXT` varchar(300) NOT NULL,
  PRIMARY KEY (`PLANT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_plant_section`
--

DROP TABLE IF EXISTS `m_plant_section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_plant_section` (
  `plant_id` varchar(10) NOT NULL,
  `code` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  UNIQUE KEY `unique_plant_id_x_code` (`plant_id`,`code`),
  UNIQUE KEY `unique_plant_id_x_name` (`plant_id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_plant_unit`
--

DROP TABLE IF EXISTS `m_plant_unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_plant_unit` (
  `PLANT_ID` varchar(10) NOT NULL,
  `PLANT_UNIT_ID` varchar(10) NOT NULL,
  `DESCRIPTION` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`PLANT_ID`,`PLANT_UNIT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_plant_unit_est`
--

DROP TABLE IF EXISTS `m_plant_unit_est`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_plant_unit_est` (
  `UNIT_ID` varchar(20) NOT NULL,
  `UNIT_NAME` varchar(20) NOT NULL,
  `UNIT_GROUP` varchar(20) NOT NULL,
  `PLANT_ID` varchar(20) NOT NULL,
  `DISPLAY_OPTION` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`UNIT_ID`),
  KEY `PLANT_ID` (`PLANT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_reported_organization`
--

DROP TABLE IF EXISTS `m_reported_organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_reported_organization` (
  `PLANT_ID` varchar(10) NOT NULL,
  `REPORTED_ORGANIZATION_ID` varchar(40) NOT NULL,
  `REPORTED_ORGANIZATION_NAME` varchar(255) NOT NULL,
  PRIMARY KEY (`REPORTED_ORGANIZATION_ID`),
  KEY `PLANT_ID` (`PLANT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_suggestion`
--

DROP TABLE IF EXISTS `m_suggestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_suggestion` (
  `SUGGESTION_ID` int(11) NOT NULL AUTO_INCREMENT,
  `RELATED_OCCURRENCE_ID` int(11) DEFAULT NULL,
  `ASSESSMENT_TEXT_INFO` text NOT NULL,
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  `RELATED_FACTOR_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`SUGGESTION_ID`),
  UNIQUE KEY `RELATED_FACTOR_ID` (`RELATED_FACTOR_ID`),
  UNIQUE KEY `RELATED_OCCURRENCE_ID` (`RELATED_OCCURRENCE_ID`),
  KEY `RELATED_OCCURRENCE_ID_2` (`RELATED_OCCURRENCE_ID`),
  CONSTRAINT `m_suggestion_ibfk_1` FOREIGN KEY (`RELATED_OCCURRENCE_ID`) REFERENCES `m_occurrence` (`OCCURRENCE_ID`) ON DELETE CASCADE,
  CONSTRAINT `m_suggestion_ibfk_2` FOREIGN KEY (`RELATED_FACTOR_ID`) REFERENCES `m_factor` (`FACTOR_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_suggestion_attachment_file`
--

DROP TABLE IF EXISTS `m_suggestion_attachment_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_suggestion_attachment_file` (
  `SUGGESTION_FILE_ID` int(11) NOT NULL AUTO_INCREMENT,
  `SUGGESTION_ID` int(11) NOT NULL,
  `CONTAINER_NAME` varchar(255) NOT NULL,
  `FILE_URL` text NOT NULL,
  `FILE_NAME` varchar(255) NOT NULL,
  `MIME_TYPE` varchar(255) NOT NULL,
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`SUGGESTION_FILE_ID`),
  KEY `SUGGESTION_ID` (`SUGGESTION_ID`),
  CONSTRAINT `m_suggestion_attachment_file_ibfk_1` FOREIGN KEY (`SUGGESTION_ID`) REFERENCES `m_suggestion` (`SUGGESTION_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_trend_measuring_item_limit`
--

DROP TABLE IF EXISTS `m_trend_measuring_item_limit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_trend_measuring_item_limit` (
  `MEASURING_ITEM_ID` bigint(20) NOT NULL,
  `UPPER_LIMIT` decimal(16,6) DEFAULT NULL,
  `LOWER_LIMIT` decimal(16,6) DEFAULT NULL,
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MEASURING_ITEM_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_trend_pid_limit`
--

DROP TABLE IF EXISTS `m_trend_pid_limit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_trend_pid_limit` (
  `PID` varchar(23) NOT NULL,
  `UPPER_LIMIT` decimal(20,10) DEFAULT NULL,
  `LOWER_LIMIT` decimal(20,10) DEFAULT NULL,
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`PID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_type_of_stoppage`
--

DROP TABLE IF EXISTS `m_type_of_stoppage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_type_of_stoppage` (
  `TYPE_OF_STOPPAGE` varchar(2) NOT NULL,
  `TYPE_OF_STOPPAGE_TEXT` varchar(120) NOT NULL,
  `MAJOR_MAINTENANCE_FLAG` smallint(1) NOT NULL DEFAULT '0',
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TYPE_OF_STOPPAGE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_unit_of_measure`
--

DROP TABLE IF EXISTS `m_unit_of_measure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_unit_of_measure` (
  `UNIT_CODE` varchar(3) NOT NULL,
  `CONVERSION_FACTOR` int(11) NOT NULL,
  `UNIT_TEXT` varchar(3) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UNIT_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_unitmaster`
--

DROP TABLE IF EXISTS `m_unitmaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_unitmaster` (
  `UNIT_CODE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UNIT_NAME` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PLANT_CODE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PLANT_NAME` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `RATED_OUTPUT` float NOT NULL,
  `PMAJPN_UNIT_ID` int(11) NOT NULL,
  `IOT_UNIT` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PMAJPN_AREA_ID` int(11) NOT NULL,
  `PMAJPN_PRICE_INDEX_FIXED` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PMAJPN_PRICE_INDEX_PRELIMINARY` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PMAJPN_PRICE_INDEX_FORWARD` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PMAJPN_PRICE_INDEX_FORWARD_SUB` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PMAJPN_FUEL_CATEGORY` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SAP_FI_PARTICULARS_PROFIT_CENTRE_PARTIAL_NAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SAP_FI_SLIP_PROFIT_CENTRE_PARTIAL_NAME` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SAP_PM_WBS_ITEM` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SAP_PM_WBS_ITEM_DETAILS` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UNIT_START_DATE` date NOT NULL,
  `PROFIT_START_DATE` date DEFAULT NULL,
  `DISPLAY_ON_DASHBOARD` tinyint(1) DEFAULT NULL,
  `CREATE_TIMESTAMP` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UNIT_CODE`) USING BTREE,
  KEY `PRICE_FORWARD_SUB` (`PMAJPN_PRICE_INDEX_FORWARD_SUB`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user`
--

DROP TABLE IF EXISTS `m_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user` (
  `USER_ID` varchar(255) NOT NULL,
  `USER_NAME` varchar(255) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `PLANT_UNIT_ID` varchar(10) NOT NULL,
  PRIMARY KEY (`USER_ID`,`PLANT_UNIT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_aot`
--

DROP TABLE IF EXISTS `m_user_aot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_aot` (
  `USER_ID` varchar(256) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `PLANT_UNIT_ID` varchar(10) NOT NULL,
  PRIMARY KEY (`USER_ID`,`PLANT_UNIT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_dmd`
--

DROP TABLE IF EXISTS `m_user_dmd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_dmd` (
  `user_id` varchar(255) NOT NULL,
  `plant_id` varchar(10) NOT NULL,
  `unit_id` varchar(10) NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `plant_id` (`plant_id`,`unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_est`
--

DROP TABLE IF EXISTS `m_user_est`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_est` (
  `USER_ID` varchar(256) NOT NULL,
  `AREA` varchar(10) DEFAULT NULL,
  `NAME` varchar(255) DEFAULT NULL,
  `PLANT_ID` varchar(10) DEFAULT NULL,
  `PLANT_UNIT_ID` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_got`
--

DROP TABLE IF EXISTS `m_user_got`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_got` (
  `USER_ID` varchar(256) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `ASSET_GROUP_ID` varchar(10) NOT NULL,
  PRIMARY KEY (`USER_ID`),
  KEY `PLANT_ID` (`PLANT_ID`,`ASSET_GROUP_ID`),
  CONSTRAINT `m_user_got_ibfk_1` FOREIGN KEY (`PLANT_ID`, `ASSET_GROUP_ID`) REFERENCES `m_asset_group` (`PLANT_ID`, `ASSET_GROUP_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_hot_fa`
--

DROP TABLE IF EXISTS `m_user_hot_fa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_hot_fa` (
  `user_id` varchar(255) NOT NULL,
  `plant_id` varchar(10) NOT NULL,
  `asset_group_id` varchar(10) NOT NULL,
  PRIMARY KEY (`user_id`,`asset_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_hot_fp`
--

DROP TABLE IF EXISTS `m_user_hot_fp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_hot_fp` (
  `user_id` varchar(255) NOT NULL,
  `plant_id` varchar(10) NOT NULL,
  `asset_group_id` varchar(10) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_lot`
--

DROP TABLE IF EXISTS `m_user_lot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_lot` (
  `USER_ID` varchar(256) NOT NULL,
  `USER_NAME` varchar(120) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `ASSET_GROUP_ID` varchar(10) NOT NULL,
  PRIMARY KEY (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_maintenance_order_search_filter_preferences`
--

DROP TABLE IF EXISTS `m_user_maintenance_order_search_filter_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_maintenance_order_search_filter_preferences` (
  `USER_ID` varchar(256) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `PREFERENCES` json DEFAULT NULL,
  PRIMARY KEY (`USER_ID`,`PLANT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_mot`
--

DROP TABLE IF EXISTS `m_user_mot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_mot` (
  `USER_ID` varchar(256) NOT NULL,
  `USER_NAME` varchar(120) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `ASSET_GROUP_ID` varchar(10) NOT NULL,
  PRIMARY KEY (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_pot`
--

DROP TABLE IF EXISTS `m_user_pot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_pot` (
  `USER_ID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PLANT_ID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PLANT_UNIT_ID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_reference_power`
--

DROP TABLE IF EXISTS `m_user_reference_power`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_reference_power` (
  `USER_ID` varchar(255) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `PLANT_UNIT_ID` varchar(10) NOT NULL,
  `CREATED_AT` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`USER_ID`,`PLANT_UNIT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_sot_fp`
--

DROP TABLE IF EXISTS `m_user_sot_fp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_sot_fp` (
  `USER_ID` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `PLANT_ID` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `ASSET_GROUP_ID` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_status`
--

DROP TABLE IF EXISTS `m_user_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_status` (
  `NOTIFICATION_TYPE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `USER_STATUS` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `USER_STATUS_NAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CREATE_TIMESTAMP` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`NOTIFICATION_TYPE`,`USER_STATUS`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_user_wot`
--

DROP TABLE IF EXISTS `m_user_wot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_user_wot` (
  `USER_ID` varchar(256) NOT NULL,
  `NAME` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `PLANT_ID` varchar(10) NOT NULL,
  `ASSET_GROUP_ID` varchar(10) NOT NULL,
  PRIMARY KEY (`USER_ID`,`PLANT_ID`,`ASSET_GROUP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_work_division`
--

DROP TABLE IF EXISTS `m_work_division`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `m_work_division` (
  `PLANT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `WORK_DIVISION_CODE` varchar(256) NOT NULL,
  `WORK_DIVISION_NAME` varchar(256) NOT NULL,
  PRIMARY KEY (`PLANT_ID`,`WORK_DIVISION_CODE`),
  CONSTRAINT `m_work_division_ibfk_1` FOREIGN KEY (`PLANT_ID`) REFERENCES `m_plant` (`PLANT_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modelmgmt`
--

DROP TABLE IF EXISTS `modelmgmt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modelmgmt` (
  `ModelType` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `RunType` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `RunId` bigint(20) NOT NULL,
  `OutputId` bigint(20) NOT NULL,
  `InputScenarioName` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `OutputScenarioName` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `pool` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `RunTime` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Status` smallint(6) NOT NULL,
  `OutputTitle` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `Description` varchar(2048) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `Updated` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`RunId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `moduleresultsunits`
--

DROP TABLE IF EXISTS `moduleresultsunits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moduleresultsunits` (
  `RunId` bigint(20) NOT NULL,
  `Date` date NOT NULL,
  `Hour` bigint(20) NOT NULL,
  `UnitId` bigint(20) NOT NULL,
  `LMP` float DEFAULT NULL,
  `Bid` float DEFAULT NULL,
  `GenerationMW` float DEFAULT NULL,
  PRIMARY KEY (`RunId`,`Date`,`Hour`,`UnitId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_additionalbusinesspartners`
--

DROP TABLE IF EXISTS `t_additionalbusinesspartners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_additionalbusinesspartners` (
  `ADDITIONALBUSINESSPARTNERID` int(11) NOT NULL AUTO_INCREMENT,
  `ID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `BPROLE` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ADDITIONALBUSINESSPARTNERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_admindata`
--

DROP TABLE IF EXISTS `t_admindata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_admindata` (
  `ADMINDATAID` int(11) NOT NULL AUTO_INCREMENT,
  `CREATEDBY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDON` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CHANGEDBY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CHANGEDON` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ADMINDATAID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_alert_checkpoint`
--

DROP TABLE IF EXISTS `t_alert_checkpoint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alert_checkpoint` (
  `PID` varchar(23) NOT NULL,
  `CHECKPOINT` datetime DEFAULT NULL,
  PRIMARY KEY (`PID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_alert_dialog`
--

DROP TABLE IF EXISTS `t_alert_dialog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alert_dialog` (
  `UUID` varchar(100) NOT NULL,
  `SEARCH_TYPE` varchar(20) DEFAULT NULL,
  `RESULT` varchar(20) DEFAULT NULL,
  `COMMENT` text NOT NULL,
  `COMPLETED` tinyint(1) DEFAULT '0',
  `ALERT_KEY` varchar(255) NOT NULL,
  `ALERT_TYPE` varchar(80) NOT NULL,
  `CREATE_DATE` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UUID`),
  KEY `ALERT_KEY` (`ALERT_KEY`,`ALERT_TYPE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_alert_factor`
--

DROP TABLE IF EXISTS `t_alert_factor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alert_factor` (
  `TRANSACTION_ALERT_FACTOR_ID` int(11) NOT NULL AUTO_INCREMENT,
  `ALERT_KEY` varchar(255) NOT NULL,
  `ALERT_TYPE` varchar(255) NOT NULL,
  `ALERT_FACTOR_NAME` varchar(255) NOT NULL,
  `PARENT_ALERT_FACTOR_ID` int(11) DEFAULT NULL,
  `PARENT_TRANSACTION_ALERT_FACTOR_ID` int(11) DEFAULT NULL,
  `LEVEL` int(4) NOT NULL DEFAULT '0',
  `CONCERN_ID` int(11) NOT NULL,
  `IS_DELETED` int(4) NOT NULL DEFAULT '0',
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  `UUID` varchar(100) NOT NULL,
  PRIMARY KEY (`TRANSACTION_ALERT_FACTOR_ID`),
  UNIQUE KEY `UUID` (`UUID`),
  KEY `ALERT_KEY` (`ALERT_KEY`),
  KEY `CONCERN_ID` (`CONCERN_ID`),
  CONSTRAINT `t_alert_factor_ibfk_2` FOREIGN KEY (`CONCERN_ID`) REFERENCES `t_concerns` (`CONCERN_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_alert_factor_dialog`
--

DROP TABLE IF EXISTS `t_alert_factor_dialog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alert_factor_dialog` (
  `UUID` varchar(100) NOT NULL,
  `SEARCH_TYPE` varchar(20) DEFAULT NULL,
  `RESULT` varchar(20) DEFAULT NULL,
  `COMMENT` text NOT NULL,
  `COMPLETED` tinyint(1) DEFAULT '0',
  `CONFIG_UUID` varchar(100) NOT NULL,
  `CREATE_DATE` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UUID`),
  KEY `CONFIG_UUID` (`CONFIG_UUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_alerts`
--

DROP TABLE IF EXISTS `t_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alerts` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ALERT_NAME` varchar(255) NOT NULL,
  `ALERT_KEY` varchar(255) NOT NULL,
  `ALERT_TYPE` varchar(80) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `PLANT_UNIT_ID` varchar(10) NOT NULL,
  `START_DATETIME` datetime NOT NULL,
  `END_DATETIME` datetime DEFAULT NULL,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ALERT_KEY` (`ALERT_KEY`,`PLANT_ID`,`START_DATETIME`),
  KEY `ALERT_KEY_2` (`ALERT_KEY`,`ALERT_TYPE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_ann_alarms`
--

DROP TABLE IF EXISTS `t_ann_alarms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_ann_alarms` (
  `name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `full_pid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `pid` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `from` datetime NOT NULL,
  `until` datetime DEFAULT NULL,
  `kks` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `alert_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ann',
  UNIQUE KEY `full_pid` (`full_pid`,`from`,`alert_type`),
  KEY `PowerPlantAndPowerPlantUnit` (`full_pid`(7)),
  KEY `pidTag` (`pid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_ann_raw_data_checkpoint`
--

DROP TABLE IF EXISTS `t_ann_raw_data_checkpoint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_ann_raw_data_checkpoint` (
  `time` datetime NOT NULL,
  `pid_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `last_transition_to_close` datetime DEFAULT NULL,
  UNIQUE KEY `pid` (`pid_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_assessmentfailuremodecauses`
--

DROP TABLE IF EXISTS `t_assessmentfailuremodecauses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_assessmentfailuremodecauses` (
  `SEQUENTIALID` int(11) NOT NULL AUTO_INCREMENT,
  `RPN` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `OBUJECTTYPE` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FMID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FMEAMAPID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FMDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SEQUENTIALID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_assessmentfailuremodeeffects`
--

DROP TABLE IF EXISTS `t_assessmentfailuremodeeffects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_assessmentfailuremodeeffects` (
  `SEQUENTIALID` int(11) NOT NULL AUTO_INCREMENT,
  `RPN` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBUJECTTYPE` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISOWN` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FMID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FMEAMAPID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FMDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SEQUENTIALID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_assessmentfailuremodes`
--

DROP TABLE IF EXISTS `t_assessmentfailuremodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_assessmentfailuremodes` (
  `FMID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `FMEAMAPID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `FMDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `FMIMAGE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FMVERSION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONGDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TYPES` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FMID`,`FMEAMAPID`,`FMDISPLAYID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_assessmentobjects`
--

DROP TABLE IF EXISTS `t_assessmentobjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_assessmentobjects` (
  `ASSESSMENTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `OBJECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `OBJECTVERSION` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTTYPE` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ASSESSMENTID`,`OBJECTID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_assessmenttemplates`
--

DROP TABLE IF EXISTS `t_assessmenttemplates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_assessmenttemplates` (
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `VERSION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESCRIPTION` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONGDESCRIPTION` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PUBLISHDATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MINVALUE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MAXVALUE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `HASDEPENDENTOBJECTS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MYASSESSMENTTEMPLATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `BUSINESSOBJECTS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CONSUME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DEPENDENTOBJECTSCOUNT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `UPDATIONTIME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OWNERSHIP` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CLIENT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `GRANTPRIVILEGE` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ISALPHANUMERIC` int(11) DEFAULT NULL,
  `IMPACTTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDBY` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CHANGEDBY` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LOGOURL` text COLLATE utf8mb4_unicode_ci,
  `ORGANIZATIONNAME` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `INTENTTYPE` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `INTENTTEXT` text COLLATE utf8mb4_unicode_ci,
  `UPDATIONBY` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `INTENTDESCRIPTION` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_assessmenttemplatesdimensions`
--

DROP TABLE IF EXISTS `t_assessmenttemplatesdimensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_assessmenttemplatesdimensions` (
  `SHORTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONGDESCRIPTION` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SCALEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SCALETYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SCALENAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SCALEDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `WEIGHTAGE` float DEFAULT NULL,
  `SCALEOPTIONCOUNT` int(11) DEFAULT NULL,
  `QUESTIONTEXT` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `AXIS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISMANDATORY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DIMENSIONTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISDIMENSIONFINANCIALRISKRELEVANT` tinyint(1) DEFAULT NULL,
  `ASSESSMENTTEMPLATEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_assessmenttemplatesimpacts`
--

DROP TABLE IF EXISTS `t_assessmenttemplatesimpacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_assessmenttemplatesimpacts` (
  `ASSESSMENTTEMPLATEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `STATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LASTCHANGEDAT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LASTCHANGEDBY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESCRIPTION` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONGDESCRIPTION` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMPACTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMPACTDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMPACTIMAGEURL` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMPACTWEIGHTAGE` float DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ASSESSMENTTEMPLATEID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_assignedobjects`
--

DROP TABLE IF EXISTS `t_assignedobjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_assignedobjects` (
  `OBJECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `OBJECTVERSION` int(11) DEFAULT NULL,
  `OBJECTTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`OBJECTID`,`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_attatchment`
--

DROP TABLE IF EXISTS `t_attatchment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_attatchment` (
  `ATTATCHMENT_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `ATTATCHED_DATA_TYPE` varchar(20) NOT NULL,
  `ATTATCHED_DATA_ID` bigint(20) NOT NULL,
  `MIME_TYPE` varchar(100) NOT NULL,
  `FILE_NAME` varchar(1024) NOT NULL,
  `URI` varchar(2048) NOT NULL,
  `FILE_NAME_THUMBNAIL` varchar(1024) DEFAULT NULL,
  `URI_THUMBNAIL` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`ATTATCHMENT_ID`),
  KEY `attach_data_type_id` (`ATTATCHED_DATA_TYPE`,`ATTATCHED_DATA_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_attributesindicatorstemplates`
--

DROP TABLE IF EXISTS `t_attributesindicatorstemplates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_attributesindicatorstemplates` (
  `ATTRIBUTESINDICATORS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTTEMPLATEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ATTRIBUTESINDICATORSCLASSIFICATION` varchar(3) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TEMPLATESCLASSIFICATION` varchar(3) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_categories`
--

DROP TABLE IF EXISTS `t_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_categories` (
  `CATEGORYID` int(11) NOT NULL AUTO_INCREMENT,
  `CODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TEXT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CATEGORYID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_causes`
--

DROP TABLE IF EXISTS `t_causes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_causes` (
  `CAUSEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `SELECTEDEFFECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ACTIVITYCOUNT` int(11) DEFAULT NULL,
  `RPN` float DEFAULT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESC` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISOWN` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FMEAMAPID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CAUSEID`,`FMEAMAPID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_chain_memo`
--

DROP TABLE IF EXISTS `t_chain_memo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_chain_memo` (
  `CHAIN_MEMO_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `ORDER_ID` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `USER_ID` varchar(256) NOT NULL,
  `MEMO` varchar(400) NOT NULL,
  `IMPORTANT_FLAG` tinyint(1) DEFAULT NULL,
  `CREATED_DATETIME` datetime NOT NULL,
  `UPDATED_DATETIME` datetime NOT NULL,
  `DELETED_FLAG` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`CHAIN_MEMO_ID`),
  KEY `chain_memo_to_order_fk` (`ORDER_ID`),
  CONSTRAINT `chain_memo_to_order_fk` FOREIGN KEY (`ORDER_ID`) REFERENCES `t_order` (`ORDER_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_chain_memo_attachment`
--

DROP TABLE IF EXISTS `t_chain_memo_attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_chain_memo_attachment` (
  `ATTACHMENT_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `CHAIN_MEMO_ID` bigint(20) NOT NULL,
  `MIME_TYPE` varchar(100) NOT NULL,
  `FILE_NAME` varchar(1024) NOT NULL,
  `URI` varchar(2048) NOT NULL,
  `FILE_NAME_THUMBNAIL` varchar(1024) DEFAULT NULL,
  `URI_THUMBNAIL` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`ATTACHMENT_ID`),
  KEY `chain_memo_attachment_to_chain_memo_fk` (`CHAIN_MEMO_ID`),
  CONSTRAINT `chain_memo_attachment_to_chain_memo_fk` FOREIGN KEY (`CHAIN_MEMO_ID`) REFERENCES `t_chain_memo` (`CHAIN_MEMO_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_chain_memo_readership`
--

DROP TABLE IF EXISTS `t_chain_memo_readership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_chain_memo_readership` (
  `CHAIN_MEMO_ID` bigint(20) NOT NULL,
  `USER_ID` varchar(256) NOT NULL,
  PRIMARY KEY (`USER_ID`,`CHAIN_MEMO_ID`),
  KEY `chain_memo_readership_to_chain_memo_fk` (`CHAIN_MEMO_ID`),
  CONSTRAINT `chain_memo_readership_to_chain_memo_fk` FOREIGN KEY (`CHAIN_MEMO_ID`) REFERENCES `t_chain_memo` (`CHAIN_MEMO_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_componentids`
--

DROP TABLE IF EXISTS `t_componentids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_componentids` (
  `SEQUENTIALID` int(11) NOT NULL AUTO_INCREMENT,
  `COMPONENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SEQUENTIALID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_components`
--

DROP TABLE IF EXISTS `t_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_components` (
  `ID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `NAME` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` int(11) DEFAULT NULL,
  `VERSION` int(11) DEFAULT NULL,
  `IMAGE` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `IMAGEURL` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `OBJECTTYPE` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `HASINREVISION` tinyint(1) DEFAULT NULL,
  `CARDINALITY` int(11) DEFAULT NULL,
  `MINCARDINALITY` tinyint(1) DEFAULT NULL,
  `_CLASS` int(11) DEFAULT NULL,
  `SUBCLASS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `_CLASSID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASSID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MANUFACTURER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODEL` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISSOURCEACTIVE` tinyint(1) DEFAULT NULL,
  `ORDER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CARDINALITYDESCRIPTIONS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LEAFNODE` tinyint(1) DEFAULT NULL,
  `MANDATORY` tinyint(1) DEFAULT NULL,
  `CLASSIFICATION` char(3) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_concern_notification`
--

DROP TABLE IF EXISTS `t_concern_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_concern_notification` (
  `CONCERN_DEFECT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `CONCERN_ID` int(11) NOT NULL,
  `DEFECT_ID` varchar(12) DEFAULT NULL,
  `DEFECT_EXPLANATION` varchar(255) DEFAULT NULL,
  `kks` varchar(120) NOT NULL,
  `UPDATED` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CM_FM_DISPLAY_ID` varchar(255) DEFAULT NULL,
  `COT_TREE_ONLY_FLG` tinyint(1) NOT NULL DEFAULT (0),
  PRIMARY KEY (`CONCERN_DEFECT_ID`),
  KEY `CONCERN_ID` (`CONCERN_ID`),
  CONSTRAINT `t_concern_notification_ibfk_1` FOREIGN KEY (`CONCERN_ID`) REFERENCES `t_concerns` (`CONCERN_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_concern_reference`
--

DROP TABLE IF EXISTS `t_concern_reference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_concern_reference` (
  `REFERENCE_ID` int(11) NOT NULL AUTO_INCREMENT,
  `CONCERN_ID` int(11) NOT NULL,
  `TITLE` varchar(255) DEFAULT NULL,
  `URL` text,
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  `CREATED_NAME` varchar(255) DEFAULT NULL,
  `UPDATED_NAME` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`REFERENCE_ID`),
  KEY `CONCERN_ID` (`CONCERN_ID`),
  CONSTRAINT `t_concern_reference_ibfk_1` FOREIGN KEY (`CONCERN_ID`) REFERENCES `t_concerns` (`CONCERN_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_concern_related_measuring_item`
--

DROP TABLE IF EXISTS `t_concern_related_measuring_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_concern_related_measuring_item` (
  `CONCERN_MEASURING_ITEM_ID` int(11) NOT NULL AUTO_INCREMENT,
  `CONCERN_ID` int(11) NOT NULL,
  `KKS` varchar(120) NOT NULL,
  `MEASURING_ITEM_ID` bigint(20) NOT NULL,
  `START_DATETIME` datetime NOT NULL,
  `END_DATETIME` datetime DEFAULT NULL,
  `TOP_RANGE` float DEFAULT NULL,
  `BOTTOM_RANGE` float DEFAULT NULL,
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CONCERN_MEASURING_ITEM_ID`),
  UNIQUE KEY `CONCERN_ID` (`CONCERN_ID`,`KKS`,`MEASURING_ITEM_ID`,`START_DATETIME`),
  CONSTRAINT `t_concern_related_measuring_item_ibfk_1` FOREIGN KEY (`CONCERN_ID`) REFERENCES `t_concerns` (`CONCERN_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_concern_related_pid`
--

DROP TABLE IF EXISTS `t_concern_related_pid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_concern_related_pid` (
  `CONCERN_PID_ID` int(11) NOT NULL AUTO_INCREMENT,
  `CONCERN_ID` int(11) NOT NULL,
  `T_PID` varchar(23) NOT NULL,
  `START_DATETIME` datetime NOT NULL,
  `END_DATETIME` datetime DEFAULT NULL,
  `TOP_RANGE` float DEFAULT NULL,
  `BOTTOM_RANGE` float DEFAULT NULL,
  `CREATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime DEFAULT CURRENT_TIMESTAMP,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CONCERN_PID_ID`),
  UNIQUE KEY `CONCERN_ID` (`CONCERN_ID`,`T_PID`,`START_DATETIME`),
  CONSTRAINT `t_concern_related_pid_ibfk_1` FOREIGN KEY (`CONCERN_ID`) REFERENCES `t_concerns` (`CONCERN_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_concerns`
--

DROP TABLE IF EXISTS `t_concerns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_concerns` (
  `CONCERN_ID` int(11) NOT NULL AUTO_INCREMENT,
  `PLANT_ID` varchar(10) NOT NULL,
  `PLANT_UNIT_ID` varchar(10) NOT NULL,
  `DEFECT_ID` varchar(255) DEFAULT NULL,
  `DEFECT_EXPLANATION` varchar(255) DEFAULT NULL,
  `kks` varchar(120) DEFAULT NULL,
  `START_DATETIME` datetime DEFAULT NULL,
  `END_DATETIME` datetime DEFAULT NULL,
  `status` text,
  `MONITORING_REGISTRATION_FLAG` tinyint(1) NOT NULL DEFAULT (0),
  `MONITORING_REASON` text,
  `UNIT_IMPACT_CODE` varchar(255) DEFAULT NULL,
  `impact` varchar(255) DEFAULT NULL,
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  `CREATED` datetime NOT NULL,
  `UPDATED` datetime NOT NULL,
  `IS_DELETED` tinyint(4) NOT NULL DEFAULT '0',
  `DETECTION_CATEGORY` varchar(40) DEFAULT NULL,
  `summary` text,
  PRIMARY KEY (`CONCERN_ID`),
  UNIQUE KEY `DEFECT_ID` (`DEFECT_ID`),
  KEY `PLANT_ID` (`PLANT_ID`,`PLANT_UNIT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_concerns_defect_rel`
--

DROP TABLE IF EXISTS `t_concerns_defect_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_concerns_defect_rel` (
  `CONCERN_ID` int(11) NOT NULL,
  `ALERT_TYPE` varchar(100) NOT NULL,
  `ALERT_KEY` varchar(100) NOT NULL,
  `UPDATED` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `CONCERN_ID` (`CONCERN_ID`,`ALERT_KEY`,`ALERT_TYPE`),
  KEY `ALERT_KEY` (`ALERT_KEY`),
  CONSTRAINT `t_concerns_defect_rel_ibfk_1` FOREIGN KEY (`CONCERN_ID`) REFERENCES `t_concerns` (`CONCERN_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_concerns_handler_method`
--

DROP TABLE IF EXISTS `t_concerns_handler_method`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_concerns_handler_method` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `CONCERN_ID` int(11) NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT (0),
  `handling` varchar(255) DEFAULT NULL,
  `HANDLING_DETAILS` text,
  `RESULTS` text,
  `trigger` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CONCERN_ID` (`CONCERN_ID`),
  CONSTRAINT `t_concerns_handler_method_ibfk_1` FOREIGN KEY (`CONCERN_ID`) REFERENCES `t_concerns` (`CONCERN_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_concerns_status_record`
--

DROP TABLE IF EXISTS `t_concerns_status_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_concerns_status_record` (
  `CONCERN_ID` int(11) NOT NULL,
  `STATUS` text,
  `RECORD_DATE` date NOT NULL,
  `CREATED_BY` varchar(255) NOT NULL,
  `UPDATED_BY` varchar(255) NOT NULL,
  `CREATED` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CONCERN_ID`,`RECORD_DATE`),
  CONSTRAINT `t_concerns_status_record_ibfk_1` FOREIGN KEY (`CONCERN_ID`) REFERENCES `t_concerns` (`CONCERN_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_defect`
--

DROP TABLE IF EXISTS `t_defect`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_defect` (
  `DEFECT_ID` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DEFECT_TITLE` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DEFECT_STATUS` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DEFECT_TYPE` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DEFECT_SITUATION` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DEFECT_DESCRIPTION` varchar(7500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `REPORTED_DATE_TIME` datetime NOT NULL,
  `REQUIRED_START_DATE_TIME` datetime DEFAULT NULL,
  `REQUIRED_END_DATE_TIME` datetime DEFAULT NULL,
  `PRIORITY` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ASSET_CODE` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PART_CODE` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BREAKDOWN_START_DATE_TIME` datetime DEFAULT NULL,
  `BREAKDOWN_END_DATE_TIME` datetime DEFAULT NULL,
  `DURATION_VALUE` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DURATION_UNIT` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ORDER_ID` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TROUBLE_TYPE` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`DEFECT_ID`),
  FULLTEXT KEY `ASSET_CODE` (`ASSET_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_defect_detail_cause`
--

DROP TABLE IF EXISTS `t_defect_detail_cause`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_defect_detail_cause` (
  `DEFECT_ID` varchar(12) NOT NULL,
  `DEFECT_DETAIL_ID` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DEFECT_CAUSE_ID` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FAILURE_MODE` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `FAILURE_TEXT` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`DEFECT_ID`,`DEFECT_DETAIL_ID`,`DEFECT_CAUSE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_defect_detail_item`
--

DROP TABLE IF EXISTS `t_defect_detail_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_defect_detail_item` (
  `DEFECT_ID` varchar(12) NOT NULL,
  `DEFECT_DETAIL_ID` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `COMPONENT_NAME` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAMAGE_NAME` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DAMAGE_TEXT` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`DEFECT_ID`,`DEFECT_DETAIL_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_defect_registration_status`
--

DROP TABLE IF EXISTS `t_defect_registration_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_defect_registration_status` (
  `REQUEST_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `REQUEST_STATUS` varchar(20) NOT NULL,
  `MESSAGE_TYPE` varchar(1) DEFAULT NULL,
  `MESSAGE_ID` varchar(20) DEFAULT NULL,
  `MESSAGE_NUMBER` int(3) DEFAULT NULL,
  `MESSAGE` varchar(256) DEFAULT NULL,
  `DEFECT_ID` varchar(256) DEFAULT NULL,
  `DEFECT_TITLE` varchar(256) NOT NULL,
  `DEFECT_TYPE` varchar(256) NOT NULL,
  `DEFECT_DESCRIPTION` varchar(7500) NOT NULL,
  `DETECTION_TYPE_GROUP_CODE` varchar(256) NOT NULL,
  `DETECTION_TYPE_CODE` varchar(256) NOT NULL,
  `WORK_DIVISION_CODE` varchar(256) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `PRIORITY` varchar(256) NOT NULL,
  `ASSET_CODE` varchar(256) NOT NULL,
  `PART_CODE` varchar(256) NOT NULL,
  `REQUIRED_END_DATE_TIME` datetime DEFAULT NULL,
  `REPORTED_BY` varchar(256) NOT NULL,
  `CREATED_BY` varchar(256) NOT NULL,
  `CREATED_DATE` datetime NOT NULL,
  `REPORTED_ORGANIZATION_ID` varchar(40) DEFAULT (NULL),
  `FAILURE_START_DATE_TIME` datetime DEFAULT (NULL),
  PRIMARY KEY (`REQUEST_ID`),
  KEY `DEFECT_ID` (`DEFECT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_description`
--

DROP TABLE IF EXISTS `t_description`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_description` (
  `DESCRIPTIONID` int(11) NOT NULL AUTO_INCREMENT,
  `LANGUAGE` varchar(2) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONG` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PARENTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PARENTTABLE` char(3) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DESCRIPTIONID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_descriptions`
--

DROP TABLE IF EXISTS `t_descriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_descriptions` (
  `DESCRIPTIONID` int(11) NOT NULL AUTO_INCREMENT,
  `LANGUAGE` varchar(2) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONG` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TITLE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBSERVATION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PARENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PARENTTABLE` char(3) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DESCRIPTIONID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_dimensions`
--

DROP TABLE IF EXISTS `t_dimensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_dimensions` (
  `FMEAMAPID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `DIMENSIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `SCALEID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SELECTEDSCALEOPTIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DIMENSIONTYPE` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `CAUSEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DIMENSIONID`,`CAUSEID`,`FMEAMAPID`,`DIMENSIONTYPE`),
  KEY `t_dimensions_ibfk` (`CAUSEID`),
  CONSTRAINT `t_dimensions_ibfk` FOREIGN KEY (`CAUSEID`) REFERENCES `t_causes` (`CAUSEID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_dimensions_bk_20221215`
--

DROP TABLE IF EXISTS `t_dimensions_bk_20221215`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_dimensions_bk_20221215` (
  `DIMENSIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `FMEAMAPID` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SCALEID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SELECTEDSCALEOPTIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DIMENSIONTYPE` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_effects`
--

DROP TABLE IF EXISTS `t_effects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_effects` (
  `EFFECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `DIMENSIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SCALEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SELECTEDSCALEOPTIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SELECTEDEFFECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DIMENSIONTYPE` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ACTIVITYCOUNT` int(11) DEFAULT NULL,
  `RPN` float DEFAULT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESC` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISOWN` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FMEAMAPID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`EFFECTID`,`FMEAMAPID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_eot_investigation_flow_pids`
--

DROP TABLE IF EXISTS `t_eot_investigation_flow_pids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_eot_investigation_flow_pids` (
  `pid` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `uuid` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`pid`),
  KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_equipment`
--

DROP TABLE IF EXISTS `t_equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_equipment` (
  `EQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `NAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INTERNALID` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELID` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MODELTEMPLATE` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LOCATION` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CRITICALITYCODE` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CRITICALITYDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MANUFACTURER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OPERATOR` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DELAER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SERVICEPROVIDER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PRIMARYEXTERNALID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `COORDINATES` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EQUIPMENTSEARCHTERMS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCESEARCHTERMS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OPERATORSEARCHTERMS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MANUFACTURERSEARCHTERMS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `HASINREVISION` tinyint(1) DEFAULT NULL,
  `VERSION` tinyint(4) DEFAULT NULL,
  `MODELVERSION` tinyint(4) DEFAULT NULL,
  `CONSUME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `COMPLETENESS` bigint(20) DEFAULT NULL,
  `PUBLISHEDON` bigint(20) DEFAULT NULL,
  `STATUS` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUSDESCRIPTION` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LIFECYCLE1` varchar(2) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CHANGEDON` bigint(20) DEFAULT NULL,
  `CREATEDON` bigint(20) DEFAULT NULL,
  `TEMPLATEID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISOPERATORVALID` tinyint(1) DEFAULT NULL,
  `BUILDDATE` bigint(20) DEFAULT NULL,
  `SERIALNUMBER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `BATCHNUMBER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LIFECYCLEDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONGDESCRIPTION` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMAGE` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOLDTO` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELNAME` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TAGNUMBER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LIFECYCLE2` varchar(4) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SECONDARYKEY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASS` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EXTERNALSYSTEMID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`EQUIPMENTID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_equipmentheader`
--

DROP TABLE IF EXISTS `t_equipmentheader`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_equipmentheader` (
  `EQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `INTERNALID` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `HASINREVISION` tinyint(1) DEFAULT NULL,
  `EQUIPMENTVERSION` int(11) DEFAULT NULL,
  `COMPLETENESS` int(11) DEFAULT NULL,
  `PUBLISHEDON` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCEBPROLE` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELKNOWN` tinyint(1) DEFAULT NULL,
  `LIFECYCLE` varchar(2) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OPERATORNAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISOPERATORVALID` tinyint(1) DEFAULT NULL,
  `BUILDDATE` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SERIALNUMBER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `BATCHNUMBER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EQUIPMENTIMAGEURL` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OPERATORID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOLDTO` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELNAME` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MANUFACTURERNAME` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TIN` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PROCUREMENTNUMBER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MANUFACTURERPARTNUMBER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TAGNUMBER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SECONDARYKEY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASSID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `UID` varchar(72) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EXTERNALSYSTEMID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`EQUIPMENTID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_equipmentworkorders`
--

DROP TABLE IF EXISTS `t_equipmentworkorders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_equipmentworkorders` (
  `EQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `WORKORDERID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `INTERNALID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUSDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `WORKORDERTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `WORKORDERTYPEDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PRIORITY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PRIORITYDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PLANT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `WORKCENTER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONGDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PERSONRESPONSIBLE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `BASICSTARTDATE` date DEFAULT NULL,
  `BASICENDDATE` date DEFAULT NULL,
  `ACTUALSTARTDATE` date DEFAULT NULL,
  `ACTUALENDDATE` date DEFAULT NULL,
  `CREATEDBY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATIONDATETIME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LASTCHANGEDBY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LASTCHANGEDATETIME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PROGRESSSTATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PROGRESSSTATUSDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`WORKORDERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_failuremodedetail`
--

DROP TABLE IF EXISTS `t_failuremodedetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_failuremodedetail` (
  `VERSION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASSNAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCEDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDON` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PUBLISHDATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LASTUPDATIONTIME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LASTUPDATIONBY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `IMAGEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MYFAILUREMODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FAILUREMODEID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_failuremodedetailcauses`
--

DROP TABLE IF EXISTS `t_failuremodedetailcauses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_failuremodedetailcauses` (
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `NAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FAILUREMODEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FAILUREMODEDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OWN` tinyint(1) DEFAULT NULL,
  `ISOWN` tinyint(1) DEFAULT NULL,
  `PARENTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`,`PARENTID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_failuremodes`
--

DROP TABLE IF EXISTS `t_failuremodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_failuremodes` (
  `CLIENT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CATEGORYCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CATEGORYDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSES` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CONSUME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `LONGDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MTBFCONFIDENCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MTBFUNIT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MTBFVALUE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MTTFCONFIDENCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MTTFUNIT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MTTFVALUE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MTTRCONFIDENCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MTTRUNIT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MTTRVALUE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MYFAILUREMODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OWNER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PATTERNCONFIDENCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PATTERNID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PATTERNIMAGE` longtext CHARACTER SET utf8 COLLATE utf8_general_ci,
  `PATTERNNAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMAGEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUSTEXT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASSDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `VERSION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EQUIPMENTSCOUNT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELSCOUNT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SPAREPARTSCOUNT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LOCATIONSCOUNT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SYSTEMSCOUNT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTCOUNT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_favorite_asset`
--

DROP TABLE IF EXISTS `t_favorite_asset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_favorite_asset` (
  `ASSET_ID` bigint(20) NOT NULL,
  `FAVORITE_LIST_ID` bigint(20) NOT NULL,
  `RANK` bigint(20) NOT NULL,
  PRIMARY KEY (`ASSET_ID`,`FAVORITE_LIST_ID`),
  KEY `FAVORITE_LIST_ID` (`FAVORITE_LIST_ID`),
  CONSTRAINT `t_favorite_asset_ibfk_1` FOREIGN KEY (`ASSET_ID`) REFERENCES `m_asset_bk` (`ASSET_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `t_favorite_asset_ibfk_2` FOREIGN KEY (`FAVORITE_LIST_ID`) REFERENCES `t_favorite_list` (`FAVORITE_LIST_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_favorite_list`
--

DROP TABLE IF EXISTS `t_favorite_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_favorite_list` (
  `FAVORITE_LIST_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `FAVORITE_LIST_NAME` varchar(255) NOT NULL,
  `SHARED_FLAG` tinyint(1) NOT NULL DEFAULT '0',
  `USER_ID` varchar(256) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `UNIT_ID` varchar(10) NOT NULL,
  PRIMARY KEY (`FAVORITE_LIST_ID`),
  UNIQUE KEY `PLANT_ID_X_UNIT_ID_X_NAME` (`PLANT_ID`,`UNIT_ID`,`FAVORITE_LIST_NAME`),
  KEY `USER_ID` (`USER_ID`),
  CONSTRAINT `t_favorite_list_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `m_user_got` (`USER_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `t_favorite_list_ibfk_2` FOREIGN KEY (`PLANT_ID`, `UNIT_ID`) REFERENCES `m_asset_group` (`PLANT_ID`, `ASSET_GROUP_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_favorite_list_order`
--

DROP TABLE IF EXISTS `t_favorite_list_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_favorite_list_order` (
  `FAVORITE_LIST_ID` bigint(20) NOT NULL,
  `RANK` int(10) NOT NULL,
  `USER_ID` varchar(256) NOT NULL,
  PRIMARY KEY (`FAVORITE_LIST_ID`,`USER_ID`),
  KEY `USER_ID` (`USER_ID`),
  CONSTRAINT `t_favorite_list_order_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `m_user_got` (`USER_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `t_favorite_list_order_ibfk_2` FOREIGN KEY (`FAVORITE_LIST_ID`) REFERENCES `t_favorite_list` (`FAVORITE_LIST_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_impacts`
--

DROP TABLE IF EXISTS `t_impacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_impacts` (
  `IMPACTID` int(11) NOT NULL AUTO_INCREMENT,
  `CODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TEST` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EFFECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`IMPACTID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_inspection_schedule`
--

DROP TABLE IF EXISTS `t_inspection_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_inspection_schedule` (
  `PLANT_ID` varchar(10) NOT NULL,
  `ASSET_ID` bigint(20) NOT NULL,
  `INSPECTION_SCHEDULE` date NOT NULL,
  PRIMARY KEY (`PLANT_ID`,`ASSET_ID`),
  CONSTRAINT `t_inspection_schedule_ibfk_1` FOREIGN KEY (`PLANT_ID`, `ASSET_ID`) REFERENCES `m_asset_bk` (`PLANT_ID`, `ASSET_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_investigation`
--

DROP TABLE IF EXISTS `t_investigation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_investigation` (
  `INVESTIGATION_ID` int(11) NOT NULL AUTO_INCREMENT,
  `RELATED_OCCURRENCE_ID` int(11) NOT NULL,
  `RELATED_FACTOR_ID` int(11) DEFAULT NULL,
  `CONCERN_ID` int(11) DEFAULT NULL,
  `STATUS_CODE` varchar(80) DEFAULT NULL,
  `ROOT_CAUSE_FLG` tinyint(1) NOT NULL DEFAULT (0),
  `INVESTIGATION_TYPE` varchar(80) DEFAULT NULL,
  `INVESTIGATION_CATEGORY` varchar(80) DEFAULT NULL,
  `INVESTIGATION_COMMENT` text,
  `IS_DELETED` int(4) NOT NULL DEFAULT '0',
  `CREATED_BY` varchar(255) DEFAULT NULL,
  `UPDATED_BY` varchar(255) DEFAULT NULL,
  `CREATED` datetime NOT NULL,
  `UPDATED` datetime NOT NULL,
  PRIMARY KEY (`INVESTIGATION_ID`),
  KEY `RELATED_OCCURRENCE_ID` (`RELATED_OCCURRENCE_ID`),
  KEY `RELATED_FACTOR_ID` (`RELATED_FACTOR_ID`),
  KEY `CONCERN_ID` (`CONCERN_ID`),
  CONSTRAINT `t_investigation_ibfk_1` FOREIGN KEY (`RELATED_OCCURRENCE_ID`) REFERENCES `m_occurrence` (`OCCURRENCE_ID`) ON DELETE CASCADE,
  CONSTRAINT `t_investigation_ibfk_2` FOREIGN KEY (`RELATED_FACTOR_ID`) REFERENCES `m_factor` (`FACTOR_ID`) ON DELETE CASCADE,
  CONSTRAINT `t_investigation_ibfk_3` FOREIGN KEY (`CONCERN_ID`) REFERENCES `t_concerns` (`CONCERN_ID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_investigation_attachment_file`
--

DROP TABLE IF EXISTS `t_investigation_attachment_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_investigation_attachment_file` (
  `ATTACHMENT_FILE_ID` int(11) NOT NULL AUTO_INCREMENT,
  `INVESTIGATION_ID` int(11) NOT NULL,
  `CONTAINER_NAME` varchar(80) NOT NULL,
  `FILE_URI` varchar(255) NOT NULL,
  `FILE_NAME` varchar(255) NOT NULL,
  `MIME_TYPE` varchar(80) NOT NULL,
  `CREATED_BY` varchar(255) NOT NULL,
  `UPDATED_BY` varchar(255) NOT NULL,
  `CREATED` datetime NOT NULL,
  `UPDATED` datetime NOT NULL,
  PRIMARY KEY (`ATTACHMENT_FILE_ID`),
  KEY `INVESTIGATION_ID` (`INVESTIGATION_ID`),
  CONSTRAINT `t_investigation_attachment_file_ibfk_1` FOREIGN KEY (`INVESTIGATION_ID`) REFERENCES `t_investigation` (`INVESTIGATION_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_iot_data`
--

DROP TABLE IF EXISTS `t_iot_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_iot_data` (
  `PLANT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `UNIT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `MEASUREMENT_TIME` datetime NOT NULL,
  `T_PID_NO` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `MEASUREMENT_VALUE` double NOT NULL,
  `QUALITY` smallint(6) DEFAULT '0',
  `DAY` tinyint(4) DEFAULT NULL,
  `HOUR` tinyint(4) DEFAULT NULL,
  `MINUTE` tinyint(4) DEFAULT NULL,
  `EFFICIENCY_CALC_DATA_FLG` tinyint(4) DEFAULT '0',
  `UPDATE_TIMESTAMP` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`T_PID_NO`,`MEASUREMENT_TIME`),
  KEY `location` (`PLANT_ID`,`UNIT_ID`) USING BTREE,
  KEY `time` (`MEASUREMENT_TIME`),
  KEY `dayofmonth` (`DAY`),
  KEY `hourofday` (`HOUR`),
  KEY `minuteofhour` (`MINUTE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_iot_data_est`
--

DROP TABLE IF EXISTS `t_iot_data_est`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_iot_data_est` (
  `PLANT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `UNIT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `MEASUREMENT_TIME` datetime NOT NULL,
  `T_PID_NO` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `MEASUREMENT_VALUE` double NOT NULL,
  `QUALITY` smallint(6) DEFAULT '0',
  `DAY` tinyint(4) DEFAULT NULL,
  `HOUR` tinyint(4) DEFAULT NULL,
  `MINUTE` tinyint(4) DEFAULT NULL,
  `EFFICIENCY_CALC_DATA_FLG` tinyint(4) DEFAULT '0',
  `UPDATE_TIMESTAMP` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`T_PID_NO`,`MEASUREMENT_TIME`),
  KEY `location` (`PLANT_ID`,`UNIT_ID`) USING BTREE,
  KEY `time` (`MEASUREMENT_TIME`),
  KEY `dayofmonth` (`DAY`),
  KEY `hourofday` (`HOUR`),
  KEY `minuteofhour` (`MINUTE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_iot_data_test2`
--

DROP TABLE IF EXISTS `t_iot_data_test2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_iot_data_test2` (
  `PLANT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `UNIT_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `MEASUREMENT_TIME` datetime NOT NULL,
  `T_PID_NO` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `MEASUREMENT_VALUE` double NOT NULL,
  `QUALITY` smallint(6) DEFAULT '0',
  `DAY` tinyint(4) DEFAULT NULL,
  `HOUR` tinyint(4) DEFAULT NULL,
  `MINUTE` tinyint(4) DEFAULT NULL,
  `EFFICIENCY_CALC_DATA_FLG` tinyint(4) DEFAULT '0',
  `UPDATE_TIMESTAMP` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`T_PID_NO`,`MEASUREMENT_TIME`),
  KEY `location` (`PLANT_ID`,`UNIT_ID`) USING BTREE,
  KEY `time` (`MEASUREMENT_TIME`),
  KEY `dayofmonth` (`DAY`),
  KEY `hourofday` (`HOUR`),
  KEY `minuteofhour` (`MINUTE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_know_how`
--

DROP TABLE IF EXISTS `t_know_how`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_know_how` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `asset_id` bigint(20) NOT NULL,
  `media_type` varchar(100) NOT NULL,
  `file_name` varchar(1024) NOT NULL,
  `uri` varchar(2048) NOT NULL,
  `file_name_thumbnail` varchar(1024) NOT NULL,
  `uri_thumbnail` varchar(2048) NOT NULL,
  `caption` varchar(200) NOT NULL,
  `user_id` varchar(256) DEFAULT NULL,
  `inserted_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_know_how_to_asset` (`asset_id`),
  CONSTRAINT `fk_know_how_to_asset` FOREIGN KEY (`asset_id`) REFERENCES `m_asset_bk` (`ASSET_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_location`
--

DROP TABLE IF EXISTS `t_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_location` (
  `LOCATIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `NAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `VERSION` int(11) DEFAULT NULL,
  `HASINREVISION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LOCATION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `COMPLETENESS` int(11) DEFAULT NULL,
  `CREATEDON` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CHANGEDON` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PUBLISHEDON` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMAGEURL` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LOCATIONSTATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LOCATIONTYPEDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LOCATIONTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LOCATIONID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_loss_notification`
--

DROP TABLE IF EXISTS `t_loss_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_loss_notification` (
  `consolidated_stoppage_id` bigint(20) NOT NULL,
  `recalculated_loss_amount` bigint(20) NOT NULL,
  `reschedule_candidate_start` datetime DEFAULT NULL,
  `reschedule_candidate_end` datetime DEFAULT NULL,
  PRIMARY KEY (`consolidated_stoppage_id`),
  CONSTRAINT `t_loss_notification_ibfk_1` FOREIGN KEY (`consolidated_stoppage_id`) REFERENCES `t_stoppage` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_loss_notification_bk`
--

DROP TABLE IF EXISTS `t_loss_notification_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_loss_notification_bk` (
  `consolidated_stoppage_id` bigint(20) NOT NULL,
  `recalculated_loss_amount` bigint(20) NOT NULL,
  `reschedule_candidate_start` datetime DEFAULT NULL,
  `reschedule_candidate_end` datetime DEFAULT NULL,
  PRIMARY KEY (`consolidated_stoppage_id`),
  CONSTRAINT `t_loss_notification_bk_ibfk_1` FOREIGN KEY (`consolidated_stoppage_id`) REFERENCES `t_stoppage_bk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_measurement_record`
--

DROP TABLE IF EXISTS `t_measurement_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_measurement_record` (
  `MEASUREMENT_RECORD_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `ASSET_ID` bigint(20) NOT NULL,
  `MEASURING_ITEM_ID` bigint(20) NOT NULL,
  `MEASURED_VALUE` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UOM` varchar(15) DEFAULT NULL,
  `MEASUREMENT_TEXT` varchar(6000) DEFAULT NULL,
  `MEASUREMENT_DATE_TIME` datetime NOT NULL,
  `MEASUREMENT_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IS_DELETED` tinyint(1) NOT NULL DEFAULT (0),
  PRIMARY KEY (`MEASUREMENT_RECORD_ID`),
  KEY `MEASUREMENT_USER_ID` (`MEASUREMENT_USER_ID`),
  KEY `ITEM_x_ASSET_x_DATETIME` (`MEASURING_ITEM_ID`,`ASSET_ID`,`MEASUREMENT_DATE_TIME`),
  KEY `ASSET_x_DATETIME` (`ASSET_ID`,`MEASUREMENT_DATE_TIME`),
  CONSTRAINT `t_measurement_record_ibfk_1` FOREIGN KEY (`ASSET_ID`) REFERENCES `m_asset_bk` (`ASSET_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `t_measurement_record_ibfk_2` FOREIGN KEY (`MEASURING_ITEM_ID`) REFERENCES `m_measuring_item` (`MEASURING_ITEM_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_measurement_record_relation`
--

DROP TABLE IF EXISTS `t_measurement_record_relation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_measurement_record_relation` (
  `MEASUREMENT_RECORD_SET_ID` bigint(20) NOT NULL,
  `MEASURING_ITEM_SET_LOCATION_ID` bigint(20) NOT NULL,
  `MEASUREMENT_RECORD_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`MEASUREMENT_RECORD_SET_ID`,`MEASUREMENT_RECORD_ID`),
  UNIQUE KEY `MEASUREMENT_RECORD_ID` (`MEASUREMENT_RECORD_ID`),
  CONSTRAINT `t_measurement_record_relation_ibfk_1` FOREIGN KEY (`MEASUREMENT_RECORD_SET_ID`) REFERENCES `t_measurement_record_set` (`MEASUREMENT_RECORD_SET_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `t_measurement_record_relation_ibfk_2` FOREIGN KEY (`MEASUREMENT_RECORD_ID`) REFERENCES `t_measurement_record` (`MEASUREMENT_RECORD_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_measurement_record_set`
--

DROP TABLE IF EXISTS `t_measurement_record_set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_measurement_record_set` (
  `MEASUREMENT_RECORD_SET_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `ASSET_ID` bigint(20) NOT NULL,
  `MEASURING_ITEM_SET_ID` bigint(20) NOT NULL,
  `MEASUREMENT_USER_ID` varchar(256) NOT NULL,
  `MEASUREMENT_DATE` datetime NOT NULL,
  `OPERATING_DURATION_VALUE` varchar(30) NOT NULL,
  `OPERATING_DURATION_UNIT` varchar(15) NOT NULL,
  `CREATE_USER_ID` varchar(256) NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL,
  `UPDATE_USER_ID` varchar(256) NOT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL,
  `IS_DELETED` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`MEASUREMENT_RECORD_SET_ID`),
  KEY `ASSET_ID` (`ASSET_ID`),
  KEY `MEASURING_ITEM_SET_ID` (`MEASURING_ITEM_SET_ID`),
  KEY `MEASUREMENT_USER_ID` (`MEASUREMENT_USER_ID`),
  KEY `CREATE_USER_ID` (`CREATE_USER_ID`),
  KEY `UPDATE_USER_ID` (`UPDATE_USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_measuring_item_value`
--

DROP TABLE IF EXISTS `t_measuring_item_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_measuring_item_value` (
  `MEASURING_ITEM_VALUE_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `MEASURING_ITEM_ID` bigint(20) NOT NULL,
  `VALUE_LIMIT_FLAG` tinyint(1) NOT NULL DEFAULT '0',
  `DELETE_FLAG` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`MEASURING_ITEM_VALUE_ID`),
  KEY `MEASURING_ITEM_ID` (`MEASURING_ITEM_ID`),
  CONSTRAINT `t_measuring_item_value_ibfk_1` FOREIGN KEY (`MEASURING_ITEM_ID`) REFERENCES `m_measuring_item` (`MEASURING_ITEM_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_measuring_item_value_history`
--

DROP TABLE IF EXISTS `t_measuring_item_value_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_measuring_item_value_history` (
  `MEASURING_ITEM_VALUE_HISTORY_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `MEASURING_ITEM_VALUE_ID` bigint(20) NOT NULL,
  `VALUE_TITLE` varchar(255) NOT NULL,
  `VALUE` varchar(255) NOT NULL,
  `UPDATE_DATE` datetime NOT NULL,
  `USER_ID` varchar(255) NOT NULL,
  PRIMARY KEY (`MEASURING_ITEM_VALUE_HISTORY_ID`),
  KEY `MEASURING_ITEM_VALUE_ID` (`MEASURING_ITEM_VALUE_ID`),
  CONSTRAINT `t_measuring_item_value_history_ibfk_1` FOREIGN KEY (`MEASURING_ITEM_VALUE_ID`) REFERENCES `t_measuring_item_value` (`MEASURING_ITEM_VALUE_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_models`
--

DROP TABLE IF EXISTS `t_models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_models` (
  `MODELID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `NAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INTERNALID` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `VERSION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `HASINREVISION` tinyint(1) DEFAULT NULL,
  `TEMPLATEID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELTEMPLATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `GENERATION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MANUFACTURER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONGDESCRIPTION` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `COMPLETENESS` int(11) DEFAULT NULL,
  `CREATEDON` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CHANGEDON` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMAGEURL` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PUBLISHEDON` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EQUIPMENTTRACKING` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SERVICEEXPIRATIONDATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELTYPE` varchar(4) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELEXPIRATIONDATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RELEASEDATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISMANUFACTURERVALID` varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMAGE` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISCLIENTVALID` varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CONSUME` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PRIMARYEXTERNALID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELSEARCHTERMS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCESEARCHTERMS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MANUFACTURERSEARCHTERMS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CLASS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MODELID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_notification`
--

DROP TABLE IF EXISTS `t_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_notification` (
  `NOTIFICATIONID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `SHORTDESCRIPTION` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONGDESCRIPTION` varchar(5000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EQUIPMENTNAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ROOTEQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ROOTEQUIPMENTNAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PRIORITY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PRIORITYDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUSDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `NOTIFICATIONTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `NOTIFICATIONTYPEDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PROPOSEDFAILUREMODEID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PROPOSEDFAILUREMODEDESC` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PROPOSEDFAILUREMODEDISPLAYID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CONFIRMEDFAILUREMODEID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CONFIRMEDFAILUREMODEDESC` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CONFIRMEDFAILUREMODEDISPLAYID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SYSTEMPROPOSEDFAILUREMODEID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SYSTEMPROPOSEDFAILUREMODEDESC` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SYSTEMPROPOSEDFAILUREMODEDISPLAYID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EFFECTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EFFECTDESC` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EFFECTDISPLAYID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INSTRUCTIONID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FUNCTIONALLOCATIONID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INSTRUCTIONTITLE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSEID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSEDESC` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSEDISPLAYID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STARTDATE` date DEFAULT NULL,
  `ENDDATE` date DEFAULT NULL,
  `MALFUNCTIONSTARTDATE` date DEFAULT NULL,
  `MALFUNCTIONENDDATE` date DEFAULT NULL,
  `ISINTERNAL` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INTERNALID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LOCATIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `BREAKDOWN` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `COORDINATES` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OPERATORID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LOCATION` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSETCOREEQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OPERATOR` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MODELID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`NOTIFICATIONID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_objectfailuremodes`
--

DROP TABLE IF EXISTS `t_objectfailuremodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_objectfailuremodes` (
  `ID` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `IMAGEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CLIENT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `VERSION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASSCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CATEGORYCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSESID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `CAUSEDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSEDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SHORT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONG` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CATEGORYDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBCLASSDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TYPEDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OWNER` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CONSUME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MYFAILUREMODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCETYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EFFECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `EFFECTDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EFFECTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MYOWN` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `NOTRELEVANT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DETECTIONMETHODCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DETECTIONMETHODDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTID` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `CLASSIFICATION` char(3) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`,`CAUSESID`,`EFFECTID`,`OBJECTID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_operation`
--

DROP TABLE IF EXISTS `t_operation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_operation` (
  `ORDER_ID` varchar(12) NOT NULL,
  `OPERATION_ID` varchar(4) NOT NULL,
  `ROUTING_ID` bigint(20) DEFAULT NULL,
  `ROUTING_COUNTER` bigint(20) DEFAULT NULL,
  `CONTROL_KEY` varchar(4) NOT NULL,
  `STANDARD_TEXT_KEY` varchar(7) DEFAULT NULL,
  `OPERATION_TEXT` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PLANNED_START_DATE` date DEFAULT NULL,
  `PLANNED_COMPLETE_DATE` date DEFAULT NULL,
  `PLANNED_START_TIME` time DEFAULT NULL,
  `PLANNED_COMPLETE_TIME` time DEFAULT NULL,
  `CONDUCTER_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SUPERVISOR_USER_ID` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PLANT_SECTION` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `STATUS` enum('NOT_START','IN_PROGRESS','SUSPEND','COMPLETE') DEFAULT NULL,
  `UPDATED_BY` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  UNIQUE KEY `unique_order_id_x_routing_id_x_routing_counter` (`ORDER_ID`,`ROUTING_ID`,`ROUTING_COUNTER`),
  UNIQUE KEY `unique_routing_id_x_routing_counter` (`ROUTING_ID`,`ROUTING_COUNTER`),
  CONSTRAINT `operation_to_order_fk` FOREIGN KEY (`ORDER_ID`) REFERENCES `t_order` (`ORDER_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_operation_detail_time`
--

DROP TABLE IF EXISTS `t_operation_detail_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_operation_detail_time` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `ORDER_ID` varchar(12) NOT NULL,
  `ROUTING_ID` bigint(20) NOT NULL,
  `ROUTING_COUNTER` bigint(20) NOT NULL,
  `ACTUAL_START_DATETIME` datetime NOT NULL,
  `ACTUAL_END_DATETIME` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `detail_time_to_operation_fk` (`ORDER_ID`,`ROUTING_ID`,`ROUTING_COUNTER`),
  CONSTRAINT `detail_time_to_operation_fk` FOREIGN KEY (`ORDER_ID`, `ROUTING_ID`, `ROUTING_COUNTER`) REFERENCES `t_operation` (`ORDER_ID`, `ROUTING_ID`, `ROUTING_COUNTER`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_order`
--

DROP TABLE IF EXISTS `t_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_order` (
  `ORDER_ID` varchar(12) NOT NULL,
  `ORDER_TITLE` varchar(40) NOT NULL,
  `ORDER_TYPE` varchar(4) NOT NULL,
  `ORDER_STATUS` varchar(300) NOT NULL,
  `SYSTEM_STATUS` varchar(40) NOT NULL,
  `PART_CODE` varchar(10) NOT NULL,
  `ASSET_CODE` varchar(40) NOT NULL,
  `PLANT_SECTION` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `USER_STATUS` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `COMPLETED_FLAG` tinyint(1) NOT NULL DEFAULT '0',
  `DEFERRED_FLAG` tinyint(1) NOT NULL DEFAULT '0',
  `DEFERRED_BY` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`ORDER_ID`),
  KEY `PLANT_SECTION` (`PLANT_SECTION`),
  KEY `PART_CODE` (`PART_CODE`),
  KEY `ORDER_TYPE` (`ORDER_TYPE`),
  FULLTEXT KEY `ASSET_CODE` (`ASSET_CODE`),
  FULLTEXT KEY `ORDER_TITLE` (`ORDER_TITLE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_order_group`
--

DROP TABLE IF EXISTS `t_order_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_order_group` (
  `ORDER_ID` varchar(12) NOT NULL,
  `ORDER_GROUP` bigint(20) NOT NULL,
  `ORDER_GROUP_NAME` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ORDER_ID`),
  CONSTRAINT `t_order_group_order_id_FK_t_order_order_id` FOREIGN KEY (`ORDER_ID`) REFERENCES `t_order` (`ORDER_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_phases`
--

DROP TABLE IF EXISTS `t_phases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_phases` (
  `PHASEID` int(11) NOT NULL AUTO_INCREMENT,
  `PHASE` tinyint(4) DEFAULT NULL,
  `ID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PHASEID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_plant_maintenance_order`
--

DROP TABLE IF EXISTS `t_plant_maintenance_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_plant_maintenance_order` (
  `PLANT_MAINTENANCE_ORDER_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `TYPE` varchar(50) NOT NULL,
  `SOURCE` varchar(50) NOT NULL,
  `TIMESTAMP` datetime NOT NULL,
  `CONTENT_TYPE` varchar(50) NOT NULL,
  `ORDER_ID` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SHORT_TEXT` varchar(40) NOT NULL,
  `ORDER_TYPE` varchar(12) NOT NULL,
  `PLAN_GROUP` varchar(3) NOT NULL,
  `FUNCTIONAL_LOCATION` varchar(40) NOT NULL,
  `PLANT_ID` varchar(10) NOT NULL,
  `SYSTEM_STATUS` varchar(40) NOT NULL,
  `PLAN_PLANT` varchar(4) NOT NULL,
  `USER_STATUS` varchar(40) NOT NULL,
  `BASIC_START_DATE` date DEFAULT NULL,
  `BASIC_FINISH_DATE` date NOT NULL,
  `REVISION_CODE` varchar(8) DEFAULT NULL,
  `PLANT_SECTION` varchar(3) DEFAULT NULL,
  `CREATED_DATE` date NOT NULL,
  `UPDATED_DATE` date DEFAULT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL,
  PRIMARY KEY (`PLANT_MAINTENANCE_ORDER_ID`),
  UNIQUE KEY `ORDER_ID_UNIQUE` (`ORDER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_plant_maintenance_order_operation`
--

DROP TABLE IF EXISTS `t_plant_maintenance_order_operation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_plant_maintenance_order_operation` (
  `PLANT_MAINTENANCE_ORDER_OPERATION_ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `PLANT_MAINTENANCE_ORDER_ID` bigint(20) NOT NULL,
  `ORDER_ID` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ROUTING_ID` int(11) DEFAULT NULL,
  `ROUTING_COUNTER` int(11) DEFAULT NULL,
  `ACTIVITY` varchar(4) NOT NULL,
  `DESCRIPTION` varchar(40) DEFAULT NULL,
  `START_CONSTRAINT_DATE` date DEFAULT NULL,
  `START_CONSTRAINT_TIME` time DEFAULT NULL,
  `FINISH_CONSTRAINT_DATE` date DEFAULT NULL,
  `FINISH_CONSTRAINT_TIME` time DEFAULT NULL,
  `ACTUAL_START_DATE` date DEFAULT NULL,
  `ACTUAL_START_TIME` time DEFAULT NULL,
  `ACTUAL_FINISH_DATE` date DEFAULT NULL,
  `ACTUAL_FINISH_TIME` time DEFAULT NULL,
  `CONTROL_KEY` varchar(4) NOT NULL,
  `STANDARD_TEXT_KEY` varchar(7) DEFAULT NULL,
  `SYSTEM_STATUS` varchar(40) NOT NULL,
  `USER_STATUS` varchar(40) NOT NULL,
  `WORKER_AND_SUPERVISOR` varchar(20) DEFAULT NULL,
  `SITE_SUPERVISOR` varchar(20) DEFAULT NULL,
  `REQUEST` varchar(20) DEFAULT NULL,
  `REQUESTEE` varchar(9) DEFAULT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL,
  PRIMARY KEY (`PLANT_MAINTENANCE_ORDER_OPERATION_ID`),
  KEY `fk_t_plant_maintenance_order_operation_2_idx` (`ORDER_ID`),
  KEY `fk_t_plant_maintenance_order_operation_1_idx` (`PLANT_MAINTENANCE_ORDER_ID`),
  CONSTRAINT `fk_t_plant_maintenance_order_operation_1` FOREIGN KEY (`PLANT_MAINTENANCE_ORDER_ID`) REFERENCES `t_plant_maintenance_order` (`PLANT_MAINTENANCE_ORDER_ID`),
  CONSTRAINT `fk_t_plant_maintenance_order_operation_2` FOREIGN KEY (`ORDER_ID`) REFERENCES `t_plant_maintenance_order` (`ORDER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_productrelevance`
--

DROP TABLE IF EXISTS `t_productrelevance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_productrelevance` (
  `PRODUCTRELEVANCEID` int(11) NOT NULL AUTO_INCREMENT,
  `CODE` tinyint(4) DEFAULT NULL,
  `EQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PRODUCTRELEVANCEID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_recommendationdetail`
--

DROP TABLE IF EXISTS `t_recommendationdetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_recommendationdetail` (
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `DISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SUBTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CLASSIFICATION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TYPETEXT` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PLRIORITY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `COUNTERTYPE` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `REPAIRBYREPLACEMENT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `REPAIRBYREPLACEMENTTEXT` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `COUNTEROPERATION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ESTIMATEDCOST` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ESTIMATEDMAINTENANCESAVING` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RISKREDUCTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RISKREMAINING` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RULEIDS` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `STEPROLE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STEPROLETEXT` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `STATUS` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PLANID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PLANITEMID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTDISPLAYID` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OBJECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FUNCTIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FUNCTIONALFAILUREID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FAILUREMODEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EFFECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INSTRUCTIONID` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `VALIDFROM` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `VALIDTO` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RISKVALUE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FINANCIALRISK` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMPLEMENTATIONGUIDANCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMPLEMENTATIONGUIDANCETEXT` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CURRENCY` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_recommendations`
--

DROP TABLE IF EXISTS `t_recommendations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_recommendations` (
  `MAPPEDINSTRUCTIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FAILUREMODECAUSEEFFECT` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `RECOMMENDATIONCLASSIFICATION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONVALIDTO` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `INSTRUCTIONSOURCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INDICATORGROUPID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PLANITEMID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FUNCTIONSFUNCTIONFAILURE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FUNCTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONSHORTDESCRIPTION` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `COUNTERDIMENSION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONSUBTYPEDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `REMAININGCRITICALITYCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONSTATUSCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `REMAININGFINANCIALRISKUOM` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONPRIORITY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `COUNT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ESTIMATEDCOST` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TEMPLATEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONCOUNTEROPERATION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTSHORTDESCRIPTION` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `FUNCTIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ESTIMATEDCOSTUOM` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EFFECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `IMPLEMENTATIONGUIDANCE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FAILUREMODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTPUBLISHDATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EFFECT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INDICATORDESCRIPTION` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `COUNTERUOMDESCRIPTION` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `PLANID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FUNCTIONFAILUREDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RULEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RISKREDUCTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `REMAININGRISKCOLORCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ACTIVITY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STEPROLE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONTYPEDESCRIPTION` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `RECOMMENDATIONDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CURRENTFINANCIALRISK` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSE` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `CURRENTRISKVALUE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CURRENTRISKCOLORCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONSUBTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FAILUREMODEDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LASTCHANGEDTIME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONSTATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INSTRUCTIONSOURCEDESCRIPTION` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `COUNTERUOM` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INSTRUCTIONID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RISKREDUCTIONUOM` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `UNIQUEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SOURCEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ESTIMATEDMAINTENANCESAVINGS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONLONGDESCRIPTION` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `COMMENTS` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `SUBCLASS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONCOUNTERTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CURRENTFINANCIALRISKUOM` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FUNCTIONDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FUNCTIONFAILUREID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `REMAININGRISKVALUE` float DEFAULT NULL,
  `CURRENTCRITICALITYCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CAUSEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `COUNTERVALUE` float DEFAULT NULL,
  `INDICATORID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RECOMMENDATIONVALIDFROM` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FAILUREMODEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `REMAININGFINANCIALRISK` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `FUNCTIONFAILURE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTNAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `OBJECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RECOMMENDATIONID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_regular_stoppage`
--

DROP TABLE IF EXISTS `t_regular_stoppage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_regular_stoppage` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `STOPPAGE_CODE` varchar(8) NOT NULL,
  `STATUS` varchar(40) NOT NULL,
  `ASSET_CODE` varchar(40) NOT NULL,
  `TYPE_OF_STOPPAGE` varchar(2) NOT NULL,
  `PLAN_START_DATE` date NOT NULL,
  `PLAN_END_DATE` date NOT NULL,
  `ACTUAL_START_DATE` date NOT NULL,
  `ACTUAL_END_DATE` date NOT NULL,
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `TYPE_OF_STOPPAGE` (`TYPE_OF_STOPPAGE`),
  CONSTRAINT `t_regular_stoppage_ibfk_1` FOREIGN KEY (`TYPE_OF_STOPPAGE`) REFERENCES `m_type_of_stoppage` (`TYPE_OF_STOPPAGE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_riskassessmentlist`
--

DROP TABLE IF EXISTS `t_riskassessmentlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_riskassessmentlist` (
  `ASSESSMENTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `ASSESSMENTDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTSHORTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `BUSINESSOBJECTVERSION` float DEFAULT NULL,
  `RISKVALUE` float DEFAULT NULL,
  `NORMALIZEDRISKVALUE` float DEFAULT NULL,
  `CRITICALITYCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CRITICALITYTEXT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RISKCOLORCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RISKTYPECODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `RISKTYPE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MATRIXID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MATRIXVERSION` float DEFAULT NULL,
  `MATRIXDISPLAYID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `INTENTCODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MATRIXNAME` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PUBLISHEDBY` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `PUBLISHEDDATE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `MYASSESSMENT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `STATUS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `GROUPID` int(11) DEFAULT NULL,
  `GROUPDISPLAYID` int(11) DEFAULT NULL,
  `OBJECTID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CLASSIFICATION` char(3) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ASSESSMENTID`,`CLASSIFICATION`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_rpn_defects_cache`
--

DROP TABLE IF EXISTS `t_rpn_defects_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_rpn_defects_cache` (
  `RPN_DEFECTS_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DEFECT_ID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `KKS` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CM_FM_DISPLAY_ID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `START_DATETIME` datetime NOT NULL,
  `END_DATETIME` datetime NOT NULL,
  `ALERT_TYPE` varchar(100) DEFAULT NULL,
  `DEFECT_TYPE` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PROCESSING_STATUS` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0-Unprocessed,1-Processed',
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `IS_DELETED` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`RPN_DEFECTS_ID`),
  UNIQUE KEY `index` (`DEFECT_ID`,`RPN_DEFECTS_ID`) /*!80000 INVISIBLE */,
  KEY `KKS_x_CM_FM_DISPLAY_ID` (`KKS`,`CM_FM_DISPLAY_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sap_defect_notification`
--

DROP TABLE IF EXISTS `t_sap_defect_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sap_defect_notification` (
  `notification_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `plan_plant` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `plan_group` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `functional_location` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `functional_location_description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `required_end_date` date DEFAULT NULL,
  `notification_type` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_status` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `system_status` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `unit_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sap_instruction`
--

DROP TABLE IF EXISTS `t_sap_instruction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sap_instruction` (
  `instruction_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `instruction_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `revision_code` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `plant_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `delivery` date DEFAULT NULL,
  `stoppage_id` bigint(20) DEFAULT NULL,
  `work_duration` smallint(5) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`instruction_id`),
  KEY `stoppage_id` (`stoppage_id`),
  CONSTRAINT `t_sap_instruction_ibfk_1` FOREIGN KEY (`stoppage_id`) REFERENCES `t_stoppage` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sap_instruction_bk`
--

DROP TABLE IF EXISTS `t_sap_instruction_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sap_instruction_bk` (
  `instruction_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `instruction_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revision_code` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plant_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery` date DEFAULT NULL,
  `stoppage_id` bigint(20) DEFAULT NULL,
  `work_duration` smallint(5) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`instruction_id`),
  KEY `stoppage_id` (`stoppage_id`),
  CONSTRAINT `t_sap_instruction_bk_ibfk_1` FOREIGN KEY (`stoppage_id`) REFERENCES `t_stoppage_bk` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sap_notification`
--

DROP TABLE IF EXISTS `t_sap_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sap_notification` (
  `notification_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `instruction_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `user_status` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `deadline` datetime DEFAULT NULL,
  `revision_code` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `plant_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `asset_code` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sap_notification_bk`
--

DROP TABLE IF EXISTS `t_sap_notification_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sap_notification_bk` (
  `notification_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `instruction_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_status` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deadline` datetime DEFAULT NULL,
  `revision_code` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plant_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `asset_code` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sap_rpn_defects_cache`
--

DROP TABLE IF EXISTS `t_sap_rpn_defects_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sap_rpn_defects_cache` (
  `SAP_RPN_DEFECTS_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DEFECT_ID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `REPORTED_DATE_TIME` datetime NOT NULL,
  `DEFECT_TYPE` varchar(2) NOT NULL,
  `USER_STATUS` varchar(40) NOT NULL,
  `ASSET_CODE` varchar(40) NOT NULL,
  `PRIORITY` varchar(20) DEFAULT NULL,
  `ORDER_ID` varchar(12) DEFAULT NULL,
  `ACTUAL_START_DATETIME` datetime NOT NULL,
  `ACTUAL_END_DATETIME` datetime NOT NULL,
  `PROCESSING_STATUS` tinyint(1) NOT NULL DEFAULT '0',
  `CREATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `IS_DELETED` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`SAP_RPN_DEFECTS_ID`),
  UNIQUE KEY `index` (`SAP_RPN_DEFECTS_ID`,`DEFECT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_scaleoptions`
--

DROP TABLE IF EXISTS `t_scaleoptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_scaleoptions` (
  `SHORTDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `LONGDESCRIPTION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `DESCRIPTIONS` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `WEIGHTAGE` float DEFAULT NULL,
  `VALUE1` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `VALUE2` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `SCALEDIMENSION` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `UOM` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ISSELECTED` int(11) DEFAULT NULL,
  `ASSESSMENTTEMPLATEID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ASSESSMENTTEMPLATEDIMENSIONID` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sectioncompleteness`
--

DROP TABLE IF EXISTS `t_sectioncompleteness`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sectioncompleteness` (
  `SECTIONCOMPLETENESSID` int(11) NOT NULL AUTO_INCREMENT,
  `HEADERPERCENTAGE` int(11) DEFAULT NULL,
  `ATTACHMENTPERCENTAGE` int(11) DEFAULT NULL,
  `INSTRUCTIONPERCENTAGE` int(11) DEFAULT NULL,
  `VALUEPERCENTAGE` int(11) DEFAULT NULL,
  `EQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SECTIONCOMPLETENESSID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_spareids`
--

DROP TABLE IF EXISTS `t_spareids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_spareids` (
  `SEQUENTIALID` int(11) NOT NULL AUTO_INCREMENT,
  `SPAREID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SEQUENTIALID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_step`
--

DROP TABLE IF EXISTS `t_step`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_step` (
  `ORDER_ID` varchar(12) NOT NULL,
  `STEP_CATEGORY` varchar(120) NOT NULL,
  `STEP_STATUS` varchar(120) NOT NULL,
  `ACTUAL_START_DATE_TIME` datetime DEFAULT NULL,
  `ACTUAL_COMPLETE_DATE_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`ORDER_ID`,`STEP_CATEGORY`),
  CONSTRAINT `step_to_order_fk` FOREIGN KEY (`ORDER_ID`) REFERENCES `t_order` (`ORDER_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_stoppage`
--

DROP TABLE IF EXISTS `t_stoppage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_stoppage` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `plant_id` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `unit_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `instruction_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `fiscally_planned_start_datetime` datetime DEFAULT NULL,
  `fiscally_planned_end_datetime` datetime DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `scheduled_start_datetime` datetime NOT NULL,
  `scheduled_end_datetime` datetime NOT NULL,
  `actual_start_datetime` datetime DEFAULT NULL,
  `actual_end_datetime` datetime DEFAULT NULL,
  `coarse_stoppage_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `unplanned_due_to_external_cause` tinyint(4) DEFAULT NULL,
  `shortest_delivery` datetime DEFAULT NULL,
  `cancelled` tinyint(4) DEFAULT '0',
  `cancellation_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `boiler-stop-plate` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `turbine-stop-plate` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `condenser` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_datetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_stoppage_bk`
--

DROP TABLE IF EXISTS `t_stoppage_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_stoppage_bk` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `plant_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `instruction_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fiscally_planned_start_datetime` datetime DEFAULT NULL,
  `fiscally_planned_end_datetime` datetime DEFAULT NULL,
  `scheduled_start_datetime` datetime NOT NULL,
  `scheduled_end_datetime` datetime NOT NULL,
  `actual_start_datetime` datetime DEFAULT NULL,
  `actual_end_datetime` datetime DEFAULT NULL,
  `coarse_stoppage_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unplanned_due_to_external_cause` tinyint(1) DEFAULT NULL,
  `shortest_delivery` datetime DEFAULT NULL,
  `cancelled` tinyint(1) NOT NULL DEFAULT '0',
  `cancellation_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `boiler-stop-plate` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `turbine-stop-plate` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condenser` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_datetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_stoppage_losses`
--

DROP TABLE IF EXISTS `t_stoppage_losses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_stoppage_losses` (
  `stoppage_id` bigint(20) NOT NULL,
  `rated_plan_loss_amount` double DEFAULT NULL,
  `rated_forecast_loss_amount` double DEFAULT NULL,
  `rated_actual_loss_amount` double DEFAULT NULL,
  `created_datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_datetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stoppage_id`),
  CONSTRAINT `t_stoppage_losses_FK1` FOREIGN KEY (`stoppage_id`) REFERENCES `t_stoppage` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_stoppage_losses_bk`
--

DROP TABLE IF EXISTS `t_stoppage_losses_bk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_stoppage_losses_bk` (
  `stoppage_id` bigint(20) NOT NULL,
  `rated_plan_loss_amount` double DEFAULT NULL,
  `rated_forecast_loss_amount` double DEFAULT NULL,
  `rated_actual_loss_amount` double DEFAULT NULL,
  `created_datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_datetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stoppage_id`),
  CONSTRAINT `t_stoppage_losses_FK` FOREIGN KEY (`stoppage_id`) REFERENCES `t_stoppage_bk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_templates`
--

DROP TABLE IF EXISTS `t_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_templates` (
  `TEMPLATEID` int(11) NOT NULL AUTO_INCREMENT,
  `ID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `EQUIPMENTID` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TEMPLATEID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_types`
--

DROP TABLE IF EXISTS `t_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_types` (
  `TYPEID` int(11) NOT NULL AUTO_INCREMENT,
  `CODE` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `TEXT` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `ID` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `CREATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATEDAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TYPEID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_user_login_history`
--

DROP TABLE IF EXISTS `t_user_login_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_user_login_history` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `USER_ID` varchar(255) NOT NULL,
  `CREATE_TIMESTAMP` datetime DEFAULT CURRENT_TIMESTAMP,
  `UPDATE_TIMESTAMP` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_wot_event_message_queue`
--

DROP TABLE IF EXISTS `t_wot_event_message_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_wot_event_message_queue` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `message` varchar(1024) NOT NULL,
  PRIMARY KEY (`id`)
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

--
-- Dumping routines for database 'db_dcd'
--
/*!50003 DROP PROCEDURE IF EXISTS `Delete_Tables` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`jeraadmin`@`%` PROCEDURE `Delete_Tables`()
BEGIN



delete from t_additionalbusinesspartners;

delete from t_admindata;

delete from t_assignedobjects;

delete from t_categories;

delete from t_componentids;

delete from t_description;

delete from t_descriptions;

delete from t_dimensions;

delete from t_causes;

delete from t_impacts;

delete from t_effects;

delete from t_failuremodedetailcauses;

delete from t_objectfailuremodes;

delete from t_phases;

delete from t_productrelevance;

delete from t_recommendationdetail;

delete from t_riskassessmentlist;

delete from t_sectioncompleteness;

delete from t_spareids;

delete from t_templates;

delete from t_types;

delete from t_failuremodedetail;

delete from t_assessmentfailuremodes;

delete from t_assessmentobjects;

delete from t_equipmentheader;

delete from t_equipmentworkorders;

delete from t_components;

delete from t_equipment;

delete from t_location;

delete from t_models;

delete from t_notification;

delete from t_failuremodes;

delete from t_recommendations;

delete from t_assessmentfailuremodeeffects;

delete from t_assessmentfailuremodecauses;

delete from t_assessmenttemplates;

delete from t_assessmenttemplatesimpacts;

delete from t_assessmenttemplatesdimensions;

delete from t_scaleoptions;

delete from t_attributesindicatorstemplates;



alter table t_additionalbusinesspartners AUTO_INCREMENT =1;

alter table t_admindata AUTO_INCREMENT =1;

alter table t_categories AUTO_INCREMENT =1;

alter table t_componentids AUTO_INCREMENT =1;

alter table t_description AUTO_INCREMENT =1;

alter table t_descriptions AUTO_INCREMENT =1;

alter table t_impacts AUTO_INCREMENT =1;

alter table t_phases AUTO_INCREMENT =1;

alter table t_productrelevance AUTO_INCREMENT =1;

alter table t_sectioncompleteness AUTO_INCREMENT =1;

alter table t_spareids AUTO_INCREMENT =1;

alter table t_templates AUTO_INCREMENT =1;

alter table t_types AUTO_INCREMENT =1;

alter table t_assessmentfailuremodeeffects AUTO_INCREMENT =1;

alter table t_assessmentfailuremodecauses AUTO_INCREMENT =1;



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- 2023-11 DPPPM: Business plan
CREATE TABLE `m_thermal_efficiency_recovery` (
  `PMAJPN_FUEL_CATEGORY` varchar(200) NOT NULL,
  `TYPE_OF_STOPPAGE_TEXT` varchar(120) NOT NULL,
  `THERMAL_EFFICIENCY_RECOVERY` decimal(5, 2) NOT NULL,
  `CREATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `UPDATED_DATETIME` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `CREATE_BY` varchar(256)  NOT NULL,
  `UPDATE_BY` varchar(256)  NOT NULL,
  PRIMARY KEY (`PMAJPN_FUEL_CATEGORY`,`TYPE_OF_STOPPAGE_TEXT`),
  KEY `PMAJPN_FUEL_CATEGORY` (`PMAJPN_FUEL_CATEGORY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE m_unitmaster ADD COLUMN thermal_efficiency_decrease decimal(5, 2) NOT NULL DEFAULT 0 COMMENT '単位：%';
ALTER TABLE m_unitmaster ADD COLUMN ppa_thermal_efficiency decimal(5, 2) NOT NULL DEFAULT 0 COMMENT '単位：%';
ALTER TABLE m_unitmaster ADD COLUMN fuel_unit_calorific_value int(11) NOT NULL DEFAULT 0 COMMENT '単位:MJ/t';
ALTER TABLE m_unitmaster ADD COLUMN discount_rate decimal(5, 2) NOT NULL DEFAULT 0 COMMENT '単位：%';
