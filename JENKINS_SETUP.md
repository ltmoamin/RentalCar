# Jenkins Configuration Guide - RentalCar

## Credentials Setup

### 1. Git Credentials (credential-git)
**Type**: Username with password  
**Username**: moamina  
**Password**: Your GitHub personal access token  
**ID**: credential-git

### 2. Docker Hub Credentials (docker-hub-credentials)
**Type**: Username with password  
**Username**: moamina  
**Password**: Your Docker Hub token  
**ID**: docker-hub-credentials

---

## Jenkins Pipeline Configuration

### Repository Details
- **Git URL**: https://github.com/ltmoamin/RentalCar.git
- **Git Credentials ID**: credential-git
- **Docker Hub Username**: moamina
- **Docker Hub Credentials ID**: docker-hub-credentials

### Image Tags
- **Backend Image**: `moamina/rentalcar-backend:latest`
- **Frontend Image**: `moamina/rentalcar-frontend:latest`
- **Environment-specific**: `moamina/rentalcar-backend:dev-latest`, etc.

---

## Step-by-Step Setup in Jenkins

### Step 1: Create Git Credentials
1. Navigate to **Manage Jenkins** → **Manage Credentials**
2. Click **System** → **Global credentials**
3. Click **Add Credentials**
   - **Kind**: Username with password
   - **Username**: `moamina`
   - **Password**: `<your-github-token>`
   - **ID**: `credential-git`
   - **Description**: GitHub RentalCar Repository
4. Click **Create**

### Step 2: Create Docker Hub Credentials
1. Navigate to **Manage Jenkins** → **Manage Credentials**
2. Click **System** → **Global credentials**
3. Click **Add Credentials**
   - **Kind**: Username with password
   - **Username**: `moamina`
   - **Password**: `<your-docker-hub-token>`
   - **ID**: `docker-hub-credentials`
   - **Description**: Docker Hub moamina Account
4. Click **Create**

### Step 3: Create Pipeline Job
1. Go to Jenkins Dashboard → **New Item**
2. Enter job name: `RentalCar-Deploy-Pipeline`
3. Select **Pipeline**
4. Click **OK**

### Step 4: Configure Pipeline
**General**:
- Check **Discard old builds**
  - Max # of builds to keep: `10`
  - Max # of builds to keep with artifacts: `5`

**Build Triggers**:
- Check **GitHub hook trigger for GITscm polling**
  - OR Check **Poll SCM**: `H/15 * * * *` (every 15 minutes)

**Advanced Project Options**:
- Check **Use custom workspace**
- Directory: `/var/lib/jenkins/workspace/RentalCar-Deploy-Pipeline`

**Definition**:
- Select **Pipeline script from SCM**
- **SCM**: Select **Git**
  - **Repository URL**: `https://github.com/ltmoamin/RentalCar.git`
  - **Credentials**: Select `credential-git`
  - **Branch Specifier**: `*/main` (or your default branch)
  - **Script Path**: `Jenkinsfile`

**Pipeline**:
- Check **Lightweight checkout**

Click **Save**

### Step 5: Configure GitHub Webhook (Optional)
1. Go to GitHub repository settings
2. Navigate to **Settings** → **Webhooks**
3. Click **Add webhook**
   - **Payload URL**: `http://jenkins.example.com:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Select `Push events`
   - **Active**: Check
4. Click **Add webhook**

---

## Parameters Configuration

The pipeline supports these build parameters:

```groovy
string(name: 'GIT_BRANCH', defaultValue: 'main', description: 'Git branch to build')
choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'production'], description: 'Deployment environment')
booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip tests during build')
```

### Build with Parameters
1. Click on the job
2. Click **Build with Parameters**
3. Select:
   - **GIT_BRANCH**: main
   - **ENVIRONMENT**: dev (or staging/production)
   - **SKIP_TESTS**: false (or true)
4. Click **Build**

---

## Environment-Specific Configurations

### Development (dev)
- Image tag: `moamina/rentalcar-backend:dev-latest`
- Tests: **Enabled**
- SonarQube: **Enabled**
- Database: Development MySQL

### Staging
- Image tag: `moamina/rentalcar-backend:staging-latest`
- Tests: **Enabled**
- SonarQube: **Enabled**
- Database: Staging MySQL

### Production
- Image tag: `moamina/rentalcar-backend:latest`
- Tests: **Enabled**
- SonarQube: **Disabled**
- Database: Production MySQL

---

## Docker Hub Repository Setup

### Create Repositories
You need to create these repositories on Docker Hub:

1. **moamina/rentalcar-backend**
   - Description: Spring Boot Backend for RentalCar
   - Visibility: Public or Private

2. **moamina/rentalcar-frontend**
   - Description: Angular Frontend for RentalCar
   - Visibility: Public or Private

### Image Naming Convention
- `moamina/rentalcar-backend:BUILD_NUMBER-TIMESTAMP` (e.g., `25-20260128-143022`)
- `moamina/rentalcar-backend:dev-latest` (environment-specific)
- `moamina/rentalcar-backend:latest` (stable release)

### Same for Frontend
- `moamina/rentalcar-frontend:BUILD_NUMBER-TIMESTAMP`
- `moamina/rentalcar-frontend:dev-latest`
- `moamina/rentalcar-frontend:latest`

---

## Jenkins Environment Variables

The Jenkinsfile uses these environment variables:

```groovy
DOCKER_HUB_REPO = 'moamina'
BACKEND_IMAGE = 'moamina/rentalcar-backend'
FRONTEND_IMAGE = 'moamina/rentalcar-frontend'
GIT_CREDENTIALS = 'credential-git'
DOCKER_CREDENTIALS = 'docker-hub-credentials'
```

---

## Troubleshooting

### Git Clone Fails
- Verify **credential-git** is correct
- Check GitHub token hasn't expired
- Ensure GitHub SSH keys are configured

### Docker Push Fails
- Verify **docker-hub-credentials** is correct
- Check Docker Hub account and password
- Ensure Docker daemon is running
- Login manually: `docker login -u moamina`

### Build Fails
1. Check Jenkins logs: `/var/log/jenkins/jenkins.log`
2. Check job console output
3. Verify all required plugins are installed
4. Check system resources (disk space, memory)

### Credentials Not Found
- Ensure credentials ID matches exactly
- Check credentials are in correct scope (Global)
- Verify credentials haven't been deleted

---

## Security Best Practices

1. **Use Personal Access Tokens** instead of passwords for GitHub
2. **Use Docker Hub API Tokens** instead of account password
3. **Rotate tokens** regularly
4. **Don't commit credentials** to repository
5. **Use Jenkins Credentials Plugin** for all secrets
6. **Enable Jenkins security** with authentication and authorization
7. **Use HTTPS** for GitHub webhook (if public)
8. **Limit Jenkins user permissions** in Docker/system

---

## Additional Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [GitHub Authentication in Jenkins](https://www.jenkins.io/doc/book/using/authenticating-scripted-clients/)
- [Docker Hub Integration](https://docs.docker.com/docker-hub/)
- [RentalCar GitHub Repository](https://github.com/ltmoamin/RentalCar)

---

## Testing the Pipeline

### Trigger a Manual Build
1. Go to `RentalCar-Deploy-Pipeline` job
2. Click **Build with Parameters**
3. Select `ENVIRONMENT: dev`
4. Click **Build**

### Monitor Build Progress
1. Click on the build number
2. Click **Console Output**
3. Watch real-time logs

### Expected Output
```
✓ Checkout from GitHub
✓ Build backend with Maven
✓ Build frontend with npm
✓ Build Docker images
✓ Push to Docker Hub
✓ Deploy with Docker Compose
✓ Health checks pass
```

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Maintainer**: Your Team
