-- P11-02 : une question de la FAQ s'affiche sur le site, dans l'application, ou les deux.
ALTER TABLE `chatbot_entries` ADD COLUMN `audience` VARCHAR(10) NOT NULL DEFAULT 'both';
