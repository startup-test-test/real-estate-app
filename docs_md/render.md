New web service
Source Code
startup-test-test
/
real-estate-app
1m ago
Edit
Name
A unique name for your web service.
property-main

ProjectOptional
Add this web service to a project once it’s created.

Project

simulator
/
Environment

simulator
Language
Language

Python 3
Branch
The Git branch to build and deploy.
Branch

main
Region
Your services in the same region can communicate over a private network. You currently have services running in oregon.
Region Selector
Oregon (US West)
3 existing services

Deploy in a new region
Root DirectoryOptional
If set, Render runs commands from this directory instead of the repository root. Additionally, code changes outside of this directory do not trigger an auto-deploy. Most commonly used with a monorepo.
# Root Directory   backend/property-api
Build Command
Render runs this command to build your app before each deploy.
# Root Directory backend/property-api/ $
pip install -r requirements.txt
Start Command
Render runs this command to start your app with each deploy.
# Root Directory backend/property-api/ $
uvicorn app:app --host 0.0.0.0 --port $PORT
Instance Type
Instance type
For hobby projects

Free
$0/ month
512 MB (RAM)
0.1 CPU
For professional use
For more power and to get the most out of Render, we recommend using one of our paid instance types. All paid instances support:
Zero Downtime
SSH Access
Scaling
One-off jobs
Support for persistent disks

Starter
$7/ month
512 MB (RAM)
0.5 CPU

Standard
$25/ month
2 GB (RAM)
1 CPU

Pro
$85/ month
4 GB (RAM)
2 CPU

Pro Plus
$175/ month
8 GB (RAM)
4 CPU

Pro Max
$225/ month
16 GB (RAM)
4 CPU

Pro Ultra
$450/ month
32 GB (RAM)
8 CPU
Need a custom instance type? We support up to 512 GB RAM and 64 CPUs.

Environment Variables
Set environment-specific config and secrets (such as API keys), then read those values from your code. Learn more.
VITE_REAL_ESTATE_API_KEY
••••••••••••


Add Environment Variable

Add from .env