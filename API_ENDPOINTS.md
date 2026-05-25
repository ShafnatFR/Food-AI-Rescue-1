# API ENDPOINTS DOCUMENTATION
## Food AI Rescue Platform

**Base URL:** `http://172.16.0.2:5000/api`
**Method:** POST
**Content-Type:** application/json

---

## REQUEST FORMAT

All requests follow this structure:
```json
{
  "action": "ACTION_NAME",
  "data": {
    // action-specific data
  }
}
```

---

## AUTHENTICATION ENDPOINTS

### 1. REGISTER_USER
**Purpose:** Register new user account

**Request:**
```json
{
  "action": "REGISTER_USER",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "hashedPassword",
    "phone": "08123456789",
    "address": "Jl. Merdeka No. 1",
    "role": "individual_donor"
  }
}
```

**Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "individual_donor",
  "status": "pending",
  "points": 0,
  "joinDate": "2026-05-25",
  "isNewUser": true
}
```

**Roles:** `individual_donor`, `corporate_donor`, `recipient`, `volunteer`, `admin`, `super_admin`

---

### 2. LOGIN_USER
**Purpose:** Authenticate user and create session

**Request:**
```json
{
  "action": "LOGIN_USER",
  "data": {
    "email": "john@example.com",
    "password": "hashedPassword"
  }
}
```

**Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "individual_donor",
  "status": "active",
  "points": 150,
  "joinDate": "2026-05-25",
  "avatar": "https://ui-avatars.com/api/?name=John+Doe"
}
```

---

## USER MANAGEMENT ENDPOINTS

### 3. GET_USERS
**Purpose:** Fetch all users (Admin only)

**Request:**
```json
{
  "action": "GET_USERS",
  "data": {}
}
```

**Response:**
```json
[
  {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "individual_donor",
    "status": "active",
    "points": 150,
    "joinDate": "2026-05-25"
  }
]
```

---

### 4. GET_USER
**Purpose:** Fetch single user by ID

**Request:**
```json
{
  "action": "GET_USER",
  "data": {
    "id": "user_123"
  }
}
```

**Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "individual_donor",
  "status": "active",
  "points": 150,
  "joinDate": "2026-05-25",
  "phone": "08123456789",
  "address": "Jl. Merdeka No. 1",
  "avatar": "https://ui-avatars.com/api/?name=John+Doe"
}
```

---

### 5. UPSERT_USER
**Purpose:** Create or update user

**Request:**
```json
{
  "action": "UPSERT_USER",
  "data": {
    "id": "user_123",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "phone": "08123456789",
    "address": "Jl. Merdeka No. 2",
    "avatar": "https://example.com/avatar.jpg",
    "points": 200,
    "status": "active"
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": "user_123"
}
```

---

## ADDRESS MANAGEMENT ENDPOINTS

### 6. GET_ADDRESSES
**Purpose:** Fetch user addresses

**Request:**
```json
{
  "action": "GET_ADDRESSES",
  "data": {
    "userId": "user_123"
  }
}
```

**Response:**
```json
[
  {
    "id": "addr_1",
    "userId": "user_123",
    "label": "Rumah",
    "fullAddress": "Jl. Merdeka No. 1, Jakarta",
    "contactName": "John Doe",
    "contactPhone": "08123456789",
    "isPrimary": true,
    "lat": -6.2088,
    "lng": 106.8456
  }
]
```

---

### 7. ADD_ADDRESS
**Purpose:** Add new address

**Request:**
```json
{
  "action": "ADD_ADDRESS",
  "data": {
    "userId": "user_123",
    "label": "Kantor",
    "fullAddress": "Jl. Sudirman No. 10, Jakarta",
    "contactName": "John Doe",
    "contactPhone": "08123456789",
    "isPrimary": false,
    "lat": -6.2200,
    "lng": 106.8000
  }
}
```

**Response:**
```json
{
  "id": "addr_2",
  "success": true
}
```

---

### 8. UPDATE_ADDRESS
**Purpose:** Update existing address

**Request:**
```json
{
  "action": "UPDATE_ADDRESS",
  "data": {
    "id": "addr_1",
    "label": "Rumah Baru",
    "fullAddress": "Jl. Merdeka No. 5, Jakarta",
    "isPrimary": true
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 9. DELETE_ADDRESS
**Purpose:** Delete address

**Request:**
```json
{
  "action": "DELETE_ADDRESS",
  "data": {
    "id": "addr_1"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## INVENTORY ENDPOINTS

### 10. GET_INVENTORY
**Purpose:** Fetch food items (filtered by provider if specified)

**Request:**
```json
{
  "action": "GET_INVENTORY",
  "data": {
    "providerId": "user_123"
  }
}
```

**Response:**
```json
[
  {
    "id": "food_1",
    "providerId": "user_123",
    "name": "Nasi Kuning",
    "description": "Nasi kuning dengan telur",
    "quantity": "10 porsi",
    "initialQuantity": 10,
    "currentQuantity": 8,
    "category": "READY_TO_EAT",
    "expiryTime": "2026-05-25T18:00:00Z",
    "createdAt": "2026-05-25T12:00:00Z",
    "imageUrl": "https://example.com/nasi-kuning.jpg",
    "providerName": "Restoran Berkah",
    "location": {
      "lat": -6.2088,
      "lng": 106.8456,
      "address": "Jl. Merdeka No. 1, Jakarta"
    },
    "status": "available",
    "deliveryMethod": "both",
    "aiVerification": {
      "isEdible": true,
      "halalScore": 0.95,
      "qualityScore": 0.88,
      "ingredients": ["beras", "telur", "kunyit"]
    },
    "socialImpact": {
      "totalPoints": 100,
      "co2Saved": 2.5,
      "waterSaved": 50,
      "landSaved": 0.1,
      "wasteReduction": 1.2
    }
  }
]
```

---

### 11. ADD_FOOD_ITEM
**Purpose:** Add new food item to inventory

**Request:**
```json
{
  "action": "ADD_FOOD_ITEM",
  "data": {
    "providerId": "user_123",
    "name": "Nasi Kuning",
    "description": "Nasi kuning dengan telur",
    "quantity": "10 porsi",
    "initialQuantity": 10,
    "category": "READY_TO_EAT",
    "expiryTime": "2026-05-25T18:00:00Z",
    "imageUrl": "https://example.com/nasi-kuning.jpg",
    "providerName": "Restoran Berkah",
    "location": {
      "lat": -6.2088,
      "lng": 106.8456,
      "address": "Jl. Merdeka No. 1, Jakarta"
    },
    "deliveryMethod": "both"
  }
}
```

**Response:**
```json
{
  "id": "food_1",
  "success": true
}
```

---

### 12. UPDATE_FOOD_ITEM
**Purpose:** Update food item details

**Request:**
```json
{
  "action": "UPDATE_FOOD_ITEM",
  "data": {
    "id": "food_1",
    "name": "Nasi Kuning Premium",
    "description": "Nasi kuning dengan telur dan ayam",
    "quantity": "15 porsi",
    "currentQuantity": 12
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 13. UPDATE_FOOD_STOCK
**Purpose:** Update food quantity

**Request:**
```json
{
  "action": "UPDATE_FOOD_STOCK",
  "data": {
    "id": "food_1",
    "newQuantity": 5
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 14. DELETE_FOOD_ITEM
**Purpose:** Delete food item

**Request:**
```json
{
  "action": "DELETE_FOOD_ITEM",
  "data": {
    "id": "food_1"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## CLAIM ENDPOINTS

### 15. GET_CLAIMS
**Purpose:** Fetch claims (filtered by provider/receiver)

**Request:**
```json
{
  "action": "GET_CLAIMS",
  "data": {
    "providerId": "user_123",
    "receiverId": "user_456"
  }
}
```

**Response:**
```json
[
  {
    "id": "claim_1",
    "foodId": "food_1",
    "providerId": "user_123",
    "receiverId": "user_456",
    "foodName": "Nasi Kuning",
    "providerName": "Restoran Berkah",
    "receiverName": "Panti Asuhan Kasih Ibu",
    "date": "2026-05-25T12:30:00Z",
    "status": "active",
    "claimedQuantity": "5 porsi",
    "deliveryMethod": "delivery",
    "location": {
      "lat": -6.2100,
      "lng": 106.8500,
      "address": "Jl. Sudirman No. 10, Jakarta"
    },
    "rating": 5,
    "review": "Makanan segar dan berkualitas!",
    "courierName": "Budi Santoso",
    "courierStatus": "delivering"
  }
]
```

---

### 16. PROCESS_CLAIM
**Purpose:** Create new claim

**Request:**
```json
{
  "action": "PROCESS_CLAIM",
  "data": {
    "foodId": "food_1",
    "receiverId": "user_456",
    "claimedQuantity": "5 porsi",
    "deliveryMethod": "delivery",
    "location": {
      "lat": -6.2100,
      "lng": 106.8500,
      "address": "Jl. Sudirman No. 10, Jakarta"
    }
  }
}
```

**Response:**
```json
{
  "id": "claim_1",
  "success": true
}
```

---

### 17. UPDATE_CLAIM_STATUS
**Purpose:** Update claim status

**Request:**
```json
{
  "action": "UPDATE_CLAIM_STATUS",
  "data": {
    "id": "claim_1",
    "status": "completed",
    "courierName": "Budi Santoso",
    "courierStatus": "completed",
    "isScanned": true
  }
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Values:** `active`, `completed`, `cancelled`

---

### 18. VERIFY_ORDER_QR
**Purpose:** Verify QR code for order

**Request:**
```json
{
  "action": "VERIFY_ORDER_QR",
  "data": {
    "claimId": "claim_1",
    "qrCode": "FAR_CLAIM_1_ABC123"
  }
}
```

**Response:**
```json
{
  "valid": true,
  "claimId": "claim_1",
  "foodName": "Nasi Kuning"
}
```

---

## REVIEW & RATING ENDPOINTS

### 19. SUBMIT_REVIEW
**Purpose:** Submit review and rating

**Request:**
```json
{
  "action": "SUBMIT_REVIEW",
  "data": {
    "claimId": "claim_1",
    "rating": 5,
    "review": "Makanan segar dan berkualitas!",
    "reviewMedia": ["https://example.com/photo1.jpg"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "claimId": "claim_1"
}
```

---

## REPORT ENDPOINTS

### 20. SUBMIT_REPORT
**Purpose:** Submit moderation report

**Request:**
```json
{
  "action": "SUBMIT_REPORT",
  "data": {
    "type": "food_mismatch",
    "targetId": "food_1",
    "targetType": "food",
    "reason": "Makanan tidak sesuai deskripsi",
    "description": "Makanan yang diterima berbeda dengan foto",
    "evidence": ["https://example.com/evidence1.jpg"]
  }
}
```

**Response:**
```json
{
  "id": "report_1",
  "success": true,
  "status": "new"
}
```

---

### 21. UPDATE_REPORT_STATUS
**Purpose:** Update report status (Admin only)

**Request:**
```json
{
  "action": "UPDATE_REPORT_STATUS",
  "data": {
    "id": "report_1",
    "status": "completed",
    "action": "suspend_user",
    "actionDetails": "User suspended for 7 days"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Values:** `new`, `in_progress`, `completed`, `rejected`

---

## FAQ ENDPOINTS

### 22. GET_FAQS
**Purpose:** Fetch all FAQs

**Request:**
```json
{
  "action": "GET_FAQS",
  "data": {}
}
```

**Response:**
```json
[
  {
    "id": "faq_1",
    "question": "Apa itu Food AI Rescue?",
    "answer": "Platform penyelamatan surplus pangan berbasis AI...",
    "category": "Umum"
  }
]
```

---

### 23. UPSERT_FAQ
**Purpose:** Create or update FAQ (Admin only)

**Request:**
```json
{
  "action": "UPSERT_FAQ",
  "data": {
    "faq": {
      "id": "faq_1",
      "question": "Apa itu Food AI Rescue?",
      "answer": "Platform penyelamatan surplus pangan berbasis AI...",
      "category": "Umum"
    },
    "actor": {
      "id": "admin_1",
      "name": "Admin Shafnat"
    }
  }
}
```

**Response:**
```json
{
  "id": "faq_1",
  "success": true
}
```

---

### 24. DELETE_FAQ
**Purpose:** Delete FAQ (Admin only)

**Request:**
```json
{
  "action": "DELETE_FAQ",
  "data": {
    "id": "faq_1"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## NOTIFICATION ENDPOINTS

### 25. GET_NOTIFICATIONS
**Purpose:** Fetch user notifications

**Request:**
```json
{
  "action": "GET_NOTIFICATIONS",
  "data": {
    "userId": "user_123",
    "role": "individual_donor"
  }
}
```

**Response:**
```json
[
  {
    "id": "notif_1",
    "userId": "user_123",
    "title": "Makanan Anda Diklaim",
    "content": "Panti Asuhan Kasih Ibu telah mengklaim Nasi Kuning Anda",
    "type": "info",
    "isRead": false,
    "createdAt": "2026-05-25T12:30:00Z"
  }
]
```

---

### 26. MARK_NOTIF_READ
**Purpose:** Mark notification as read

**Request:**
```json
{
  "action": "MARK_NOTIF_READ",
  "data": {
    "userId": "user_123",
    "notifId": "notif_1"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## BROADCAST ENDPOINTS

### 27. SEND_BROADCAST
**Purpose:** Send broadcast notification (Admin only)

**Request:**
```json
{
  "action": "SEND_BROADCAST",
  "data": {
    "message": {
      "title": "Pemeliharaan Sistem",
      "content": "Sistem akan dirawat pada 25 Mei 2026 pukul 22:00",
      "target": "all",
      "type": "info"
    },
    "actor": {
      "id": "admin_1",
      "name": "Admin Shafnat"
    }
  }
}
```

**Response:**
```json
{
  "id": "broadcast_1",
  "success": true,
  "sentAt": "2026-05-25T12:30:00Z"
}
```

**Target Values:** `all`, `provider`, `volunteer`, `recipient`, `admin`
**Type Values:** `info`, `success`, `warning`

---

## SETTINGS ENDPOINTS

### 28. GET_SETTINGS
**Purpose:** Fetch app settings

**Request:**
```json
{
  "action": "GET_SETTINGS",
  "data": {}
}
```

**Response:**
```json
{
  "appName": "Food AI Rescue",
  "appSlogan": "Selamatkan Makanan, Selamatkan Bumi",
  "supportPhone": "628123456789",
  "pointsPerKg": 100,
  "co2Multiplier": 2.5,
  "disableExpiryLogic": false,
  "maintenance": false,
  "disable_signup": false,
  "readonly_mode": false
}
```

---

### 29. UPDATE_SETTINGS
**Purpose:** Update app settings (Admin only)

**Request:**
```json
{
  "action": "UPDATE_SETTINGS",
  "data": {
    "settings": {
      "appName": "Food AI Rescue v2",
      "maintenance": true,
      "pointsPerKg": 150
    },
    "actor": {
      "id": "admin_1",
      "name": "Admin Shafnat"
    }
  }
}
```

**Response:**
```json
{
  "appName": "Food AI Rescue v2",
  "maintenance": true,
  "pointsPerKg": 150
}
```

---

## GAMIFICATION ENDPOINTS

### 30. GET_BADGES
**Purpose:** Fetch badges for role

**Request:**
```json
{
  "action": "GET_BADGES",
  "data": {
    "role": "individual_donor"
  }
}
```

**Response:**
```json
[
  {
    "id": "badge_1",
    "name": "First Donation",
    "role": "all",
    "minPoints": 0,
    "icon": "🎉",
    "description": "Donasi pertama Anda",
    "awardedTo": 150
  }
]
```

---

### 31. UPDATE_SELECTED_BADGE
**Purpose:** Set user's displayed badge

**Request:**
```json
{
  "action": "UPDATE_SELECTED_BADGE",
  "data": {
    "userId": "user_123",
    "badgeId": "badge_1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "badgeId": "badge_1"
}
```

---

## RANK LEVEL ENDPOINTS

### 32. GET_RANK_LEVELS
**Purpose:** Fetch all rank levels

**Request:**
```json
{
  "action": "GET_RANK_LEVELS",
  "data": {}
}
```

**Response:**
```json
[
  {
    "id": 1,
    "role": "individual_donor",
    "name": "Bronze",
    "min_points": 0,
    "benefits": ["Akses dasar", "Lihat rating"],
    "color": "#CD7F32",
    "icon": "🥉"
  }
]
```

---

### 33. UPSERT_RANK_LEVEL
**Purpose:** Create or update rank level (Admin only)

**Request:**
```json
{
  "action": "UPSERT_RANK_LEVEL",
  "data": {
    "level": {
      "id": 1,
      "role": "individual_donor",
      "name": "Bronze",
      "min_points": 0,
      "benefits": ["Akses dasar", "Lihat rating"],
      "color": "#CD7F32",
      "icon": "🥉"
    },
    "actor": {
      "id": "admin_1",
      "name": "Admin Shafnat"
    }
  }
}
```

**Response:**
```json
{
  "id": 1,
  "success": true
}
```

---

### 34. DELETE_RANK_LEVEL
**Purpose:** Delete rank level (Admin only)

**Request:**
```json
{
  "action": "DELETE_RANK_LEVEL",
  "data": {
    "id": 1
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## AI ENDPOINTS

### 35. VERIFY_FOOD
**Purpose:** AI verification of food image

**Request:**
```json
{
  "action": "VERIFY_FOOD",
  "data": {
    "payload": {
      "imageUrl": "https://example.com/food.jpg",
      "foodName": "Nasi Kuning",
      "description": "Nasi kuning dengan telur"
    },
    "actorId": "user_123"
  }
}
```

**Response:**
```json
{
  "isEdible": true,
  "halalScore": 0.95,
  "qualityScore": 0.88,
  "ingredients": ["beras", "telur", "kunyit"],
  "allergens": ["telur"],
  "reason": "Makanan terlihat segar dan berkualitas"
}
```

---

### 36. CORPORATE_AI
**Purpose:** Corporate AI features (Packaging, CSR, Kitchen Scanner, Recipe)

**Request (Design Packaging):**
```json
{
  "action": "CORPORATE_AI",
  "data": {
    "type": "DESIGN_PACKAGING",
    "payload": {
      "foodName": "Nasi Kuning",
      "brand": "Restoran Berkah",
      "style": "modern"
    },
    "actorId": "user_123"
  }
}
```

**Response:**
```json
{
  "design": "SVG packaging design...",
  "description": "Desain kemasan modern untuk Nasi Kuning"
}
```

---

## ADMIN DASHBOARD ENDPOINTS

### 37. GET_ADMIN_DASHBOARD
**Purpose:** Fetch admin dashboard data

**Request:**
```json
{
  "action": "GET_ADMIN_DASHBOARD",
  "data": {}
}
```

**Response:**
```json
{
  "totalFoodRescued": 1250,
  "activeCommunity": 45,
  "co2Saved": 312.5,
  "activeReports": 3,
  "recentActivity": [
    {
      "user": "John Doe",
      "action": "Donasi Nasi Kuning",
      "timestamp": "2026-05-25T12:30:00Z"
    }
  ]
}
```

---

### 38. GET_ADMIN_IMPACT
**Purpose:** Fetch ESG impact data

**Request:**
```json
{
  "action": "GET_ADMIN_IMPACT",
  "data": {
    "period": "daily"
  }
}
```

**Response:**
```json
{
  "period": "daily",
  "foodRescued": 125,
  "co2Saved": 31.25,
  "waterSaved": 625,
  "communityServed": 5,
  "mealsProvided": 50
}
```

**Period Values:** `daily`, `monthly`, `yearly`

---

### 39. GET_SYSTEM_LOGS
**Purpose:** Fetch system activity logs (Admin only)

**Request:**
```json
{
  "action": "GET_SYSTEM_LOGS",
  "data": {}
}
```

**Response:**
```json
[
  {
    "id": "log_1",
    "userId": "user_123",
    "action": "Add Food Item",
    "description": "Tambah Nasi Kuning ke inventory",
    "severity": "info",
    "timestamp": "2026-05-25T12:30:00Z"
  }
]
```

---

## IMAGE UPLOAD ENDPOINT

### 40. UPLOAD_IMAGE
**Purpose:** Upload image to server

**Request:**
```json
{
  "action": "UPLOAD_IMAGE",
  "data": {
    "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "filename": "nasi-kuning.jpg",
    "folderType": "food"
  }
}
```

**Response:**
```json
"http://localhost:5000/assets/food/nasi-kuning_1234567890.jpg"
```

**Folder Types:** `food`, `profiles`, `evidence`, `packaging`

---

## ERROR RESPONSES

All endpoints may return error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_ERROR` - Server error

---

## RATE LIMITING

- No explicit rate limiting implemented
- Recommended: 100 requests per minute per IP

---

## AUTHENTICATION

- Session-based authentication
- User ID stored in session
- Role-based access control (RBAC)

---

**Last Updated:** 2026-05-25
**API Version:** 1.0
