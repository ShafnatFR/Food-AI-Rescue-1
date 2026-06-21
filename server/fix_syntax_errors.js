const fs = require('fs');

let code = fs.readFileSync('server/index.js', 'utf8');

// 1. Double quotes in UPDATE claims
code = code.replace(/status = "IN_PROGRESS", courier_status = "delivering"/g, "status = 'IN_PROGRESS', courier_status = 'delivering'");
code = code.replace(/status = "COMPLETED"/g, "status = 'COMPLETED'");

// 2. Double quotes in queries with "" or "VOLUNTEER"
code = code.replace(/phone != ""/g, "phone != ''");
code = code.replace(/role = "VOLUNTEER"/g, "role = 'VOLUNTEER'");

// 3. column c.provider_id does not exist
code = code.replace(/\(c\.receiver_id = \? OR c\.provider_id = \? OR c\.volunteer_id = \?\)/g, "(c.receiver_id = ? OR f.provider_id = ? OR c.volunteer_id = ?)");

// 4. DAY(), MONTH(), YEAR()
code = code.replace(/DAY\(c\.created_at\)/g, "${db.isPostgres ? 'EXTRACT(DAY FROM c.created_at)' : 'DAY(c.created_at)'}");
code = code.replace(/MONTH\(c\.created_at\)/g, "${db.isPostgres ? 'EXTRACT(MONTH FROM c.created_at)' : 'MONTH(c.created_at)'}");
code = code.replace(/YEAR\(c\.created_at\)/g, "${db.isPostgres ? 'EXTRACT(YEAR FROM c.created_at)' : 'YEAR(c.created_at)'}");
code = code.replace(/MONTH\(CURRENT_DATE\(\)\)/g, "${db.isPostgres ? 'EXTRACT(MONTH FROM CURRENT_DATE)' : 'MONTH(CURRENT_DATE())'}");
code = code.replace(/YEAR\(CURRENT_DATE\(\)\)/g, "${db.isPostgres ? 'EXTRACT(YEAR FROM CURRENT_DATE)' : 'YEAR(CURRENT_DATE())'}");

// 5. is_primary = FALSE/TRUE (smallint vs boolean)
code = code.replace(/is_primary = FALSE/g, "is_primary = 0");
code = code.replace(/is_primary = TRUE/g, "is_primary = 1");

// 6. missing FROM-clause entry for table "u" and "uq"
// We need to look up these specific queries
fs.writeFileSync('server/index.js.fix', code);
console.log('Fixes applied to index.js.fix');
