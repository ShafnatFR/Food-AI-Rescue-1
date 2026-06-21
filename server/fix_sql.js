const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// Fix getAdmins double quotes
code = code.replace('role IN ("ADMIN", "SUPER_ADMIN")', "role IN ('ADMIN', 'SUPER_ADMIN')");

// Fix DATE_SUB and DATE_ADD
code = code.replace(/DATE_SUB\(NOW\(\),\s*INTERVAL\s*(\d+)\s*DAY\)/g, "NOW() - INTERVAL '$1 days'");
code = code.replace(/DATE_SUB\(NOW\(\),\s*INTERVAL\s*(\d+)\s*MONTH\)/g, "NOW() - INTERVAL '$1 months'");
code = code.replace(/DATE_SUB\(CURDATE\(\),\s*INTERVAL\s*(\d+)\s*DAY\)/g, "CURRENT_DATE - INTERVAL '$1 days'");
code = code.replace(/DATE_ADD\(NOW\(\),\s*INTERVAL\s*(\d+)\s*HOUR\)/g, "NOW() + INTERVAL '$1 hours'");

fs.writeFileSync('server/index.js', code);
console.log('Fixed syntax!');
