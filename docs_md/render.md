Web Service
property-main
Python 3
Starter

Connect

Manual Deploy
Service ID:
srv-d3ade5ur433s73d848p0

startup-test-test / real-estate-app
main
https://property-main.onrender.com

Settings
General
Name
A unique name for your Web Service.
property-main

Edit
Region
Your services in the same region can communicate over a private network.
Oregon (US West)
Instance Type
Starter
0.5 CPU
512 MB
Update
Build & Deploy
Repository
The repository used for your Web Service.
https://github.com/startup-test-test/real-estate-app

Edit
Branch
The Git branch to build and deploy.

main

Edit
Git Credentials
User providing the credentials to pull the repository.
togo@startup-marketing.co.jp (you)
Use My Credentials
Root DirectoryOptional
If set, Render runs commands from this directory instead of the repository root. Additionally, code changes outside of this directory do not trigger an auto-deploy. Most commonly used with a monorepo.
backend/property-api

Edit
Build Filters
Include or ignore specific paths in your repo when determining whether to trigger an auto-deploy. Paths are relative to your repo's root directory. Learn more.

Edit
Included Paths
Changes that match these paths will trigger a new build.


Add Included Path
Ignored Paths
Changes that match these paths will not trigger a new build.


Add Ignored Path
Build Command
Render runs this command to build your app before each deploy.
backend/property-api/ $
pip install -r requirements.txt

Edit
Pre-Deploy CommandOptional
Render runs this command before the start command. Useful for database migrations and static asset uploads.
backend/property-api/ $

Edit
Start Command
Render runs this command to start your app with each deploy.
backend/property-api/ $
uvicorn app:app --host 0.0.0.0 --port $PORT
Cancel
Save Changes
Auto-Deploy
By default, Render automatically deploys your service whenever you update its code or configuration. Disable to handle deploys manually. Learn more.

On Commit

Edit
Deploy Hook
Your private URL to trigger a deploy for this server. Remember to keep this a secret.
••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••



Regenerate hook
Custom Domains
You can point custom domains you own to this service. See DNS configuration instructions.

Add Custom Domain
Render Subdomain
If enabled, your service remains reachable at its onrender.com subdomain in addition to all custom domains. Disable to serve exclusively from custom domains.


enabled
Your service is reachable at https://property-main.onrender.com.
PR Previews
Pull Request Previews
Spin up temporary instances to test pull requests opened against the main branch of startup-test-test/real-estate-app. Choose Automatic to preview all PRs, or Manual for only PRs with [render preview] in their title. Pull Request Previews create a new instance for just this service. Use Preview Environments to clone a group of services for every PR.

Off

Edit
Edge Caching
Configure caching behavior for your service.
Edge Caching
If enabled, Render caches HTTP response data based on your web service's Cache-Control headers. This speeds up future requests and reduces service load. Learn more.

Edge Caching disabled
Requests will bypass the cache and be served directly from your app.
Notifications
Service Notifications
Set notifications to receive for your service. This setting will override your workspace's default settings.

Use workspace default (Only failure notifications)

Edit
Preview Environment Notifications
Configure notifications for preview environments and service previews.

Use account default (Disabled)

Edit
Health Checks
Health Check Path
Provide an HTTP endpoint path that Render messages periodically to monitor your service. Learn More.
/healthz

Edit
Maintenance Mode
Maintenance Mode
Temporarily disable public access to your service. While enabled, Render serves a static maintenance page for all incoming requests. Learn more.


Maintenance Mode disabled
Custom Maintenance PageOptional
If provided, Render uses the specified URL for your maintenance page instead of serving the default page.