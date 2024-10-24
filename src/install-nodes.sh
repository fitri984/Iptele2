#!/bin/bash

# Color Definitions
BLUE='\033[0;34m'       
GREEN='\033[0;32m'
NC='\033[0m'

# Create Node Function
create_node() {
  echo -e "                                                       "
  echo -e "${BLUE}[+] =============================================== [+]${NC}"
  echo -e "${BLUE}[+]                    CREATE NODE                 [+]${NC}"
  echo -e "${BLUE}[+] =============================================== [+]${NC}"
  echo -e "                                                       "

  # Minta input dari pengguna
  read -p "Masukkan nama lokasi: " location_name
  read -p "Masukkan deskripsi lokasi: " location_description
  read -p "Masukkan domain: " domain
  read -p "Masukkan nama node: " node_name
  read -p "Masukkan RAM (dalam MB): " ram
  read -p "Masukkan jumlah maksimum disk space (dalam MB): " disk_space
  read -p "Masukkan Locid: " locid

  # Ubah ke direktori pterodactyl
  cd /var/www/pterodactyl || { echo "Direktori tidak ditemukan"; exit 1; }

  # Membuat lokasi baru
  php artisan p:location:make <<EOF
$location_name
$location_description
EOF

  # Membuat node baru
  php artisan p:node:make <<EOF
$node_name
$location_description
$locid
https
$domain
yes
no
no
$ram
$ram
$disk_space
$disk_space
100
8080
2022
/var/lib/pterodactyl/volumes
EOF

  echo -e "                                                       "
  echo -e "${GREEN}[+] =============================================== [+]${NC}"
  echo -e "${GREEN}[+]          CREATE NODE & LOCATION SUCCESS        [+]${NC}"
  echo -e "${GREEN}[+] =============================================== [+]${NC}"
  echo -e "                                                       "
}

# Call the create_node function
create_node
