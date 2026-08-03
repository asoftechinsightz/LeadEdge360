## Deploying via GitHub Actions — setup checklist

After pushing the code to GitHub, configure the repo for CI/CD:

### 1. Generate an SSH key just for CI (one-time)

```bash
# On your local machine:
ssh-keygen -t ed25519 -f ~/.ssh/asoftech_ci -N "" -C "github-actions"
# Add the public key to your VPS:
ssh-copy-id -i ~/.ssh/asoftech_ci.pub asoftech@<vps-ip>
# Copy the PRIVATE key contents — you'll paste this into GitHub:
cat ~/.ssh/asoftech_ci
```

### 2. Add GitHub Secrets

In your repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|---|---|
| `VPS_HOST`    | Your VPS IP or hostname |
| `VPS_USER`    | `asoftech` (or whatever non-root user you created) |
| `VPS_PORT`    | `22` (or your custom SSH port) |
| `VPS_SSH_KEY` | Contents of `~/.ssh/asoftech_ci` (the **private** key) |
| `PUBLIC_URL`  | `https://app.asoftechinsightz.com` |

### 3. Initial server setup (run once)

On the VPS, ensure `/opt/asoftech-insightz` is a git clone of the repo and the user has docker access:

```bash
sudo mkdir -p /opt/asoftech-insightz && sudo chown -R asoftech:asoftech /opt/asoftech-insightz
sudo usermod -aG docker asoftech
sudo -u asoftech git clone git@github.com:<you>/asoftech-insightz.git /opt/asoftech-insightz
# Make sure the VPS deploy user can run docker without sudo and edit /opt/asoftech-insightz without sudo
```

If the workflow's `sudo tee` step needs passwordless sudo, add this on the VPS:
```bash
sudo visudo
# Append:
asoftech ALL=(ALL) NOPASSWD: /usr/bin/tee /tmp/.env_overrides, /usr/bin/mv .env.new .env, /usr/bin/chmod 600 .env
```
(Or simply run the whole pipeline as a user who already has write access — simpler.)

### 4. Trigger your first deploy

```bash
git commit --allow-empty -m "ci: trigger first deploy"
git push
```

Watch the build at **github.com/<you>/asoftech-insightz/actions**. The smoke test at the end verifies `/api/` returns `{"ok":true}`.

### 5. Optional — deploy from a specific branch only

Edit `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    branches: [production]   # only deploy on push to `production`
```
