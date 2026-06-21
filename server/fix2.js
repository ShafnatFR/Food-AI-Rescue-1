const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

code = code.replace(
    /'UPDATE claims SET status = 'IN_PROGRESS', courier_status = 'delivering' WHERE id = \?'/g,
    "\"UPDATE claims SET status = 'IN_PROGRESS', courier_status = 'delivering' WHERE id = ?\""
);

code = code.replace(
    /'UPDATE claims SET is_scanned = 1, status = 'COMPLETED', scanned_at = CURRENT_TIMESTAMP, scanned_by_id = \? WHERE id = \?'/g,
    "\"UPDATE claims SET is_scanned = 1, status = 'COMPLETED', scanned_at = CURRENT_TIMESTAMP, scanned_by_id = ? WHERE id = ?\""
);

fs.writeFileSync('server/index.js', code);
