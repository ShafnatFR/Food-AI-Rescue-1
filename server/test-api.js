

async function test() {
    const res = await fetch('http://localhost:3000/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY_ORDER_QR', data: { uniqueCode: 'PICKUP-9800' } })
    });
    const json = await res.json();
    console.log(json);
}

test();
