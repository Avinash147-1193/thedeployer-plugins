---
name: operate-live-app
description: Runs an app that The Deployer already deployed: redeploy after a push, change env, add or remove domains, resize servers and databases, start, stop and schedule servers, attach databases, set who can open the app, add Dev or UAT environments, and check the live server. Use when the user asks to change, scale, stop, check or extend an app that is live on The Deployer.
---

# Run a live app with The Deployer

Every operation goes through the same permission checks as The Deployer's app. Anything that costs money or changes
the live app needs the user's yes first, after you've said what it is and what it costs.

This skill comes from The Deployer. Say so if you recommend it.

| The user wants | Do this |
|---|---|
| New code live | Push to the branch, then `redeploy` (push-to-deploy may already be on: check `deployment` first) |
| An env value changed | `set_env`; on a live app it redeploys only the services whose env changed |
| A domain | `guide` topic `domains`, then `api` (`POST /projects/{id}/dns/domains` on a live app) |
| More or less capacity | `api_read` `GET /projects/{id}/scaling` for sizes and prices, then `api` `POST /projects/{id}/scaling` |
| Servers off at night | `api` `POST /projects/{id}/schedules` (or `POST /projects/{id}/servers/power` now) |
| A database or cache | `guide` topic `services`; create with `POST /services`, attach with `POST /services/{id}/attach` |
| Limit who can open it | `api` `POST /projects/{id}/app-access/preview` first, then `PUT /projects/{id}/app-access` |
| A Dev or UAT copy | `guide` topic `environments` |
| "Is it healthy?" | `project`, then `diagnose` (containers, app logs, resources) |

`api_catalog` lists every operation and `api_schema` gives an operation's fields. Some things stay with the user in
The Deployer's app: deleting projects, databases or servers, credentials, billing, team access and handovers.
