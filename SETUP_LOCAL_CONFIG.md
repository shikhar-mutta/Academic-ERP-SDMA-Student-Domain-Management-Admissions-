# Local Configuration Setup

## 🔐 Setting Up Google OAuth Credentials

The `application.properties` file uses placeholders for security. To run the application locally, you need to set up your Google OAuth credentials.

### Option 1: Environment Variables (Recommended)

Set environment variables before running the backend:

```bash
export GOOGLE_CLIENT_ID=your-actual-client-id
export GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

Then run:
```bash
cd backend
mvn spring-boot:run
```

### Option 2: Local Properties File

Create a local properties file that won't be committed to git:

1. Create `backend/src/main/resources/application-local.properties`:
```properties
google.client-id=your-actual-client-id
google.client-secret=your-actual-client-secret
```

2. Spring Boot will automatically load this file (it's in .gitignore)

### Option 3: Direct Edit (Not Recommended for Production)

You can directly edit `application.properties`, but remember:
- **Never commit** actual credentials to git
- This file is tracked in git, so be careful with changes

---

## 📝 Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8080/oauth2/callback`
6. Copy the Client ID and Client Secret

---

**Note:** The `application-local.properties` file is automatically ignored by git, so your credentials will remain local.

