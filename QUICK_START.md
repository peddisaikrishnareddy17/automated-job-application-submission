# Local Development Flow (5-Minute Start)

Follow these steps to get your environment running quickly.

### 1. Database & Cache
Ensure MongoDB and Redis are running locally on their default ports:
- MongoDB: `mongodb://localhost:27017`
- Redis: `redis://localhost:6379`

### 2. Environment Variables
**In `server/.env`**:
```env
MONGODB_URI=mongodb://localhost:27017/jobassistant
JWT_SECRET=supersecret
REDIS_URL=redis://localhost:6379
PORT=4000
NODE_ENV=development
```

**In `.env.local`** (Root):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Run Commands
Open two terminals:

**Terminal 1 (Server)**:
```bash
cd server
npm start
```

**Terminal 2 (Client)**:
```bash
npm run dev
```

### 4. Impersonation (Development Mode)
If you want to skip registration:
- Use `POST /api/v1/auth/impersonate` with `{ "email": "dev@test.com" }` to get a valid token.
- Or simply register a new account on the frontend.

### 5. Automation Warning
Make sure `chromedriver` is available or Chrome is installed. The runner uses `selenium-webdriver` which usually handles driver management, but local Chrome is required.
