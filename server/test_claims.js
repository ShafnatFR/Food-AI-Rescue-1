const db = require('./db');

async function testGetClaims() {
    await db.initPool();
    let query = `
        SELECT c.*, f.name as foodName, f.image_url as imageUrl,
               u_prov.name as providerName, u_prov.phone as donorPhone,
               u_rec.name as receiverName, u_rec.phone as receiverPhone,
               a_prov.latitude as prov_lat, a_prov.longitude as prov_lng, a_prov.full_address as prov_addr,
               a_prov.contact_name as prov_contact, a_prov.contact_phone as prov_phone, a_prov.label as prov_label,
               a_rec.latitude as rec_lat, a_rec.longitude as rec_lng, a_rec.full_address as rec_addr,
               a_rec.contact_name as rec_contact, a_rec.contact_phone as rec_phone, a_rec.label as rec_label,
               rev.rating as rating, rev.comment as review, rev.review_media as reviewMedia,
               rep.id as reportId, rep.category as reportReason, rep.description as reportDescription,
               rep.evidence_photo as reportEvidence, rep.status as reportStatus,
               u_reporter.phone as reporterPhone
        FROM claims c 
        JOIN food_items f ON c.food_id = f.id 
        JOIN users u_prov ON f.provider_id = u_prov.id
        JOIN users u_rec ON c.receiver_id = u_rec.id
        LEFT JOIN addresses a_prov ON f.provider_id = a_prov.user_id AND a_prov.is_primary = 1
        LEFT JOIN addresses a_rec ON c.address_id = a_rec.id
        LEFT JOIN reviews rev ON c.id = rev.claim_id
        LEFT JOIN reports rep ON c.id = rep.claim_id
        LEFT JOIN users u_reporter ON rep.reporter_id = u_reporter.id
        WHERE 1=1
    `;
    const params = [];
    const [rows] = await db.query(query, params);
    console.log("Raw claims rows count:", rows.length);
    if (rows.length > 0) {
        console.log("First row status:", rows[0].status);
    }
}
testGetClaims().catch(console.error).finally(() => process.exit(0));
