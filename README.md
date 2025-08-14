# 🎓 Student Portal - Full Stack Application

A comprehensive student portal system for managing assignments, submissions, and grading with GitHub integration and Google Docs verification.

## 🏗️ Architecture

- **Frontend:** React.js (Port 3000)
- **Backend:** Node.js + Express (Port 5000)
- **Flask API:** Python Flask for Google Docs processing (Port 5001)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** GitHub OAuth

## 🛠️ Prerequisites

- **Node.js** (v16+)
- **Python** (v3.8+)
- **PostgreSQL** (v12+)
- **Git**
- **GitHub OAuth App** (for authentication)
- **Google Service Account** (for Docs API)

## 📋 Installation & Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd Student_Portal-CLEAN
```

### 2. Database Setup

```bash
# Install PostgreSQL and create database
createdb autograder

# Or use Docker:
docker run --name postgres-dev -e POSTGRES_PASSWORD=1234 -e POSTGRES_DB=autograder -p 5433:5432 -d postgres
```

### 3. Backend Setup (Node.js)

```bash
cd server
npm install

# Create .env file:
cp .env.example .env
```

**Edit `server/.env`:**
```bash
DATABASE_URL="postgresql://postgres:1234@localhost:5433/autograder?schema=public"
PORT=5000
SESSION_SECRET="your-32-character-random-string-here"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
```

**Run database migrations:**
```bash
npx prisma generate
npx prisma db push
```

### 4. Frontend Setup (React)

```bash
cd client
npm install

# Create .env file:
cp .env.example .env
```

**Edit `client/.env`:**
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Flask API Setup (Python)

```bash
cd scripts/google-docs
pip install -r requirements.txt

# Create .env file:
cp .env.example .env
```

**Edit `scripts/google-docs/.env`:**
```bash
SERVICE_ACCOUNT_FILE=../../credentials/doc_reader_service_account.json
FLASK_PORT=5001
FLASK_DEBUG=True
GOOGLE_SCOPES=https://www.googleapis.com/auth/documents.readonly
```

### 6. GitHub OAuth Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App with:
   - **Application name:** Student Portal (Dev)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:5000/api/auth/github/callback`
3. Copy Client ID and Client Secret to `server/.env`

### 7. Google Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Docs API
4. Create Service Account with Docs API access
5. Download JSON key file
6. Place in `credentials/doc_reader_service_account.json`

## 🚀 Running the Application

### Development Mode
### Installation (Linux)

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and pip
sudo apt update
sudo apt install python3 python3-pip

# Install Git (if not installed)
sudo apt install git

# Verify installations
node --version
npm --version
python3 --version
pip3 --version

## Database Setup
# Option 1: PostgreSQL locally
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user and database
sudo -u postgres psql
CREATE USER postgres WITH PASSWORD '1234';
CREATE DATABASE autograder OWNER postgres;
GRANT ALL PRIVILEGES ON DATABASE autograder TO postgres;
\q

# Option 2: Use Docker for PostgreSQL
docker run --name postgres-dev -e POSTGRES_PASSWORD=1234 -e POSTGRES_DB=autograder -p 5433:5432 -d postgres:13

## On linux, run ./start.sh and windows start.bat


### Production Build

## 🌐 Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Flask API:** http://localhost:5001
- **Database:** localhost:5433

## 📁 Project Structure

```
Student_Portal-CLEAN/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                     # Node.js backend
│   ├── auth/
│   ├── controllers/
│   ├── routes/
│   ├── prisma/
│   └── package.json
├── scripts/
│   └── google-docs/           # Flask API
│       ├── docs_api.py
│       └── requirements.txt
└── credentials/               # Service account keys
```

## 🔧 Environment Variables

### Server (.env)
```bash
DATABASE_URL="postgresql://user:pass@localhost:5433/autograder"
PORT=5000
SESSION_SECRET=""
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Client (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### Flask API (.env)
```bash
SERVICE_ACCOUNT_FILE=../../credentials/doc_reader_service_account.json
FLASK_PORT=5001
FLASK_DEBUG=True
GOOGLE_SCOPES=https://www.googleapis.com/auth/documents.readonly
```

## 🧪 Testing
## CURRENTLY NOT WORKING

```bash
# Test backend
cd server
npm test

# Test frontend
cd client
npm test

# Test Flask API
cd scripts/google-docs
curl http://localhost:5001/test
```
## 📄 Setup


## 🚀 Deployment

### Recommended Deployment Stack:
- **Frontend:** Netlify
- **Backend:** Railway
- **Flask API:** Render
- **Database:** Railway PostgreSQL

### Environment Setup for Production:
1. Create production GitHub OAuth app
2. Set production environment variables
3. Upload Google Service Account to deployment platforms
4. Update callback URLs

## 🔒 Security Notes

- Never commit `.env` files
- Use strong secrets for SESSION_SECRET
- Keep Google Service Account keys secure
- Use different OAuth apps for dev/production
- Enable HTTPS in production

## 🛠️ Common Issues

### Database Connection Failed
```bash
# Check PostgreSQL is running:
pg_isready -h localhost -p 5433

# Reset database:
npx prisma db reset
```

### GitHub OAuth Not Working
- Check callback URL matches GitHub app settings
- Verify CLIENT_ID and CLIENT_SECRET are correct
- Clear browser cache/cookies

### Google Docs API Errors
- Verify service account file exists
- Check Google Cloud Console for API quotas
- Ensure proper scopes are set

## 📚 API Documentation

### Authentication Endpoints
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback
- `POST /api/logout` - Logout user

### Assignment Endpoints
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submission Endpoints
- `GET /api/submissions` - Get all submissions
- `POST /api/submissions` - Create submission

### Flask API Endpoints
- `GET /test` - Health check
- `POST /check-doc` - Verify Google Doc completion
- `GET /check-doc-title` - Validate document title

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.