September 25, 2025 at 3:30 PM
live
add314d
fix: Force clean Render deployment with all dependencies - Add pip cache purge and --force-reinstall flags - Include all missing dependencies: matplotlib, seaborn, lxml, beautifulsoup4 - Ensure clean installation to resolve persistent openai import error 🤖 Generated with [Claude Code](https://claude.ai/code) Co-Authored-By: Claude <noreply@anthropic.com>

All logs
Search
Search

Live tail
GMT+9

Menu

==> Cloning from https://github.com/startup-test-test/real-estate-app
==> Checking out commit add314d494b2b3daeab6aa171c29a3ea510c38e9 in branch main
==> Installing Python version 3.11.9...
==> Using Python version 3.11.9 via /opt/render/project/src/.python-version
==> Docs on specifying a Python version: https://render.com/docs/python-version
==> Using Poetry version 2.1.3 (default)
==> Docs on specifying a Poetry version: https://render.com/docs/poetry-version
==> Running build command 'pip install -r requirements.txt'...
Collecting fastapi==0.99.1 (from -r requirements.txt (line 1))
  Downloading fastapi-0.99.1-py3-none-any.whl.metadata (23 kB)
Collecting uvicorn==0.23.2 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Downloading uvicorn-0.23.2-py3-none-any.whl.metadata (6.2 kB)
Collecting requests==2.31.0 (from -r requirements.txt (line 3))
  Downloading requests-2.31.0-py3-none-any.whl.metadata (4.6 kB)
Collecting python-dotenv==1.0.1 (from -r requirements.txt (line 4))
  Downloading python_dotenv-1.0.1-py3-none-any.whl.metadata (23 kB)
Collecting pydantic==1.10.13 (from -r requirements.txt (line 5))
  Downloading pydantic-1.10.13-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (149 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 149.6/149.6 kB 6.2 MB/s eta 0:00:00
Collecting aiohttp==3.9.1 (from -r requirements.txt (line 6))
  Downloading aiohttp-3.9.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (7.4 kB)
Collecting numpy==1.24.3 (from -r requirements.txt (line 7))
  Downloading numpy-1.24.3-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (5.6 kB)
Collecting pandas==2.0.3 (from -r requirements.txt (line 8))
  Downloading pandas-2.0.3-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (18 kB)
Collecting scikit-learn==1.3.0 (from -r requirements.txt (line 9))
  Downloading scikit_learn-1.3.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (11 kB)
Collecting scipy==1.11.1 (from -r requirements.txt (line 10))
  Downloading scipy-1.11.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (59 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 59.1/59.1 kB 5.6 MB/s eta 0:00:00
Collecting openai==1.12.0 (from -r requirements.txt (line 11))
  Downloading openai-1.12.0-py3-none-any.whl.metadata (18 kB)
Collecting matplotlib==3.7.2 (from -r requirements.txt (line 12))
  Downloading matplotlib-3.7.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (5.6 kB)
Collecting seaborn==0.12.2 (from -r requirements.txt (line 13))
  Downloading seaborn-0.12.2-py3-none-any.whl.metadata (5.4 kB)
Collecting lxml==4.9.3 (from -r requirements.txt (line 14))
  Downloading lxml-4.9.3-cp311-cp311-manylinux_2_28_x86_64.whl.metadata (3.8 kB)
Collecting beautifulsoup4==4.12.2 (from -r requirements.txt (line 15))
  Downloading beautifulsoup4-4.12.2-py3-none-any.whl.metadata (3.6 kB)
Collecting starlette<0.28.0,>=0.27.0 (from fastapi==0.99.1->-r requirements.txt (line 1))
  Downloading starlette-0.27.0-py3-none-any.whl.metadata (5.8 kB)
Collecting typing-extensions>=4.5.0 (from fastapi==0.99.1->-r requirements.txt (line 1))
  Downloading typing_extensions-4.15.0-py3-none-any.whl.metadata (3.3 kB)
Collecting click>=7.0 (from uvicorn==0.23.2->uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Downloading click-8.3.0-py3-none-any.whl.metadata (2.6 kB)
Collecting h11>=0.8 (from uvicorn==0.23.2->uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Downloading h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
Collecting charset-normalizer<4,>=2 (from requests==2.31.0->-r requirements.txt (line 3))
  Downloading charset_normalizer-3.4.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (36 kB)
Collecting idna<4,>=2.5 (from requests==2.31.0->-r requirements.txt (line 3))
  Downloading idna-3.10-py3-none-any.whl.metadata (10 kB)
Collecting urllib3<3,>=1.21.1 (from requests==2.31.0->-r requirements.txt (line 3))
  Downloading urllib3-2.5.0-py3-none-any.whl.metadata (6.5 kB)
Collecting certifi>=2017.4.17 (from requests==2.31.0->-r requirements.txt (line 3))
  Downloading certifi-2025.8.3-py3-none-any.whl.metadata (2.4 kB)
Collecting attrs>=17.3.0 (from aiohttp==3.9.1->-r requirements.txt (line 6))
  Downloading attrs-25.3.0-py3-none-any.whl.metadata (10 kB)
Collecting multidict<7.0,>=4.5 (from aiohttp==3.9.1->-r requirements.txt (line 6))
  Downloading multidict-6.6.4-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (5.3 kB)
Collecting yarl<2.0,>=1.0 (from aiohttp==3.9.1->-r requirements.txt (line 6))
  Downloading yarl-1.20.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (73 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 73.9/73.9 kB 7.0 MB/s eta 0:00:00
Collecting frozenlist>=1.1.1 (from aiohttp==3.9.1->-r requirements.txt (line 6))
  Downloading frozenlist-1.7.0-cp311-cp311-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (18 kB)
Collecting aiosignal>=1.1.2 (from aiohttp==3.9.1->-r requirements.txt (line 6))
  Downloading aiosignal-1.4.0-py3-none-any.whl.metadata (3.7 kB)
Collecting python-dateutil>=2.8.2 (from pandas==2.0.3->-r requirements.txt (line 8))
  Downloading python_dateutil-2.9.0.post0-py2.py3-none-any.whl.metadata (8.4 kB)
Collecting pytz>=2020.1 (from pandas==2.0.3->-r requirements.txt (line 8))
  Downloading pytz-2025.2-py2.py3-none-any.whl.metadata (22 kB)
Collecting tzdata>=2022.1 (from pandas==2.0.3->-r requirements.txt (line 8))
  Downloading tzdata-2025.2-py2.py3-none-any.whl.metadata (1.4 kB)
Collecting joblib>=1.1.1 (from scikit-learn==1.3.0->-r requirements.txt (line 9))
  Downloading joblib-1.5.2-py3-none-any.whl.metadata (5.6 kB)
Collecting threadpoolctl>=2.0.0 (from scikit-learn==1.3.0->-r requirements.txt (line 9))
  Downloading threadpoolctl-3.6.0-py3-none-any.whl.metadata (13 kB)
Collecting anyio<5,>=3.5.0 (from openai==1.12.0->-r requirements.txt (line 11))
  Downloading anyio-4.11.0-py3-none-any.whl.metadata (4.1 kB)
Collecting distro<2,>=1.7.0 (from openai==1.12.0->-r requirements.txt (line 11))
  Downloading distro-1.9.0-py3-none-any.whl.metadata (6.8 kB)
Collecting httpx<1,>=0.23.0 (from openai==1.12.0->-r requirements.txt (line 11))
  Downloading httpx-0.28.1-py3-none-any.whl.metadata (7.1 kB)
Collecting sniffio (from openai==1.12.0->-r requirements.txt (line 11))
  Downloading sniffio-1.3.1-py3-none-any.whl.metadata (3.9 kB)
Collecting tqdm>4 (from openai==1.12.0->-r requirements.txt (line 11))
  Downloading tqdm-4.67.1-py3-none-any.whl.metadata (57 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 57.7/57.7 kB 5.6 MB/s eta 0:00:00
Collecting contourpy>=1.0.1 (from matplotlib==3.7.2->-r requirements.txt (line 12))
  Downloading contourpy-1.3.3-cp311-cp311-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl.metadata (5.5 kB)
Collecting cycler>=0.10 (from matplotlib==3.7.2->-r requirements.txt (line 12))
  Downloading cycler-0.12.1-py3-none-any.whl.metadata (3.8 kB)
Collecting fonttools>=4.22.0 (from matplotlib==3.7.2->-r requirements.txt (line 12))
  Downloading fonttools-4.60.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (111 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 111.6/111.6 kB 11.2 MB/s eta 0:00:00
Collecting kiwisolver>=1.0.1 (from matplotlib==3.7.2->-r requirements.txt (line 12))
  Downloading kiwisolver-1.4.9-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (6.3 kB)
Collecting packaging>=20.0 (from matplotlib==3.7.2->-r requirements.txt (line 12))
  Downloading packaging-25.0-py3-none-any.whl.metadata (3.3 kB)
Collecting pillow>=6.2.0 (from matplotlib==3.7.2->-r requirements.txt (line 12))
  Downloading pillow-11.3.0-cp311-cp311-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl.metadata (9.0 kB)
Collecting pyparsing<3.1,>=2.3.1 (from matplotlib==3.7.2->-r requirements.txt (line 12))
  Downloading pyparsing-3.0.9-py3-none-any.whl.metadata (4.2 kB)
Collecting soupsieve>1.2 (from beautifulsoup4==4.12.2->-r requirements.txt (line 15))
  Downloading soupsieve-2.8-py3-none-any.whl.metadata (4.6 kB)
Collecting httptools>=0.5.0 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Downloading httptools-0.6.4-cp311-cp311-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (3.6 kB)
Collecting pyyaml>=5.1 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Downloading PyYAML-6.0.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (2.1 kB)
Collecting uvloop!=0.15.0,!=0.15.1,>=0.14.0 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Downloading uvloop-0.21.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (4.9 kB)
Collecting watchfiles>=0.13 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Downloading watchfiles-1.1.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (4.9 kB)
Collecting websockets>=10.4 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Downloading websockets-15.0.1-cp311-cp311-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (6.8 kB)
INFO: pip is looking at multiple versions of contourpy to determine which version is compatible with other requirements. This could take a while.
Collecting contourpy>=1.0.1 (from matplotlib==3.7.2->-r requirements.txt (line 12))
  Downloading contourpy-1.3.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (5.5 kB)
Collecting httpcore==1.* (from httpx<1,>=0.23.0->openai==1.12.0->-r requirements.txt (line 11))
  Downloading httpcore-1.0.9-py3-none-any.whl.metadata (21 kB)
Collecting six>=1.5 (from python-dateutil>=2.8.2->pandas==2.0.3->-r requirements.txt (line 8))
  Downloading six-1.17.0-py2.py3-none-any.whl.metadata (1.7 kB)
Collecting propcache>=0.2.1 (from yarl<2.0,>=1.0->aiohttp==3.9.1->-r requirements.txt (line 6))
  Downloading propcache-0.3.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (12 kB)
Downloading fastapi-0.99.1-py3-none-any.whl (58 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 58.4/58.4 kB 5.8 MB/s eta 0:00:00
Downloading uvicorn-0.23.2-py3-none-any.whl (59 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 59.5/59.5 kB 6.1 MB/s eta 0:00:00
Downloading requests-2.31.0-py3-none-any.whl (62 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 62.6/62.6 kB 6.2 MB/s eta 0:00:00
Downloading python_dotenv-1.0.1-py3-none-any.whl (19 kB)
Downloading pydantic-1.10.13-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (3.1 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 3.1/3.1 MB 75.8 MB/s eta 0:00:00
Downloading aiohttp-3.9.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (1.3 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.3/1.3 MB 70.0 MB/s eta 0:00:00
Downloading numpy-1.24.3-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (17.3 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 17.3/17.3 MB 114.3 MB/s eta 0:00:00
Downloading pandas-2.0.3-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (12.2 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 12.2/12.2 MB 131.6 MB/s eta 0:00:00
Downloading scikit_learn-1.3.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (10.9 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 10.9/10.9 MB 129.3 MB/s eta 0:00:00
Downloading scipy-1.11.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (36.2 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 36.2/36.2 MB 89.6 MB/s eta 0:00:00
Downloading openai-1.12.0-py3-none-any.whl (226 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 226.7/226.7 kB 17.5 MB/s eta 0:00:00
Downloading matplotlib-3.7.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (11.6 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 11.6/11.6 MB 135.0 MB/s eta 0:00:00
Downloading seaborn-0.12.2-py3-none-any.whl (293 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 293.3/293.3 kB 22.6 MB/s eta 0:00:00
Downloading lxml-4.9.3-cp311-cp311-manylinux_2_28_x86_64.whl (7.9 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 7.9/7.9 MB 129.7 MB/s eta 0:00:00
Downloading beautifulsoup4-4.12.2-py3-none-any.whl (142 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 143.0/143.0 kB 11.7 MB/s eta 0:00:00
Downloading aiosignal-1.4.0-py3-none-any.whl (7.5 kB)
Downloading anyio-4.11.0-py3-none-any.whl (109 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 109.1/109.1 kB 9.9 MB/s eta 0:00:00
Downloading attrs-25.3.0-py3-none-any.whl (63 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 63.8/63.8 kB 6.2 MB/s eta 0:00:00
Downloading certifi-2025.8.3-py3-none-any.whl (161 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 161.2/161.2 kB 15.1 MB/s eta 0:00:00
Downloading charset_normalizer-3.4.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (150 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 150.3/150.3 kB 12.8 MB/s eta 0:00:00
Downloading click-8.3.0-py3-none-any.whl (107 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 107.3/107.3 kB 10.5 MB/s eta 0:00:00
Downloading contourpy-1.3.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (326 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 326.2/326.2 kB 20.1 MB/s eta 0:00:00
Downloading cycler-0.12.1-py3-none-any.whl (8.3 kB)
Downloading distro-1.9.0-py3-none-any.whl (20 kB)
Downloading fonttools-4.60.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (5.0 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 5.0/5.0 MB 82.3 MB/s eta 0:00:00
Downloading frozenlist-1.7.0-cp311-cp311-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (235 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 235.3/235.3 kB 17.3 MB/s eta 0:00:00
Downloading h11-0.16.0-py3-none-any.whl (37 kB)
Downloading httptools-0.6.4-cp311-cp311-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (459 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 459.8/459.8 kB 33.9 MB/s eta 0:00:00
Downloading httpx-0.28.1-py3-none-any.whl (73 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 73.5/73.5 kB 6.5 MB/s eta 0:00:00
Downloading httpcore-1.0.9-py3-none-any.whl (78 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 78.8/78.8 kB 7.2 MB/s eta 0:00:00
Downloading idna-3.10-py3-none-any.whl (70 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 70.4/70.4 kB 6.6 MB/s eta 0:00:00
Downloading joblib-1.5.2-py3-none-any.whl (308 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 308.4/308.4 kB 25.7 MB/s eta 0:00:00
Downloading kiwisolver-1.4.9-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (1.4 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.4/1.4 MB 74.1 MB/s eta 0:00:00
Downloading multidict-6.6.4-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (246 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 246.7/246.7 kB 20.2 MB/s eta 0:00:00
Downloading packaging-25.0-py3-none-any.whl (66 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 66.5/66.5 kB 6.3 MB/s eta 0:00:00
Downloading pillow-11.3.0-cp311-cp311-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl (6.6 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 6.6/6.6 MB 106.3 MB/s eta 0:00:00
Downloading pyparsing-3.0.9-py3-none-any.whl (98 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 98.3/98.3 kB 8.8 MB/s eta 0:00:00
Downloading python_dateutil-2.9.0.post0-py2.py3-none-any.whl (229 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 229.9/229.9 kB 19.2 MB/s eta 0:00:00
Downloading pytz-2025.2-py2.py3-none-any.whl (509 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 509.2/509.2 kB 37.9 MB/s eta 0:00:00
Downloading PyYAML-6.0.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (762 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 763.0/763.0 kB 50.6 MB/s eta 0:00:00
Downloading sniffio-1.3.1-py3-none-any.whl (10 kB)
Downloading soupsieve-2.8-py3-none-any.whl (36 kB)
Downloading starlette-0.27.0-py3-none-any.whl (66 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 67.0/67.0 kB 6.6 MB/s eta 0:00:00
Downloading threadpoolctl-3.6.0-py3-none-any.whl (18 kB)
Downloading tqdm-4.67.1-py3-none-any.whl (78 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 78.5/78.5 kB 7.8 MB/s eta 0:00:00
Downloading typing_extensions-4.15.0-py3-none-any.whl (44 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 44.6/44.6 kB 3.8 MB/s eta 0:00:00
Downloading tzdata-2025.2-py2.py3-none-any.whl (347 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 347.8/347.8 kB 29.6 MB/s eta 0:00:00
Downloading urllib3-2.5.0-py3-none-any.whl (129 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 129.8/129.8 kB 13.1 MB/s eta 0:00:00
Downloading uvloop-0.21.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (4.0 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 4.0/4.0 MB 98.8 MB/s eta 0:00:00
Downloading watchfiles-1.1.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (453 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 453.1/453.1 kB 31.3 MB/s eta 0:00:00
Downloading websockets-15.0.1-cp311-cp311-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (182 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 182.3/182.3 kB 15.3 MB/s eta 0:00:00
Downloading yarl-1.20.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (348 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 349.0/349.0 kB 25.3 MB/s eta 0:00:00
Downloading propcache-0.3.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (213 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 213.5/213.5 kB 18.2 MB/s eta 0:00:00
Downloading six-1.17.0-py2.py3-none-any.whl (11 kB)
Installing collected packages: pytz, websockets, uvloop, urllib3, tzdata, typing-extensions, tqdm, threadpoolctl, soupsieve, sniffio, six, pyyaml, python-dotenv, pyparsing, propcache, pillow, packaging, numpy, multidict, lxml, kiwisolver, joblib, idna, httptools, h11, frozenlist, fonttools, distro, cycler, click, charset-normalizer, certifi, attrs, yarl, uvicorn, scipy, requests, python-dateutil, pydantic, httpcore, contourpy, beautifulsoup4, anyio, aiosignal, watchfiles, starlette, scikit-learn, pandas, matplotlib, httpx, aiohttp, seaborn, openai, fastapi
Successfully installed aiohttp-3.9.1 aiosignal-1.4.0 anyio-4.11.0 attrs-25.3.0 beautifulsoup4-4.12.2 certifi-2025.8.3 charset-normalizer-3.4.3 click-8.3.0 contourpy-1.3.2 cycler-0.12.1 distro-1.9.0 fastapi-0.99.1 fonttools-4.60.0 frozenlist-1.7.0 h11-0.16.0 httpcore-1.0.9 httptools-0.6.4 httpx-0.28.1 idna-3.10 joblib-1.5.2 kiwisolver-1.4.9 lxml-4.9.3 matplotlib-3.7.2 multidict-6.6.4 numpy-1.24.3 openai-1.12.0 packaging-25.0 pandas-2.0.3 pillow-11.3.0 propcache-0.3.2 pydantic-1.10.13 pyparsing-3.0.9 python-dateutil-2.9.0.post0 python-dotenv-1.0.1 pytz-2025.2 pyyaml-6.0.2 requests-2.31.0 scikit-learn-1.3.0 scipy-1.11.1 seaborn-0.12.2 six-1.17.0 sniffio-1.3.1 soupsieve-2.8 starlette-0.27.0 threadpoolctl-3.6.0 tqdm-4.67.1 typing-extensions-4.15.0 tzdata-2025.2 urllib3-2.5.0 uvicorn-0.23.2 uvloop-0.21.0 watchfiles-1.1.0 websockets-15.0.1 yarl-1.20.1
[notice] A new release of pip is available: 24.0 -> 25.2
[notice] To update, run: pip install --upgrade pip
==> Uploading build...
==> Uploaded in 26.4s. Compression took 5.3s
==> Build successful 🎉
==> Deploying...
==> Running 'uvicorn app:app --host 0.0.0.0 --port $PORT'
2025-09-25 06:33:14,494 - app - INFO - RealEstateAPIClient initialized successfully
2025-09-25 06:33:14,494 - app - WARNING - OpenAI API key not configured
INFO:     Started server process [61]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000 (Press CTRL+C to quit)
INFO:     127.0.0.1:48654 - "HEAD / HTTP/1.1" 405 Method Not Allowed
==> Your service is live 🎉
==> 
==> ///////////////////////////////////////////////////////////
==> 
==> Available at your primary URL https://property-main.onrender.com
==> 
==> ///////////////////////////////////////////////////////////