const fs = require('fs');

let sql = fs.readFileSync('../schema.sql', 'utf8');

// 1. Remove SET SQL_MODE and FOREIGN_KEY_CHECKS
sql = sql.replace(/SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";/g, '');
sql = sql.replace(/SET FOREIGN_KEY_CHECKS = 0;/g, '');
sql = sql.replace(/SET FOREIGN_KEY_CHECKS = 1;/g, '');

// 2. Remove ENGINE=InnoDB...
sql = sql.replace(/\) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;/g, ');');

// 3. Remove backticks
sql = sql.replace(/`/g, '"');

// 4. Replace AUTO_INCREMENT with SERIAL
sql = sql.replace(/int\(\d+\) NOT NULL AUTO_INCREMENT/gi, 'SERIAL');
sql = sql.replace(/int NOT NULL AUTO_INCREMENT/gi, 'SERIAL');

// 5. Replace int(11) with INTEGER
sql = sql.replace(/int\(\d+\)/gi, 'INTEGER');

// 6. Replace tinyint(1) with BOOLEAN
sql = sql.replace(/tinyint\(1\)/gi, 'BOOLEAN');

// 7. Replace datetime with TIMESTAMP
sql = sql.replace(/datetime/gi, 'TIMESTAMP');

// 8. Replace longtext with TEXT
sql = sql.replace(/longtext/gi, 'TEXT');

// 9. ON UPDATE current_timestamp()
sql = sql.replace(/ON UPDATE current_timestamp\(\)/gi, '');

// 10. Fix ENUMs
sql = sql.replace(/enum\([^)]+\)/gi, 'VARCHAR(255)');

// 11. Replace UNIQUE KEY "name" ("col") with UNIQUE ("col")
sql = sql.replace(/UNIQUE KEY "[^"]+" \("([^"]+)"\)/gi, 'UNIQUE ("$1")');

// 12. Remove KEY "name" ("col")
sql = sql.replace(/,\s*KEY "[^"]+" \("([^"]+)"\)/gi, '');
sql = sql.replace(/,\s*KEY "[^"]+" \("([^"]+", "[^"]+", "[^"]+)"\)/gi, ''); // For idx_identifier_channel

// 13. Remove all double quotes to make it standard lower case PG names
sql = sql.replace(/"/g, '');

// 14. Fix COMMENT
sql = sql.replace(/COMMENT '([^']+)'/gi, '');

fs.writeFileSync('../schema-pg.sql', sql);
console.log('Conversion complete: schema-pg.sql');
