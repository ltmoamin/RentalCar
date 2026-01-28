#!/bin/bash

# RentalCar Deployment Setup Script
# This script automates the installation of Docker, Docker Compose, and Jenkins on Ubuntu

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║   RentalCar Application - Automated Setup Script        ║"
echo "╚════════════════════════════════════════════════════════╝"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Check OS
check_os() {
    print_step "Checking operating system..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if grep -qi ubuntu /etc/os-release; then
            print_success "Ubuntu detected"
            OS="ubuntu"
        elif grep -qi centos /etc/os-release; then
            print_success "CentOS detected"
            OS="centos"
        else
            print_error "Unsupported Linux distribution"
            exit 1
        fi
    else
        print_error "This script only supports Linux systems"
        exit 1
    fi
}

# Install Docker
install_docker() {
    print_step "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_warning "Docker already installed: $(docker --version)"
        return
    fi
    
    if [ "$OS" = "ubuntu" ]; then
        apt-get update
        apt-get install -y \
            apt-transport-https \
            ca-certificates \
            curl \
            gnupg \
            lsb-release
        
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io
    fi
    
    systemctl start docker
    systemctl enable docker
    print_success "Docker installed and started"
}

# Install Docker Compose
install_docker_compose() {
    print_step "Installing Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose already installed: $(docker-compose --version)"
        return
    fi
    
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
    
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed: $(docker-compose --version)"
}

# Install Java
install_java() {
    print_step "Installing Java..."
    
    if command -v java &> /dev/null; then
        print_warning "Java already installed: $(java -version 2>&1 | head -1)"
        return
    fi
    
    if [ "$OS" = "ubuntu" ]; then
        apt-get update
        apt-get install -y openjdk-17-jdk
    fi
    
    print_success "Java installed: $(java -version 2>&1 | head -1)"
}

# Install Node.js
install_nodejs() {
    print_step "Installing Node.js..."
    
    if command -v node &> /dev/null; then
        print_warning "Node.js already installed: $(node --version)"
        return
    fi
    
    if [ "$OS" = "ubuntu" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    print_success "Node.js installed: $(node --version)"
}

# Install Git
install_git() {
    print_step "Installing Git..."
    
    if command -v git &> /dev/null; then
        print_warning "Git already installed: $(git --version)"
        return
    fi
    
    if [ "$OS" = "ubuntu" ]; then
        apt-get update
        apt-get install -y git
    fi
    
    print_success "Git installed: $(git --version)"
}

# Install Jenkins
install_jenkins() {
    print_step "Installing Jenkins..."
    
    if command -v jenkins &> /dev/null || systemctl is-active --quiet jenkins; then
        print_warning "Jenkins already installed"
        return
    fi
    
    if [ "$OS" = "ubuntu" ]; then
        wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | apt-key add -
        sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
        apt-get update
        apt-get install -y jenkins
    fi
    
    systemctl start jenkins
    systemctl enable jenkins
    
    print_success "Jenkins installed and started"
}

# Setup Docker group
setup_docker_group() {
    print_step "Setting up Docker group..."
    
    if ! groups | grep &>/dev/null '\bdocker\b'; then
        usermod -aG docker $SUDO_USER 2>/dev/null || true
        usermod -aG docker jenkins 2>/dev/null || true
    fi
    
    print_success "Docker group setup completed"
}

# Create project directories
create_directories() {
    print_step "Creating project directories..."
    
    mkdir -p /opt/rentalcar
    mkdir -p /opt/rentalcar/backups
    
    print_success "Directories created"
}

# Summary
print_summary() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║        Installation Complete! ✓                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}Installed Components:${NC}"
    echo "  ✓ Docker: $(docker --version)"
    echo "  ✓ Docker Compose: $(docker-compose --version)"
    echo "  ✓ Java: $(java -version 2>&1 | head -1)"
    echo "  ✓ Node.js: $(node --version)"
    echo "  ✓ Git: $(git --version)"
    echo "  ✓ Jenkins: Available at http://localhost:8080"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Access Jenkins: http://localhost:8080"
    echo "  2. Get initial admin password:"
    echo "     cat /var/lib/jenkins/secrets/initialAdminPassword"
    echo "  3. Clone the RentalCar repository:"
    echo "     git clone https://github.com/your-repo/rentalcar.git"
    echo "  4. Follow DEPLOYMENT_GUIDE.md for next steps"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "  View Docker: docker ps"
    echo "  View Logs: docker logs -f <container>"
    echo "  Restart: systemctl restart docker jenkins"
    echo ""
}

# Main execution
main() {
    check_root
    check_os
    
    print_step "Starting installation..."
    
    install_docker
    install_docker_compose
    install_java
    install_nodejs
    install_git
    install_jenkins
    setup_docker_group
    create_directories
    
    print_summary
}

# Run main function
main
