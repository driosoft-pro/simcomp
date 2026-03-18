# =============================================================================
# SIMCOMP — Vagrantfile
# Sistema de Comparendos de Tránsito
# Máquinas virtuales:
#   svr-dns  192.168.100.2  → DNS (BIND9) + dominio simcomp.co
#   svr-api  192.168.100.3  → Node.js x5 (puertos 3001-3005) + PostgreSQL x5
#   svr-web  192.168.100.4  → Nginx API Gateway JWT + Frontend React (build estático)
#
# Servicios en svr-api:
#   auth-service         :3001  usuarios_db
#   personas-service     :3002  personas_db
#   vehiculos-service    :3003  vehiculos_db
#   infracciones-service :3004  infracciones_db
#   comparendos-service  :3005  comparendos_db
# =============================================================================

Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/focal64"
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

dns.vm.provision "shell", run: "always" do |sh|
  sh.inline = <<-SHELL
    mkdir -p /home/vagrant/.ssh/vagrant_keys

    cp /vagrant/.vagrant/machines/svr-dns/virtualbox/private_key \
       /home/vagrant/.ssh/vagrant_keys/svr-dns.key

    chmod 600 /home/vagrant/.ssh/vagrant_keys/svr-dns.key
    chown vagrant:vagrant /home/vagrant/.ssh/vagrant_keys/svr-dns.key
  SHELL
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
  # auth-service :3001, personas :3002, vehiculos :3003,
  # infracciones :3004, comparendos :3005
  # ============================================================================
  config.vm.define "svr-api" do |api|
    api.vm.hostname = "svr-api"
    api.vm.network "private_network", ip: "192.168.100.3"

    api.vm.provider "virtualbox" do |vb|
      vb.name   = "SIMCOMP-API"
      vb.memory = 2048
      vb.cpus   = 2
    end

    api.vm.provision "shell", run: "always" do |sh|
      sh.inline = <<-SHELL
        mkdir -p /home/vagrant/.ssh/vagrant_keys
        cp /vagrant/.vagrant/machines/svr-api/virtualbox/private_key \
           /home/vagrant/.ssh/vagrant_keys/svr-api.key
        chmod 600 /home/vagrant/.ssh/vagrant_keys/svr-api.key
        chown vagrant:vagrant /home/vagrant/.ssh/vagrant_keys/svr-api.key
      SHELL
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
      vb.memory = 1024
      vb.cpus   = 1
    end

    web.vm.provision "shell", run: "always" do |sh|
      sh.inline = <<-SHELL
        mkdir -p /home/vagrant/.ssh/vagrant_keys
        cp /vagrant/.vagrant/machines/svr-web/virtualbox/private_key \
           /home/vagrant/.ssh/vagrant_keys/svr-web.key
        chmod 600 /home/vagrant/.ssh/vagrant_keys/svr-web.key
        chown vagrant:vagrant /home/vagrant/.ssh/vagrant_keys/svr-web.key
      SHELL
    end

    web.vm.provision "ansible_local" do |ansible|
      ansible.playbook       = "provisioning/site.yml"
      ansible.inventory_path = "provisioning/inventory/hosts.ini"
      ansible.limit          = "svr-web"
      ansible.verbose        = "v"
    end
  end

end