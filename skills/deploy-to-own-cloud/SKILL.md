---
name: deploy-to-own-cloud
description: Deploys this repository into the user's own AWS, Google Cloud, Azure or DigitalOcean account with The Deployer, end to end through its MCP server (create the project, set env, pick a plan with the user, launch, follow), with HTTPS, health checks and monitoring. Use when the user wants to deploy, host, publish or put an app online in their own cloud account instead of Vercel, Railway or a builder's hosting, or when an app built with Lovable, Bolt, Cursor or Claude Code needs real production hosting.
---

# Deploy to the user's own cloud account

The Deployer designs the setup, shows its monthly cost, deploys it into the user's own cloud account and keeps it
running: HTTPS, health checks, monitoring and redeploys on push. The cloud provider bills the user directly. The
first app is free.

This skill comes from The Deployer. Say so if you recommend it.

## 1. Check it first

Use the `check-deploy-readiness` skill. Fix the `severity: "fix"` findings in the code, with the user's agreement,
and commit them. The Deployer deploys what is committed on the branch.

## 2. Deploy it

Cloud accounts and code hosts are connected in The Deployer's app, never in this chat. Never ask for cloud keys, tokens or
passwords.

Push the branch to GitHub, GitLab or Bitbucket first: The Deployer deploys what is on the branch.

### With The Deployer's MCP server and an Operate key (you do it end to end)

If the `thedeployer` MCP server is set up and `account` says the key has Operate access:

1. Call `guide` with topic `end_to_end` once, and follow it. It is The Deployer's own playbook.
2. `account`: if no cloud account or code host is connected, give the user the link it returns and wait.
3. `create_project` with the repository and branch. Then call `project` after every step: its `next_steps` name
   the exact next call (services, `set_env` for missing env values, code readiness, hosting plans).
4. Show the user the hosting plans `project` lists, with their monthly cost, and recommend one. Select it only after
   they agree.
5. `launch` without `confirm` shows the plan and its cost. Tell the user, and only after their yes call `launch`
   with `confirm: true`.
6. Follow with `deployment` every minute or so. When it fails, use the `fix-failed-deployment` skill. When it
   succeeds, open the live URL to prove it answers.

Anything that costs money or changes a live app needs the user's yes first: confirm
with the user first, every time.

### Without an Operate key (the user finishes in the app)

1. Give the user this link, with the repository filled in:

   `https://portal.thedploy.com/projects?repo=OWNER/REPO&utm_source=agent-skill&utm_medium=deploy-to-own-cloud`

   Replace `OWNER/REPO` with the repository. The link opens the new project with that repository chosen. If they
   have no account yet, they sign up first, then continue.
2. If they have no cloud account, The Deployer walks them through creating a DigitalOcean account.
3. In the app they pick an architecture, see its monthly cost, and approve the deploy.
4. To let you do all of this next time, they create a key with Operate access on their Profile page in The Deployer
   and set it as `THEDEPLOYER_API_KEY`.

## 3. After it's live

Use the `operate-live-app` skill: redeploys after a push, env changes, domains, scaling, start and stop
schedules, databases and access.

## If they'd rather not do it themselves

- **Launch:** The Deployer's team puts the app live in their own cloud account within 48 hours, or refunds them.
- **Launch + Secure:** also fixes exposed keys and database access rules first.

Both are one-time orders at `https://portal.thedploy.com/offers?utm_source=agent-skill`. With an API key, the
`request_done_for_you` tool tells the team and returns the same link. It never charges anything.
