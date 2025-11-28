# Academic ERP - Student Domain Management & Admissions (SDMA)

A full-stack student admission management system with Google OAuth authentication, built with React (TypeScript) and Spring Boot. This system manages academic domains/programs and student admissions with automatic roll number generation.

## 🚀 Features

- **Google OAuth 2.0 Authentication** - Secure server-side OAuth flow with JWT tokens
- **Domain Management** - Create, update, and manage academic domains/programs
- **Student Admission** - Add new students with automatic roll number generation
- **Student Management** - View, update, and manage student records
- **Automatic Roll Number Generation** - Smart roll number generation based on degree type, department, and join year
- **Cutoff Marks System** - Automatic student activation/deactivation based on exam marks vs domain cutoff
- **Photo Upload** - Store student photographs on filesystem (not as BLOBs)
- **Interactive API Documentation** - Swagger UI for API testing and documentation
- **Modern UI** - Beautiful, responsive design with Tailwind CSS and orange theme (#f4873e)

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+ and Maven
- **MySQL** 8.0+
- **Google OAuth Credentials** (Client ID and Secret)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/sivasomanath2502/academic_erp.git
cd academic_erp
```

### 2. Database Setup

#### Option A: Auto-Creation (Recommended for Development)
The backend will automatically create the database and tables on first run if configured with `createDatabaseIfNotExist=true`.

#### Option B: Manual Setup
1. Create MySQL database:
```sql
CREATE DATABASE erp_admission;
```

2. Run schema creation script (optional):
```bash
mysql -u root -p erp_admission < create_schema.sql
```

### 3. Backend Setup

#### Configure Database Connection
Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/erp_admission?createDatabaseIfNotExist=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

#### Configure Google OAuth
1. Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Set up OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:8080/oauth2/callback`
4. Set environment variables or update `application.properties`:
```properties
google.client-id=YOUR_CLIENT_ID
google.client-secret=YOUR_CLIENT_SECRET
```

**Note**: For security, use environment variables:
```bash
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret
```

#### Run Backend
```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

**Swagger UI**: Access API documentation at `http://localhost:8080/swagger-ui.html`

### 4. Frontend Setup

```bash
cd frontend/academic-erp-frotnend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 5. Environment Variables (Optional)

Create `.env` file in frontend directory:
```
VITE_API_BASE_URL=http://localhost:8080
```

## 📁 Project Structure

```
academic_erp/
├── backend/                          # Spring Boot backend
│   ├── src/main/java/
│   │   ├── com/academic/erp/backend/
│   │   │   ├── config/              # Configuration classes
│   │   │   ├── controller/          # REST controllers
│   │   │   ├── service/             # Business logic
│   │   │   ├── repository/          # Data access layer
│   │   │   ├── entity/              # JPA entities
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── exception/           # Exception handlers
│   │   │   └── filter/              # Security filters
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml                      # Maven dependencies
├── frontend/
│   └── academic-erp-frotnend/       # React frontend
│       ├── src/
│       │   ├── components/         # React components
│       │   ├── pages/               # Page components
│       │   ├── utils/               # Utilities and API client
│       │   ├── models/              # TypeScript interfaces
│       │   ├── context/             # React context providers
│       │   └── routes/              # Routing configuration
│       ├── public/                  # Static assets
│       └── package.json             # npm dependencies
├── create_schema.sql                # Database schema script
├── README.md                        # This file
├── SWAGGER_IMPLEMENTATION.md        # Swagger documentation guide
├── PROGRAM_NAME_REQUIREMENTS.md    # Program name format requirements
└── ROLL_NUMBER_GENERATION.md       # Roll number generation guide
```

## 🔐 Authentication Flow

1. User clicks "Sign in with Google" on welcome page
2. Redirected to Google OAuth consent screen
3. After authentication, Google redirects back to backend at `/oauth2/callback`
4. Backend validates token and sets HTTP-only cookie (`id_token`)
5. User redirected to domains list page (`/domains-list`)
6. All subsequent API requests include JWT token in Authorization header

## 📝 API Endpoints

### Public Endpoints (No Authentication Required)

- `GET /login` - Initiate Google OAuth login
- `GET /oauth2/callback` - OAuth callback handler
- `POST /signout` - Logout
- `GET /api/auth/me` - Get current user info
- `GET /api/health` - Health check
- `GET /api/test` - System status
- `POST /api/database/init` - Initialize database tables

### Protected Endpoints (Require JWT Authentication)

#### Domain Management
- `GET /api/domains` - List all domains
- `GET /api/domains/{domainId}` - Get domain by ID
- `POST /api/domains` - Create new domain
- `PATCH /api/domains/{domainId}` - Update domain
- `DELETE /api/domains/{domainId}` - Delete domain
- `POST /api/domains/{domainId}/impact` - Check update impact
- `GET /api/domains/{domainId}/delete-impact` - Check delete impact

#### Student Management
- `GET /api/students` - List all students
- `GET /api/students/{studentId}` - Get student by ID
- `GET /api/students/domain/{domainId}` - Get students by domain
- `POST /api/students/admit` - Admit new student
- `PATCH /api/students/{studentId}` - Update student
- `DELETE /api/students/{studentId}` - Delete student

#### Photo Upload
- `POST /api/uploads/photo` - Upload student photo (JPEG, PNG, GIF, WebP)

## 🎓 Roll Number Generation

Roll numbers are automatically generated when a student is admitted. The format is: `[PREFIX][YEAR][SEQUENCE]`

**Example:** `BT2024001`
- `BT` = Bachelor of Technology prefix
- `2024` = Join year
- `001` = Sequence number (first student in that department/year)

### Degree Type Prefixes
- **B.Tech** → `BT`
- **M.Tech** → `MT`
- **IM.Tech** → `IM`
- **M.Sc** → `MS`
- **Ph.D** → `PH`
- **Diploma** → `DP`
- **Unrecognized** → `RN` (fallback)

### Department Sequence Ranges
- **CSE**: 001-200
- **ECE**: 501-600
- **AIDS**: 701-800
- **Unrecognized**: 900-999 (fallback)

For detailed information, see [ROLL_NUMBER_GENERATION.md](ROLL_NUMBER_GENERATION.md)

## 📋 Program Name Requirements

Domain program names must include:
1. **A valid degree type**: B.Tech, M.Tech, IM.Tech, M.Sc, Ph.D, or Diploma
2. **A recognized department**: CSE, ECE, or AIDS

**Valid Examples:**
- "Bachelor of Technology in CSE"
- "B.Tech CSE"
- "Master of Technology in ECE"
- "M.Tech AIDS"
- "Diploma in Engineering"

For detailed requirements and examples, see [PROGRAM_NAME_REQUIREMENTS.md](PROGRAM_NAME_REQUIREMENTS.md)

## 📸 Photo Storage

Student photographs are stored on the **filesystem** (`uploads/photos/`), not as BLOBs in the database. Only the file path is stored in the database.

**Supported formats:** JPEG, PNG, GIF, WebP

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **HTTP-only cookies** - Token storage in secure cookies
- **Server-side token validation** - All tokens validated on backend
- **CORS protection** - Configured for specific origins
- **File upload validation** - Only image files accepted
- **Input validation** - DTO validation with Jakarta Validation
- **User-friendly error messages** - Clear error messages for all scenarios

## 📚 Documentation

- **[Swagger API Documentation](SWAGGER_IMPLEMENTATION.md)** - Complete guide to using Swagger UI
- **[Program Name Requirements](PROGRAM_NAME_REQUIREMENTS.md)** - Format requirements for domain program names
- **[Roll Number Generation](ROLL_NUMBER_GENERATION.md)** - Detailed roll number generation logic

## 🧪 Development

### Backend Development
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Development
```bash
cd frontend/academic-erp-frotnend
npm install
npm run dev
```

### Build for Production

**Frontend:**
```bash
cd frontend/academic-erp-frotnend
npm run build
```

**Backend:**
```bash
cd backend
mvn clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## 🎨 UI Features

- **Modern Design** - Clean, responsive interface with Tailwind CSS
- **Orange Theme** - Primary color: #f4873e
- **Interactive Modals** - Domain and student management modals
- **Sorting & Filtering** - Sort students by exam marks, filter by domain
- **Real-time Updates** - Automatic UI updates after operations
- **User Dropdown** - Hover and click interactions with auto-close
- **Responsive Layout** - Works on desktop and mobile devices

## ⚠️ Important Notes

1. **Secrets**: Never commit actual Google OAuth credentials. Use environment variables or `.env` files (which are in `.gitignore`)

2. **Database**: 
   - Ensure MySQL is running before starting the backend
   - Database and tables can be auto-created on first run
   - Use `create_schema.sql` for manual setup if needed

3. **CORS**: Currently configured for `localhost:5173`. Update for production

4. **Photo Storage**: The `uploads/` directory is in `.gitignore`. Create it manually if needed:
   ```bash
   mkdir -p backend/uploads/photos
   ```

5. **Swagger UI**: Access at `http://localhost:8080/swagger-ui.html` (no authentication required to view)

6. **Cutoff Marks**: When domain cutoff marks are updated, students' `isActive` status is automatically recalculated

## 🔧 Troubleshooting

### Backend won't start
- Check MySQL is running: `sudo systemctl status mysql`
- Verify database credentials in `application.properties`
- Check port 8080 is not in use: `lsof -i :8080`

### Frontend won't connect to backend
- Verify backend is running on `http://localhost:8080`
- Check CORS configuration in `SecurityConfig.java`
- Verify API base URL in frontend code

### Authentication issues
- Verify Google OAuth credentials are correct
- Check redirect URI matches: `http://localhost:8080/oauth2/callback`
- Clear browser cookies and try again

### Roll number generation errors
- Ensure program name includes valid degree type and department
- Check [PROGRAM_NAME_REQUIREMENTS.md](PROGRAM_NAME_REQUIREMENTS.md) for format requirements
- System will use fallback prefixes/ranges if format doesn't match

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Last Updated:** After comprehensive Swagger implementation and documentation cleanup
# Academic-ERP-SDMA-Student-Domain-Management-Admissions-
