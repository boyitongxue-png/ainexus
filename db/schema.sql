-- AiNexus Database Schema for TiDB

-- Users (OAuth)
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `unionId` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `avatar` text,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignInAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_unionId_unique` (`unionId`)
);

-- Upstream Keys
CREATE TABLE IF NOT EXISTS `upstream_keys` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `provider` varchar(100) NOT NULL,
  `key_encrypted` text NOT NULL,
  `key_preview` varchar(50) NOT NULL,
  `status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
  `base_url` varchar(500) DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Platform Keys
CREATE TABLE IF NOT EXISTS `platform_keys` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `key_encrypted` text NOT NULL,
  `key_preview` varchar(50) NOT NULL,
  `permissions` json DEFAULT NULL,
  `rate_limit` int NOT NULL DEFAULT 1000,
  `ip_whitelist` json DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `owner_id` bigint unsigned DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Models
CREATE TABLE IF NOT EXISTS `models` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `provider` varchar(100) NOT NULL,
  `model_type` enum('text','image','video','embedding','audio') NOT NULL,
  `api_identifier` varchar(255) NOT NULL,
  `async_support` tinyint(1) NOT NULL DEFAULT 0,
  `default_timeout` int NOT NULL DEFAULT 30,
  `default_retries` int NOT NULL DEFAULT 3,
  `status` enum('active','inactive','beta') NOT NULL DEFAULT 'active',
  `capabilities` json DEFAULT NULL,
  `cost_per_1k_tokens` decimal(10,6) NOT NULL DEFAULT 0.000000,
  `input_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `platform_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `base_url` varchar(500) DEFAULT NULL,
  `upstream_key_id` bigint unsigned DEFAULT NULL,
  `custom_path` varchar(500) DEFAULT NULL,
  `context_window` int NOT NULL DEFAULT 0,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Route Strategies
CREATE TABLE IF NOT EXISTS `route_strategies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `primary_model_id` bigint unsigned DEFAULT NULL,
  `fallback_model_ids` json DEFAULT NULL,
  `timeout` int NOT NULL DEFAULT 30000,
  `priority` enum('cost','quality','speed') NOT NULL DEFAULT 'quality',
  `owner_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Call Logs
CREATE TABLE IF NOT EXISTS `call_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `request_id` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(100) NOT NULL,
  `model_id` bigint unsigned DEFAULT NULL,
  `model_name` varchar(255) DEFAULT NULL,
  `status` enum('success','error','timeout') NOT NULL DEFAULT 'success',
  `duration` int NOT NULL DEFAULT 0,
  `credits_used` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tokens_used` int NOT NULL DEFAULT 0,
  `user_id` bigint unsigned DEFAULT NULL,
  `error_code` varchar(50) DEFAULT NULL,
  `error_message` text,
  PRIMARY KEY (`id`)
);

-- Async Tasks
CREATE TABLE IF NOT EXISTS `async_tasks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `task_type` enum('image','video') NOT NULL,
  `status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `model_id` bigint unsigned DEFAULT NULL,
  `model_name` varchar(255) DEFAULT NULL,
  `prompt` text,
  `result_url` text,
  `credits_used` decimal(12,2) NOT NULL DEFAULT 0.00,
  `frozen_credits` decimal(12,2) NOT NULL DEFAULT 0.00,
  `progress` int NOT NULL DEFAULT 0,
  `failure_reason` text,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- Credit Transactions
CREATE TABLE IF NOT EXISTS `credit_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tx_type` enum('recharge','consume','refund','gift','adjust') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `balance_before` decimal(12,2) NOT NULL DEFAULT 0.00,
  `balance_after` decimal(12,2) NOT NULL DEFAULT 0.00,
  `description` text,
  `related_id` varchar(255) DEFAULT NULL,
  `operator` varchar(255) NOT NULL DEFAULT 'system',
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Recharge Applications
CREATE TABLE IF NOT EXISTS `recharge_applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) NOT NULL,
  `credits_requested` decimal(12,2) NOT NULL,
  `method` enum('bank_transfer','alipay','wechat') NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `remark` text,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_last4` varchar(20) DEFAULT NULL,
  `voucher_url` text,
  `review_note` text,
  `reject_reason` text,
  `reviewed_by` bigint unsigned DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Team Members
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `role` enum('owner','admin','developer','viewer') NOT NULL DEFAULT 'developer',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `invited_by` bigint unsigned DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Webhook Configs
CREATE TABLE IF NOT EXISTS `webhook_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `url` varchar(1000) NOT NULL,
  `events` json DEFAULT NULL,
  `secret` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `owner_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Admin Logs
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `admin_name` varchar(255) NOT NULL,
  `module` varchar(100) NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `target_object` varchar(500) DEFAULT NULL,
  `before_value` text,
  `after_value` text,
  `ip_address` varchar(50) DEFAULT NULL,
  `sensitivity` enum('normal','sensitive','highrisk') NOT NULL DEFAULT 'normal',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- System Settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(255) NOT NULL,
  `setting_value` text NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `setting_type` enum('text','number','password','toggle','select') NOT NULL DEFAULT 'text',
  `options` json DEFAULT NULL,
  `description` text,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`setting_key`)
);

-- CMS Configs
CREATE TABLE IF NOT EXISTS `cms_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `config_key` varchar(255) NOT NULL,
  `config_data` json NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cms_key_unique` (`config_key`)
);

-- User Credits
CREATE TABLE IF NOT EXISTS `user_credits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_recharged` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_consumed` decimal(12,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_credits_user_unique` (`user_id`)
);
