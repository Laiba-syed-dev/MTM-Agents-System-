# MTM Agent System — REST API Documentation

Base URL: `/api/v1`

## Endpoints

### 1. Upload Message Pack
- **URL**: `POST /packs/upload`
- **Payload**: `multipart/form-data` with `file`, or `application/json` with `{ "text": "..." }`
- **Response**: `{ "success": true, "sessionId": "session_...", "packId": "pack_...", "status": "uploaded" }`

### 2. Process Session (Full Pipeline)
- **URL**: `POST /sessions/:id/process`
- **Response**: `{ "success": true, "messagesCount": 8, "factsCount": 16, "rejectedCount": 1, "plan": { ... }, "tokenSummary": { ... } }`

### 3. Session Status & Stats
- **URL**: `GET /sessions/:id`
- **Response**: `{ "success": true, "sessionId": "...", "status": "completed", "stats": { ... } }`

### 4. Extracted Facts
- **URL**: `GET /sessions/:id/facts`
- **Response**: `{ "success": true, "count": 16, "facts": [ { "category": "food", "field": "pricePerPerson", "value": 1200, ... } ] }`

### 5. Current Plan
- **URL**: `GET /sessions/:id/plan`
- **Response**: `{ "success": true, "plan": { "version": 1, "status": "valid", "venue": { ... }, ... } }`

### 6. Execution Trace
- **URL**: `GET /sessions/:id/trace`
- **Response**: `{ "success": true, "count": 6, "traces": [ ... ], "tokenSummary": { "totalTokens": 3856, ... } }`

### 7. Rejected Messages
- **URL**: `GET /sessions/:id/rejected`
- **Response**: `{ "success": true, "rejected": [ { "reasonCode": "UNAUTHORIZED_PROPOSAL", ... } ] }`

### 8. Incremental Update
- **URL**: `POST /sessions/:id/update`
- **Payload**: `{ "message": "Finance here. The printing bill came in at Rs 15,000, not Rs 10,000." }`
- **Response**: `{ "success": true, "previousVersion": 1, "currentVersion": 2, "affectedAreas": ["budget"], "modelCallsUsed": 1, "validationStatus": "valid" }`

### 9. Export Files
- **URL**: `GET /sessions/:id/export`
- **Response**: `{ "success": true, "planPath": ".../output/final_plan.json", "tracePath": ".../output/trace.txt" }`
