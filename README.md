
# Archivepelago - Server

This is the back-end of Archivepelago, a project on the transmission and translation of notions of sexuality and gender by mapping networks of queer writers and artists.

## Server Requirements

Although not required, the server runs on Ubuntu 18.04 through [Digital Ocean](https://www.digitalocean.com/ "Digital Ocean"). The following code is targeted to Ubuntu 18.04 within a Digital Ocean droplet; if using a different operating system or service provider, please adjust accordingly.

### Basic Server setup

#### Node.js

The server requires Node.js v12. Follow the instructions below to set up the node environment, being sure to install the correct version of Node.js (12.x):

* [Install Node.js on Ubuntu 18.04:](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04 "Node.js on Ubuntu 18.04")
  ```bash
  cd ~
  curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
  sudo bash nodesource_setup.sh
  sudo apt install nodejs
  ``` 
* `cd` into archivepelago-server's main directory and run `npm install`
* Rename `.env-keys` to `.env`
* In your `.env` file, update `TOKEN_SECRET=CHANGE_ME` with a long series of random characters.
* In your `.env` file, update `AUTH_REALM=CHANGE_ME` with the realm used for which the api uses the login information (e.g. "Archivepelago Server API").

#### Neo4j

The server requires Neo4j v4.2 Enterprise. You can get a Neo4j enterprise license through their [startup program](https://neo4j.com/startup-program/ "Neo4j Startup Program").

Follow the instructions below to install Neo4j, being sure to install the correct version (4.2):
* [Install Neo4j:](https://neo4j.com/docs/operations-manual/current/installation/linux/debian/ "Neo4j")
  * Add OpenJDK's repository:
    ```bash
    sudo add-apt-repository -y ppa:openjdk-r/ppa
    sudo apt update
    ```
  * Add Neo4j's repository:
    ```bash
    wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
    echo 'deb https://debian.neo4j.com stable 4.3' | sudo tee -a /etc/apt/sources.list.d/neo4j.list
    sudo apt update
    ```
  * Enable `universe` repository
    ```bash
    sudo add-apt-repository universe
    ```
  * Install Neo4j Enterprise Edition:
     ```bash
     sudo apt-get install neo4j-enterprise=1:4.3.2
     ```
* Set Neo4j Password:
  ```bash
  cd /bin
  cypher-shell -d system
  ```
  * Enter `neo4j` as both the username and password; it should ask to update your password. Enter a new, secure password.
    * If it does not ask for a new password, you can set one by running the cypher query: `ALTER CURRENT USER SET PASSWORD FROM 'neo4j' TO 'new password';` (replacing 'new password' with a new, secure password).
  * `:exit` out of the cypher shell.
  * In your `.env` file, update the key `NEO4J_PWD=CHANGE_ME` to your new password.

* [Install the APOC Plugin:](http://https://neo4j.com/labs/apoc/4.1/installation/ "Install the APOC plugin")
  * Move or copy the APOC jar file from the `$NEO4J_HOME/labs` directory to the `$NEO4J_HOME/plugins` directory:
    ```bash
    sudo cp /var/lib/neo4j/labs/apoc-4.3.0.0-core.jar /var/lib/neo4j/plugins
     ```
  * Restart Neo4j:
    ```bash
    sudo service neo4j restart
    ```
 * Enable Neo4j on startup:
   ```bash
   sudo systemctl enable neo4j
   ```

#### Initialize Server

To initialize the server, `cd` into archivepelago-server's main directory and run `node server-init.js`.

### NGINX Reverse Proxy
Although not required, the deployment server uses NGINX as a reverse proxy to improve performance and security. Follow the instructions below for basic setup.

* [Default Install and Configuration of NGINX:](https://www.sitepoint.com/configuring-nginx-ssl-node-js/ "NGINX with Node.js")
  ```bash
  sudo apt update
  sudo apt install nginx
  ```
  * Create the NGINX server block file and open it with your preferred text editor (in this case nano). Be sure to replace `yourdomain.org` with your registered domain name:
    ```bash
    sudo touch /etc/nginx/sites-available/yourdomain.org
    sudo nano /etc/nginx/sites-available/yourdomain.org
    ```
  * Enter the following and save the file to create a `server` block (replace `3001` with the port number your node app uses if you've changed it; replace `yourdomain.org` with your registered domain name; replace `/var/www` with the directory where you want to host your static files):
    ```text
    upstream node_server{
      server localhost:3001;
    }

    server{
      listen 80;
      server_name yourdomain.org www.yourdomain.org;

      root /var/www;

      location / {
        try_files $uri @node_server;
      }

      location @node_server {
        proxy_pass http://node_server;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
      }
    }
    ```
   * Make sure there are no syntax errors in your NGINX files
     ```bash
     sudo nginx -t
     ```
   * Enable your site:
     ```bash
     sudo ln -s /etc/nginx/sites-available/yourdomain.org /etc/nginx/sites-enabled/
     ```
   * Restart NGINX
     ```bash
     sudo service nginx restart
     ```
### Security

Your deployment server should be secured with SSL. See [Securing NGINX With Let's Encrypt](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04 "NGINX Security") if using NGINX.

### PM2 Daemon Process Manager

The deployment server also uses PM2 to manage the node server process. Again, this is not required but recommended to help further manage and keep the server online. To install PM2, simply run `npm install pm2 -g`. To use PM2, `cd` into archivepelago-server's main directory and run `pm2 start index.js`.

## Open Source (GPLv3) License

    Copyright (C) 2020 Andrew M. Pankratz & Corey D Clawson

    This program is free software: you can redistribute it and/or modify it under the terms of the GNU General 
    Public License as published by the Free Software Foundation, either version 3 of the License, or (at your 
    option) any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
    
    See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

For questions or comments, please contact us at <admin@archivepelago.org>
