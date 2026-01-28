# RentalCar Application - Docker & Jenkins Deployment Guide

## Overview
This guide provides step-by-step instructions to deploy the RentalCar Angular + Spring Boot application on a local virtual machine using Docker and Jenkins CI/CD pipeline.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Jenkins CI/CD Server                      │
│                   (Port 8080, 50000)                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                      │
├─────────────────┬──────────────┬──────────────────────────────┤
│  MySQL          │   Backend    │   Frontend (Nginx)           │
│  Port: 3306     │  Port: 8082  │   Port: 80                   │
│  Container:     │  Container:  │   Container:                 │
│  rentalcar-     │  rentalcar-  │   rentalcar-frontend         │
│  mysql          │  backend     │                              │
└─────────────────┴──────────────┴──────────────────────────────┘
```

---

## Prerequisites

### System Requirements
- **VM OS**: Linux (Ubuntu 20.04+ or CentOS 7+)
- **RAM**: Minimum 8GB (recommended 12GB+)
- **Storage**: Minimum 30GB free space
- **CPU**: 4 cores minimum

### Required Software
1. **Docker**: v20.10+
2. **Docker Compose**: v1.29+
3. **Java**: JDK 17+ (for local Maven builds)
4. **Node.js**: v20+ (for local npm builds)
5. **Git**: Latest version
6. **Jenkins**: v2.387+

---

## Step-by-Step Installation

### 1. Prepare Virtual Machine

#### 1.1 Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

#### 1.2 Install Docker
```bash
# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

#### 1.3 Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

#### 1.4 Install Java
```bash
sudo apt-get install -y openjdk-17-jdk

# Verify installation
java -version
```

#### 1.5 Install Node.js (Optional, for local frontend builds)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

#### 1.6 Install Git
```bash
sudo apt-get install -y git
git --version
```

### 2. Install Jenkins

#### 2.1 Add Jenkins Repository
```bash
# Add Jenkins GPG key
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -

# Add Jenkins repository
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'

# Update package lists
sudo apt-get update
```

#### 2.2 Install Jenkins
```bash
sudo apt-get install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### 2.3 Access Jenkins
- Open browser: `http://localhost:8080`
- Enter the initial admin password from above
- Install recommended plugins
- Create first admin user

### 3. Configure Jenkins

#### 3.1 Install Required Plugins
1. Go to **Manage Jenkins** → **Plugin Manager**
2. Install these plugins:
   - Git
   - GitHub
   - Docker
   - Docker Pipeline
   - Maven Integration
   - SonarQube Scanner
   - Email Extension
   - Blue Ocean (optional, for better UI)

#### 3.2 Configure Docker Credentials
1. Go to **Manage Jenkins** → **Manage Credentials**
2. Add credentials for Docker Registry (if using private registry)
3. Add credentials for Git repository

#### 3.3 Configure Maven
1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Configure Maven:
   - Name: `Maven 3.9.0`
   - MAVEN_HOME: Automatically install or specify path

#### 3.4 Configure System
1. Go to **Manage Jenkins** → **Configure System**
2. Set Jenkins URL: `http://your-vm-ip:8080`

### 4. Clone Repository

```bash
# Create a directory for projects
mkdir -p ~/jenkins-workspace
cd ~/jenkins-workspace

# Clone the RentalCar repository
git clone https://github.com/your-repo/rentalcar.git
cd rentalcar
```

### 5. Prepare Environment Variables

```bash
# Create .env file from example
cp .env.example .env.dev

# Edit .env file for your environment
nano .env.dev

# Update these values as needed:
# DB_PASSWORD=your_secure_password
# JWT_SECRET=your_long_secret_key
# CLOUDINARY credentials if using image upload
```

### 6. Setup Local Docker Registry (Optional)

```bash
# Run local Docker registry
docker run -d -p 5000:5000 --name registry registry:2

# Verify registry is running
curl http://localhost:5000/v2/
```

### 7. Create Jenkins Pipeline Job

#### 7.1 Create New Pipeline Job
1. Jenkins Dashboard → **New Item**
2. Enter job name: `RentalCar-Deploy`
3. Select **Pipeline**
4. Click **OK**

#### 7.2 Configure Pipeline
1. In **Definition**, select **Pipeline script from SCM**
2. Set **SCM** to **Git**
3. Enter Repository URL: `https://github.com/your-repo/rentalcar.git`
4. Set Branches: `*/main` (or your default branch)
5. Set Script Path: `Jenkinsfile`
6. Click **Save**

#### 7.3 Trigger Configuration
- Optionally enable **Poll SCM**: `H/15 * * * *` (every 15 minutes)
- Or enable **GitHub hook trigger** for real-time builds

---

## Deployment Instructions

### Option A: Manual Deployment with Docker Compose

#### A.1 Navigate to Project Directory
```bash
cd ~/jenkins-workspace/rentalcar
```

#### A.2 Prepare Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

#### A.3 Build Images (Optional)
```bash
# If not using pre-built images, build locally
docker-compose build
```

#### A.4 Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

#### A.5 Verify Deployment
```bash
# Check backend health
curl http://localhost:8082/actuator/health

# Check frontend
curl http://localhost/health

# View MySQL
docker exec -it rentalcar-mysql mysql -u rentalcar -p rentalcar_db
```

#### A.6 Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Option B: Jenkins Pipeline Deployment

#### B.1 Trigger Build
1. Go to Jenkins Dashboard
2. Click on `RentalCar-Deploy` job
3. Click **Build with Parameters**
4. Select environment: `dev` / `staging` / `production`
5. Click **Build**

#### B.2 Monitor Build
- Watch the build progress in real-time
- Check logs for any errors
- Verify service health after deployment

#### B.3 Access Application
- Frontend: `http://localhost` (or `http://your-vm-ip`)
- Backend API: `http://localhost:8082` (or `http://your-vm-ip:8082`)
- MySQL: `localhost:3306`

---

## Troubleshooting

### Docker Issues

#### Container won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild images
docker-compose build --no-cache

# Remove and recreate
docker-compose down
docker-compose up -d
```

#### Port already in use
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :8082
sudo lsof -i :3306

# Kill process
sudo kill -9 <PID>
```

#### Network connectivity issues
```bash
# Check network
docker network ls
docker network inspect rentalcar-network

# Test container connectivity
docker exec -it rentalcar-backend ping mysql
```

### Jenkins Issues

#### Jenkins won't start
```bash
# Check service status
sudo systemctl status jenkins

# View logs
sudo tail -100 /var/log/jenkins/jenkins.log

# Restart service
sudo systemctl restart jenkins
```

#### Permission issues
```bash
# Add user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins
```

#### Build fails with Docker errors
```bash
# Ensure Jenkins user can access Docker
sudo usermod -aG docker jenkins

# Check Docker daemon
sudo systemctl restart docker
```

### Database Issues

#### Cannot connect to MySQL
```bash
# Check if MySQL container is running
docker ps | grep mysql

# Test connection
docker exec -it rentalcar-mysql mysql -u rentalcar -p -e "SELECT 1"

# View database
docker exec -it rentalcar-mysql mysql -u rentalcar -p rentalcar_db -e "SHOW TABLES"
```

#### Database reset
```bash
# Stop services
docker-compose down

# Remove volume
docker volume rm rentalcar_mysql_data

# Restart services
docker-compose up -d
```

---

## Maintenance

### Backup Database
```bash
# Backup MySQL database
docker exec rentalcar-mysql mysqldump -u rentalcar -p rentalcar_db > backup.sql

# Restore from backup
docker exec -i rentalcar-mysql mysql -u rentalcar -p rentalcar_db < backup.sql
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Follow logs (real-time)
docker-compose logs -f backend
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### Monitor Resources
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Monitor containers
docker stats

# Check Docker system
docker system df
```

### Cleanup
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (use with caution)
docker system prune -a --volumes
```

---

## Useful Commands

```bash
# View all containers
docker ps -a

# View images
docker images

# View volumes
docker volume ls

# View networks
docker network ls

# Execute command in container
docker exec -it <container_name> <command>

# View container logs
docker logs -f <container_name>

# Inspect container
docker inspect <container_name>

# Copy file from container
docker cp <container_name>:/path/to/file ./local/path

# Copy file to container
docker cp ./local/path <container_name>:/path/to/file
```

---

## Security Considerations

1. **Change Default Passwords**: Update all default credentials in `.env`
2. **Use HTTPS**: Configure SSL/TLS for production
3. **Firewall Rules**: Restrict access to ports
4. **Secrets Management**: Use Docker secrets or external secret managers
5. **Regular Updates**: Keep Docker, Jenkins, and dependencies updated
6. **Backup Strategy**: Regular backups of database and configurations
7. **Access Control**: Limit Jenkins access with authentication
8. **Network Segmentation**: Use isolated networks for sensitive services

---

## Performance Tuning

### Docker
```bash
# Limit resource usage in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### MySQL
```bash
# Add environment variables in .env
MYSQL_MAX_CONNECTIONS=1000
```

### Nginx
- Enable gzip compression (already configured)
- Set appropriate buffer sizes
- Configure caching headers

---

## Additional Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Jenkins Documentation: https://www.jenkins.io/doc/
- Spring Boot with Docker: https://spring.io/guides/gs/spring-boot-docker/
- Angular Docker: https://angular.io/guide/build-for-docker

---

## Support & Contact

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review Jenkins console output
3. Check application health endpoints
4. Review system resources: `docker stats`

---

**Last Updated**: January 2026
**Version**: 1.0
