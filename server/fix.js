const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');
code = code.replace(/phone != \\'\\'/g, "phone != ''");
code = code.replace(/WHERE role = \\'VOLUNTEER\\'/g, "WHERE role = 'VOLUNTEER'");
fs.writeFileSync('server/index.js', code);
