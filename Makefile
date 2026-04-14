.PHONY: help infra back migration run stop logs restart reset-db

## Default target
help:
	@echo.
	@echo   ==========================================
	@echo      Pizza Restaurant Management System
	@echo   ==========================================
	@echo    make infra      - Install all deps
	@echo    make back       - Build backend & setup DB
	@echo    make reset-db   - Reset DB (Deletes ALL data)
	@echo    make migration  - DB migration info
	@echo    make run        - Start via PM2
	@echo    make stop       - Stop via PM2
	@echo    make restart    - Restart via PM2
	@echo    make logs       - Tail PM2 logs
	@echo   ==========================================
	@echo.

infra:
	@echo ======================================
	@echo   Installing PM2 globally (requires Node.js)...
	npm install -g pm2
	@echo ======================================
	@echo   Installing Frontend dependencies...
	cd client && npm install
	@echo ======================================
	@echo   Resolving Backend dependencies...
	cd backend/restaurant-backend && mvn dependency:resolve
	@echo ======================================
	@echo   Infrastructure setup complete!

back:
	@echo ======================================
	@echo   Building Backend (skipping unit tests)...
	cd backend/restaurant-backend && mvn clean package -DskipTests
	@echo   Backend build successful!
	@echo   ======================================
	@echo   Ready to start. Run 'make run' to seed data.

reset-db:
	@echo ======================================
	@echo   WARNING: Resetting Database (Dropping all tables)...
	mysql -u root -p123456 pizza_management -e "SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS transactions, order_items, orders, payments, cart_items, carts, products, variants, categories, profiles, users, flyway_schema_history; SET FOREIGN_KEY_CHECKS=1; SHOW TABLES;"
	@echo   Database reset. Schema will recreate on next backend run.
	@echo ======================================

migration:
	@echo ======================================
	@echo   Database Migration
	@echo   NOTE: Flyway runs automatically on Spring Boot startup.
	@rem   To run manually, enable the line below (requires flyway plugin in pom.xml):
	@rem   cd backend/restaurant-backend && mvn flyway:migrate
	@echo ======================================

run:
	@echo ======================================
	@echo   Starting Ecosystem via PM2...
	pm2 startOrRestart ecosystem.config.js
	pm2 save
	@echo ======================================
	@echo   System is live. View logs with: make logs

stop:
	@echo ======================================
	@echo   Stopping Ecosystem...
	pm2 stop ecosystem.config.js
	@echo ======================================

restart:
	@echo ======================================
	@echo   Restarting Ecosystem...
	pm2 restart ecosystem.config.js
	@echo ======================================
	@echo   System restarted.

logs:
	pm2 logs
