const fs = require('fs');

let code = fs.readFileSync('server/index.js', 'utf8');

// 1. UPDATE_SETTINGS (Line ~211)
code = code.replace(
    /'INSERT INTO system_settings \(setting_key, setting_value\) VALUES \(\?, \?\) ON CONFLICT \(setting_key\) DO UPDATE SET setting_value = \?',/,
    "db.isPostgres ? 'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON CONFLICT (setting_key) DO UPDATE SET setting_value = ?' : 'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',"
);

// 2. _updateUserPoints (Line ~1484)
code = code.replace(
    /ON CONFLICT \(user_id\) DO UPDATE SET/g,
    "${db.isPostgres ? 'ON CONFLICT (user_id) DO UPDATE SET' : 'ON DUPLICATE KEY UPDATE'}"
);

// 3. markBroadcastAsRead (Line ~2267)
code = code.replace(
    /'INSERT INTO broadcast_reads \(user_id, broadcast_id\) VALUES \(\?, \?\) ON CONFLICT DO NOTHING',/,
    "db.isPostgres ? 'INSERT INTO broadcast_reads (user_id, broadcast_id) VALUES (?, ?) ON CONFLICT DO NOTHING' : 'INSERT IGNORE INTO broadcast_reads (user_id, broadcast_id) VALUES (?, ?)',"
);

// Date INTERVAL Replacements
code = code.replace(/NOW\(\) - INTERVAL '7 days'/g, "${db.isPostgres ? \"NOW() - INTERVAL '7 days'\" : \"DATE_SUB(NOW(), INTERVAL 7 DAY)\"}");
code = code.replace(/NOW\(\) - INTERVAL '14 days'/g, "${db.isPostgres ? \"NOW() - INTERVAL '14 days'\" : \"DATE_SUB(NOW(), INTERVAL 14 DAY)\"}");
code = code.replace(/NOW\(\) - INTERVAL '30 days'/g, "${db.isPostgres ? \"NOW() - INTERVAL '30 days'\" : \"DATE_SUB(NOW(), INTERVAL 30 DAY)\"}");
code = code.replace(/NOW\(\) - INTERVAL '12 months'/g, "${db.isPostgres ? \"NOW() - INTERVAL '12 months'\" : \"DATE_SUB(NOW(), INTERVAL 12 MONTH)\"}");
code = code.replace(/CURRENT_DATE - INTERVAL '6 days'/g, "${db.isPostgres ? \"CURRENT_DATE - INTERVAL '6 days'\" : \"DATE_SUB(CURDATE(), INTERVAL 6 DAY)\"}");
code = code.replace(/NOW\(\) \+ INTERVAL '24 hours'/g, "${db.isPostgres ? \"NOW() + INTERVAL '24 hours'\" : \"DATE_ADD(NOW(), INTERVAL 24 HOUR)\"}");

// MySQL specific functions DAYOFWEEK and DATEDIFF
code = code.replace(/DAYOFWEEK\(created_at\)/g, "${db.isPostgres ? 'EXTRACT(DOW FROM created_at) + 1' : 'DAYOFWEEK(created_at)'}");
code = code.replace(/DAYOFWEEK\(f\.created_at\)/g, "${db.isPostgres ? 'EXTRACT(DOW FROM f.created_at) + 1' : 'DAYOFWEEK(f.created_at)'}");

code = code.replace(/DATEDIFF\(NOW\(\), created_at\)/g, "${db.isPostgres ? \"DATE_PART('day', NOW() - created_at)\" : 'DATEDIFF(NOW(), created_at)'}");
code = code.replace(/DATEDIFF\(NOW\(\), f\.created_at\)/g, "${db.isPostgres ? \"DATE_PART('day', NOW() - f.created_at)\" : 'DATEDIFF(NOW(), f.created_at)'}");


fs.writeFileSync('server/index.js', code);
console.log('Hybrid code generated in index.js');
