# Swagger/OpenAPI Implementation Guide

## 📚 Overview

This project uses **SpringDoc OpenAPI 3** (Swagger UI) for comprehensive API documentation and interactive testing. The implementation includes JWT Bearer token authentication support for testing secured endpoints.

---

## ✅ Implementation Summary

### **1. Dependencies**
- ✅ `springdoc-openapi-starter-webmvc-ui` (v2.5.0) - Already configured in `pom.xml`

### **2. Configuration**

#### **SwaggerConfig.java**
- ✅ JWT Bearer token security scheme configured
- ✅ API information (title, version, description, contact, license)
- ✅ Development server URL configured
- ✅ Security scheme available for all controllers

#### **application.properties**
- ✅ Swagger UI enabled at `/swagger-ui.html`
- ✅ API docs enabled at `/v3/api-docs`
- ✅ Enhanced UI settings (sorting, filtering, request duration)

### **3. Controller Documentation**

All controllers are properly documented with Swagger annotations:

#### **Controllers with JWT Authentication Required:**
1. ✅ **DomainController** - `@SecurityRequirement(name = "bearer-jwt")`
   - Tag: "Domain Management"
   - All endpoints documented with operations and responses

2. ✅ **StudentController** - `@SecurityRequirement(name = "bearer-jwt")`
   - Tag: "Student Management"
   - All endpoints documented

3. ✅ **AdmissionController** - `@SecurityRequirement(name = "bearer-jwt")`
   - Tag: "Student Admission"
   - Student admission endpoint documented

4. ✅ **StudentQueryController** - `@SecurityRequirement(name = "bearer-jwt")`
   - Tag: "Student Queries"
   - Query endpoints documented

5. ✅ **PhotoUploadController** - `@SecurityRequirement(name = "bearer-jwt")`
   - Tag: "Photo Upload"
   - Photo upload endpoint documented

#### **Public Controllers (No Authentication):**
6. ✅ **HealthController** - No security requirement
   - Tag: "Health & System"
   - Public endpoints for health checks and database initialization

7. ✅ **OAuthController** - No security requirement
   - Tag: "Authentication"
   - Public OAuth2 endpoints documented

---

## 🔐 JWT Authentication in Swagger

### **How It Works:**

1. **Security Scheme Defined:**
   - Type: HTTP Bearer
   - Format: JWT
   - Name: `bearer-jwt`

2. **Using JWT Token in Swagger UI:**
   - Click the **"Authorize"** button at the top of Swagger UI
   - Enter your JWT token (obtained from Google OAuth2 login)
   - Format: Just paste the token (without "Bearer" prefix - Swagger adds it automatically)
   - Click **"Authorize"** then **"Close"**

3. **Token Source:**
   - JWT tokens are obtained through Google OAuth2 authentication
   - After logging in via `/login`, tokens are stored in cookies/session
   - For Swagger testing, you may need to extract the token from browser dev tools

---

## 🚀 Accessing Swagger UI

### **Prerequisites:**
1. Backend server running on `http://localhost:8080`
2. Swagger UI is publicly accessible (no authentication needed to view)

### **Access URLs:**

- **Primary URL**: `http://localhost:8080/swagger-ui.html`
- **Alternative URLs**:
  - `http://localhost:8080/swagger-ui/index.html`
  - `http://localhost:8080/swagger-ui/`
- **API Docs JSON**: `http://localhost:8080/v3/api-docs`

---

## 📋 API Endpoints by Tag

### **1. Domain Management** 🔐 (Requires JWT)
- `GET /api/domains` - Get all domains
- `GET /api/domains/{domainId}` - Get domain by ID
- `POST /api/domains` - Create new domain
- `POST /api/domains/{domainId}/impact` - Check update impact
- `GET /api/domains/{domainId}/delete-impact` - Check delete impact
- `PATCH /api/domains/{domainId}` - Update domain
- `DELETE /api/domains/{domainId}` - Delete domain

### **2. Student Admission** 🔐 (Requires JWT)
- `POST /api/students/admit` - Admit new student

### **3. Student Management** 🔐 (Requires JWT)
- `GET /api/students/{studentId}` - Get student by ID
- `PATCH /api/students/{studentId}` - Update student
- `DELETE /api/students/{studentId}` - Delete student

### **4. Student Queries** 🔐 (Requires JWT)
- `GET /api/students` - Get all students
- `GET /api/students/domain/{domainId}` - Get students by domain

### **5. Photo Upload** 🔐 (Requires JWT)
- `POST /api/uploads/photo` - Upload student photo

### **6. Authentication** 🔓 (Public)
- `GET /login` - Redirect to Google OAuth2 login
- `GET /oauth2/callback` - OAuth2 callback handler
- `POST /signout` - Sign out current user
- `GET /api/auth/me` - Get current user info

### **7. Health & System** 🔓 (Public)
- `GET /api/health` - Health check
- `GET /api/test` - System status
- `POST /api/database/init` - Initialize database tables

---

## 🎨 Swagger UI Features

### **Configuration Settings:**
- ✅ **Operations sorted alphabetically** - Easy to find endpoints
- ✅ **Tags sorted alphabetically** - Organized by functionality
- ✅ **Filter enabled** - Search endpoints quickly
- ✅ **Request duration displayed** - See API response times
- ✅ **Models expand depth** - Better schema visualization

### **UI Enhancements:**
- Clean, organized interface
- Grouped by tags for easy navigation
- Interactive API testing
- Request/response examples
- Schema validation

---

## 🔑 Testing Secured Endpoints

### **Step-by-Step Guide:**

1. **Get JWT Token:**
   - Use the frontend to log in via Google OAuth2
   - Or use the `/login` endpoint to authenticate
   - Extract the JWT token from:
     - Browser cookies (id_token)
     - Network tab in DevTools
     - Session storage

2. **Authorize in Swagger:**
   - Open Swagger UI
   - Click **"Authorize"** button (lock icon)
   - In the "bearer-jwt" field, paste your JWT token
   - Click **"Authorize"** then **"Close"**

3. **Test Endpoints:**
   - All endpoints marked with 🔒 will now use your token
   - Test endpoints by clicking "Try it out"
   - View request/response details

4. **Clear Authorization:**
   - Click **"Authorize"** again
   - Click **"Logout"** to clear the token

---

## 📝 Best Practices

### **For Developers:**

1. **Always document new endpoints:**
   - Add `@Operation` annotation with summary and description
   - Add `@ApiResponses` for all possible responses
   - Include `@Parameter` for path/query parameters
   - Use `@Schema` annotations in DTOs

2. **Security Requirements:**
   - Add `@SecurityRequirement(name = "bearer-jwt")` to controllers that need authentication
   - Omit security requirement for public endpoints

3. **DTO Documentation:**
   - Use `@Schema` annotations on DTO fields
   - Include descriptions and examples
   - Specify required fields

---

## 🛠️ Configuration Files

### **Files Modified:**
- ✅ `backend/src/main/java/com/academic/erp/backend/config/SwaggerConfig.java`
- ✅ `backend/src/main/resources/application.properties`
- ✅ All controller files (annotations added)
- ✅ All DTO files (schema annotations)

---

## 📖 Additional Resources

- **SpringDoc OpenAPI Documentation**: https://springdoc.org/
- **OpenAPI 3.0 Specification**: https://swagger.io/specification/

---

**Last Updated:** After comprehensive Swagger implementation with JWT authentication support

