# Quick Start Guide - RentalCar Docker Deployment

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Docker installed
- Docker Compose installed
- 8GB RAM minimum

### Step 1: Clone & Navigate
```bash
git clone https://github.com/your-repo/rentalcar.git
cd rentalcar
```

### Step 2: Setup Environment
```bash
cp .env.example .env
# Edit .env if needed
```

### Step 3: Start Services
```bash
docker-compose up -d
```

### Step 4: Verify Deployment
```bash
# Check all services are running
docker-compose ps

# Check backend health
curl http://localhost:8082/actuator/health

# Check frontend
curl http://localhost
```

### Step 5: Access Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8082
- **Database**: localhost:3306 (MySQL)

---

## 📋 Common Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Rebuild images
docker-compose build --no-cache

# Execute command in container
docker-compose exec backend sh

# View running containers
docker ps

# View all containers
docker ps -a

# Remove all stopped containers
docker container prune

# View volumes
docker volume ls

# Backup database
docker exec rentalcar-mysql mysqldump -u rentalcar -p rentalcar_db > backup.sql
```

---

## 🔧 Environment Variables

Edit `.env` file to customize:

```properties
# Database
DB_NAME=rentalcar_db
DB_USER=rentalcar
DB_PASSWORD=your_password

# Backend
JWT_SECRET=your_secret_key
JWT_EXPIRATION=86400000

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
FRONTEND_PORT=80
BACKEND_PORT=8082
```

---

## 🐛 Troubleshooting

### Containers not starting?
```bash
docker-compose logs
docker-compose ps
```

### Port already in use?
```bash
sudo lsof -i :80
sudo kill -9 <PID>
```

### Database connection error?
```bash
docker exec -it rentalcar-mysql mysql -u rentalcar -p
SHOW DATABASES;
USE rentalcar_db;
SHOW TABLES;
```

### Need to reset everything?
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📊 Monitoring

```bash
# Real-time container stats
docker stats

# View disk usage
docker system df

# View container processes
docker top rentalcar-backend

# View container logs with timestamps
docker logs -f --timestamps rentalcar-backend
```

---

## 🔐 Security Tips

1. **Change default passwords** in `.env`
2. **Use strong JWT secret** (minimum 256 characters)
3. **Keep Docker updated**: `docker system upgrade`
4. **Set resource limits** for containers
5. **Use private registries** for sensitive images
6. **Regular backups**: `docker exec rentalcar-mysql mysqldump -u rentalcar -p rentalcar_db > backup.sql`

---

## 📞 Need Help?

1. Check logs: `docker-compose logs`
2. Verify services: `docker-compose ps`
3. Check health endpoints: `curl http://localhost:8082/actuator/health`
4. Review DEPLOYMENT_GUIDE.md for detailed instructions

---

**Version**: 1.0  
**Last Updated**: January 2026
