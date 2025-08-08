#!/bin/bash

# 1. Подключение к виртуальной машине
YC_VM_IP="ваш_ip_виртуальной_машины"
SSH_USER="yc-user"

# 2. Копирование файлов
scp -r . ${SSH_USER}@${YC_VM_IP}:~/quantum-invest

# 3. Выполнение команд на сервере
ssh ${SSH_USER}@${YC_VM_IP} << 'EOF'
  cd ~/quantum-invest
  echo "DB_USER=postgres" > .env
  echo "DB_PASSWORD=strongpassword" >> .env
  echo "DB_NAME=quantumdb" >> .env
  
  # Установка Docker
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose
  
  # Запуск приложения
  sudo docker-compose up -d --build
EOF
