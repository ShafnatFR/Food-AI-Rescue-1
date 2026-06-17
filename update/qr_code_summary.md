# Logika QR Code: Generate, Pemindaian, dan Pembaruan Status

Pada sistem Food AI Rescue, mekanisme QR Code digunakan untuk melakukan validasi serah terima makanan baik saat pengambilan di donatur (Provider) maupun saat penyerahan ke penerima (Receiver).

## 1. Pembuatan QR Code (Sisi Penerima)

Kode QR dihasilkan pada sisi Penerima (Receiver) ketika mereka melihat detail klaim pesanan mereka. Aplikasi menggunakan layanan API eksternal (`qrserver.com`) untuk merender gambar QR berdasarkan `uniqueCode` dari pesanan.

```tsx
// view/profile/components/ClaimHistoryDetail.tsx
<div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 inline-block mb-6">
    <img 
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(item.uniqueCode || item.id)}`} 
        alt="QR Code" 
        className="w-48 h-48" 
    />
</div>
<div className="bg-stone-100 dark:bg-stone-800 px-6 py-3 rounded-xl border border-stone-200 dark:border-stone-700 w-full mb-6">
    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">ID KLAIM</p>
    <p className="text-2xl font-mono font-bold tracking-widest text-stone-800 dark:text-stone-200">
        {item.uniqueCode || item.id.substring(0,8)}
    </p>
</div>
```

## 2. Pemindaian dan Validasi QR Code (Sisi Relawan)

Sisi relawan dilengkapi dengan pembaca QR internal yang menggunakan pustaka `jsQR` via kanvas HTML5, atau dengan input manual.

```tsx
// view/volunteer/index.tsx
const handleVerifyCode = (code: string) => {
    // 1. Mencari data klaim yang sedang aktif
    const targetClaim = activeClaims.find(c => String(c.id) === String(scanningForTaskId));
    if (!targetClaim) return;

    setIsVerifying(true);
    
    setTimeout(() => {
        setIsVerifying(false);

        // 2. Memeriksa kecocokan kode QR dengan Unique Code di Database
        if (code.toUpperCase() !== targetClaim.uniqueCode?.toUpperCase()) {
            setVerificationResult({ status: 'error', message: 'KODE QR TIDAK SESUAI!', code });
            return;
        }

        // 3. Memeriksa apakah QR sudah pernah dipakai (Double-Scan Prevention)
        if (targetClaim.isScanned && (targetClaim.status as any) === 'completed') {
            setVerificationResult({ status: 'already_taken', message: 'KODE INI SUDAH PERNAH DIGUNAKAN.', code });
            return;
        }

        setVerificationResult({ status: 'success', message: 'QR BERHASIL DIVALIDASI!', code });
        
        // 4. Memicu Pembaruan Status
        if (onUpdateStatus) {
            // Menentukan fase pengiriman: 
            // - Jika masih proses ambil di donatur -> ubah ke 'delivering'
            // - Jika penyerahan ke penerima -> ubah ke 'completed'
            const isPickingUp = targetClaim.courierStatus === 'picking_up';
            
            if (isPickingUp) {
                onUpdateStatus(targetClaim.id, 'active', { courierStatus: 'delivering' });
            } else {
                onUpdateStatus(targetClaim.id, 'completed', { courierStatus: 'completed', isScanned: true });
                setCompletedTaskIds(prev => new Set(prev).add(targetClaim.id));
            }
        }
    }, 800);
};
```

## 3. Pembaruan Status di Database

Ketika `onUpdateStatus` dipanggil, properti ini mengarah ke `handleUpdateStatus` di `App.tsx`, yang akhirnya memanggil layanan database lokal/backend (`db.updateClaimStatus()`). 

**Siklus Pembaruannya:**
1. **Fase Pengambilan (Pickup):** Jika relawan baru saja memindai QR donatur (atau menunjukkan QR Ambil), status `courierStatus` di-update menjadi `delivering` (dalam pengiriman).
2. **Fase Penyerahan (Drop-off):** Jika relawan memindai QR milik Penerima, status utama pesanan `status` akan diubah menjadi `completed`, properti `isScanned` diubah menjadi `true`, dan status kurir `courierStatus` juga disetel menjadi `completed`. 
3. **Persistensi Data:** Pembaruan ini disimpan ke dalam penyimpanan data persisten (IndexedDB/API Backend), yang secara *real-time* mengubah tampilan antarmuka (misalnya: animasi selebrasi di sisi relawan dan mengubah riwayat klaim di sisi penerima).
