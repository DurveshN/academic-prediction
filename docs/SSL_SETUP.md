# SSL Setup Guide

This guide walks through configuring Nginx as a reverse proxy with SSL/TLS certificates from Let's Encrypt for the Academic Performance Prediction System.

---

## Prerequisites

Before starting, complete:

- [AWS_SETUP.md](AWS_SETUP.md) — IAM, security groups, RDS
- [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md) — EC2 instance running with Docker
- A registered domain name (or use Elastic IP with self-signed cert for dev)

---

## 1. Install Nginx

SSH into your EC2 instance and install Nginx:

```bash
sudo apt update
sudo apt install -y nginx
```

Verify Nginx is running:

```bash
sudo systemctl status nginx
```

You should see `active (running)`.

---

## 2. Configure Nginx

### 2.1 Copy the nginx configuration template

The repository includes a production-ready Nginx config at `nginx/nginx.conf`. Copy it to the Nginx configuration directory:

```bash
sudo cp ~/app/nginx/nginx.conf /etc/nginx/sites-available/academic-prediction
sudo ln -s /etc/nginx/sites-available/academic-prediction /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

### 2.2 Update the configuration with your domain

Edit the config file:

```bash
sudo nano /etc/nginx/sites-available/academic-prediction
```

Replace `yourdomain.com` with your actual domain name (or Elastic IP for development).

### 2.3 Test the configuration

```bash
sudo nginx -t
```

If you see `syntax is ok` and `test is successful`, reload Nginx:

```bash
sudo systemctl reload nginx
```

---

## 3. Obtain SSL Certificate (Let's Encrypt)

### 3.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3.2 Obtain certificate

```bash
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts:
- Enter your email address
- Agree to the terms of service
- Choose whether to share your email with the EFF
- Certbot will automatically update the Nginx config with SSL settings

### 3.3 Verify auto-renewal

Let's Encrypt certificates expire every 90 days. Test the auto-renewal process:

```bash
sudo certbot renew --dry-run
```

If successful, Certbot will automatically renew certificates before they expire.

### 3.4 Set up auto-renewal cron job (if not already configured)

Certbot usually installs a systemd timer or cron job automatically. Verify it exists:

```bash
sudo systemctl status certbot.timer
```

If not active, create a cron job:

```bash
sudo crontab -e
```

Add this line:

```
0 3 * * * /usr/bin/certbot renew --quiet --nginx
```

This runs the renewal check daily at 3:00 AM.

---

## 4. Verify HTTPS

### 4.1 Test HTTP redirect

```bash
curl -I http://yourdomain.com
```

You should see a `301 Moved Permanently` redirect to HTTPS.

### 4.2 Test HTTPS

```bash
curl -I https://yourdomain.com
```

You should see `200 OK`.

### 4.3 Test backend health endpoint

```bash
curl https://yourdomain.com/health
```

You should see `{"status":"ok"}`.

### 4.4 SSL Labs Test

Visit [https://www.ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/) and enter your domain. Aim for a rating of **B or higher**.

---

## 5. Security Headers

The Nginx configuration includes these security headers:

| Header | Purpose |
|--------|---------|
| `Strict-Transport-Security` (HSTS) | Forces HTTPS for 1 year |
| `X-Frame-Options` | Prevents clickjacking |
| `X-Content-Type-Options` | Prevents MIME sniffing |
| `Referrer-Policy` | Controls referrer information |

---

## 6. MLflow Route (Optional)

If you want to expose the MLflow UI, uncomment the `/mlflow` location block in `nginx/nginx.conf`.

**Security Warning**: MLflow UI has no built-in authentication. Only expose it if:
- You add HTTP Basic Auth in Nginx
- Or restrict access by IP address
- Or use a VPN

---

## 7. No Domain? Use Self-Signed Certificate (Dev Only)

If you don't have a domain name, you can use a self-signed certificate for development:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=YOUR_ELASTIC_IP"
```

Update `nginx/nginx.conf` to use these certificate paths instead of Let's Encrypt paths.

**Warning**: Browsers will show a security warning for self-signed certificates. This is acceptable for development only.

---

## 8. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| `nginx: [emerg] bind() to 0.0.0.0:80 failed` | Another service using port 80 | `sudo systemctl stop apache2` or identify process with `sudo lsof -i :80` |
| Certbot fails | Domain not pointing to EC2 | Verify DNS A record points to your Elastic IP |
| `502 Bad Gateway` | Backend not running | Check `docker ps` and backend logs |
| SSL Labs shows weak cipher | Default certbot config | Update ssl_ciphers in nginx.conf |
| Certificate not auto-renewing | Cron job missing | Add certbot cron job manually |

---

## Next Steps

- Configure environment variables and secrets — see Task 32
- Set up CloudWatch monitoring — see Task 32.5
