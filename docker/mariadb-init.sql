-- Runs once, when the MariaDB volume is created (docker-entrypoint-initdb.d).
-- LOCAL DEVELOPMENT ONLY: `prisma migrate dev` creates and drops a temporary
-- "shadow" database, and the tests create `larbi_test`; the image's default
-- user only gets rights on MARIADB_DATABASE, so both would be refused.
GRANT ALL PRIVILEGES ON *.* TO 'larbi'@'%';
FLUSH PRIVILEGES;
