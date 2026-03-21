# =============================================================================
# SIMCOMP — Vagrantfile
# Sistema de Comparendos de Tránsito
# Máquinas virtuales:
#   srv-simcomp-dns  192.168.100.2  → DNS (BIND9) + dominio simcomp.co
#   srv-simcomp-api  192.168.100.3  → Backend Node.js (8001-8005) + PostgreSQL (5432-5436)
#   srv-simcomp-web  192.168.100.4  → Nginx API Gateway (8001-8005) + React SPA (Puerto 80)
#
# Servicios en srv-simcomp-api:
#   ms-auth-service      :8001 (DB :5432)
#   ms-personas          :8002 (DB :5433)
#   ms-automotores       :8003 (DB :5434)
#   ms-infracciones      :8004 (DB :5435)
#   ms-comparendos       :8005 (DB :5436)
# =============================================================================


Vagrant.configure("2") do |config|

  config.vm.box = "generic/ubuntu2204"
  config.vm.box_check_update = false
  config.vm.synced_folder ".", "/vagrant", disabled: false

  # ============================================================================
  # SVR-DNS — 192.168.100.2
  # BIND9, zona simcomp.co, forwarders a 8.8.8.8
  # ============================================================================
  config.vm.define "svr-dns" do |dns|
    dns.vm.hostname = "svr-dns"
    dns.vm.network "private_network", ip: "192.168.100.2"

    dns.vm.provider "virtualbox" do |vb|
      vb.name   = "SIMCOMP-DNS"
      vb.memory = 1024
      vb.cpus   = 1
    end

    dns.vm.provider "libvirt" do |lv|
      lv.memory = 1024
      lv.cpus   = 1
    end

    dns.vm.provision "ansible_local" do |ansible|
      ansible.playbook       = "provisioning/site.yml"
      ansible.inventory_path = "provisioning/inventory/hosts.ini"
      ansible.limit          = "svr-dns"
      ansible.verbose        = "v"
      
    end
  end

  # ============================================================================
  # SVR-API — 192.168.100.3
  # PostgreSQL x5 dbs, Node.js 20, 5 microservicios con PM2
  # auth-service :8001, personas :8002, vehiculos :8003,
  # infracciones :8004, comparendos :8005
  # ============================================================================
  config.vm.define "svr-api" do |api|
    api.vm.hostname = "svr-api"
    api.vm.network "private_network", ip: "192.168.100.3"

    api.vm.provider "virtualbox" do |vb|
      vb.name   = "SIMCOMP-API"
      vb.memory = 4096
      vb.cpus   = 2
    end

    api.vm.provider "libvirt" do |lv|
      lv.memory = 4096
      lv.cpus   = 2
    end

    api.vm.provision "ansible_local" do |ansible|
      ansible.playbook       = "provisioning/site.yml"
      ansible.inventory_path = "provisioning/inventory/hosts.ini"
      ansible.limit          = "svr-api"
      ansible.verbose        = "v"
    end
  end

  # ============================================================================
  # SVR-WEB — 192.168.100.4
  # Nginx API Gateway con validación JWT + React SPA (build estático)
  # Rutas públicas:  /api/auth/*
  # Rutas protegidas: /api/personas /api/vehiculos /api/infracciones /api/comparendos
  # ============================================================================
  config.vm.define "svr-web" do |web|
    web.vm.hostname = "svr-web"
    web.vm.network "private_network", ip: "192.168.100.4"

    web.vm.provider "virtualbox" do |vb|
      vb.name   = "SIMCOMP-WEB"
      vb.memory = 2048
      vb.cpus   = 1
    end

    web.vm.provider "libvirt" do |lv|
      lv.memory = 2048
      lv.cpus   = 1
    end

    web.vm.provision "ansible_local" do |ansible|
      ansible.playbook       = "provisioning/site.yml"
      ansible.inventory_path = "provisioning/inventory/hosts.ini"
      ansible.limit          = "svr-web"
      ansible.verbose        = "v"
    end
  end

end