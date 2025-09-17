September 17, 2025 at 12:15 PM
live
15477a0
debug: 売却費用が同じになる問題の調査用ログ追加

All logs
Search
Search

Live tail
GMT+9

Menu

==> Downloading cache...
==> Cloning from https://github.com/startup-test-test/real-estate-app
==> Checking out commit 15477a0a23dab634f13828c08fdb40ef269eee40 in branch develop
==> Transferred 450MB in 10s. Extraction took 7s.
==> Using Python version 3.13.4 (default)
==> Docs on specifying a Python version: https://render.com/docs/python-version
==> Using Poetry version 2.1.3 (default)
==> Docs on specifying a Poetry version: https://render.com/docs/poetry-version
==> Running build command 'pip install -r requirements.txt'...
Collecting fastapi==0.99.1 (from -r requirements.txt (line 1))
  Using cached fastapi-0.99.1-py3-none-any.whl.metadata (23 kB)
Collecting uvicorn==0.23.2 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Using cached uvicorn-0.23.2-py3-none-any.whl.metadata (6.2 kB)
Collecting requests==2.31.0 (from -r requirements.txt (line 3))
  Using cached requests-2.31.0-py3-none-any.whl.metadata (4.6 kB)
Collecting python-dotenv==1.0.1 (from -r requirements.txt (line 4))
  Using cached python_dotenv-1.0.1-py3-none-any.whl.metadata (23 kB)
Collecting jinja2==3.1.2 (from -r requirements.txt (line 5))
  Using cached Jinja2-3.1.2-py3-none-any.whl.metadata (3.5 kB)
Collecting streamlit==1.41.0 (from -r requirements.txt (line 6))
  Using cached streamlit-1.41.0-py2.py3-none-any.whl.metadata (8.5 kB)
Collecting pandas==2.2.3 (from -r requirements.txt (line 7))
  Using cached pandas-2.2.3-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (89 kB)
Collecting matplotlib==3.9.0 (from -r requirements.txt (line 8))
  Using cached matplotlib-3.9.0-cp313-cp313-linux_x86_64.whl
Collecting pydantic!=1.8,!=1.8.1,<2.0.0,>=1.7.4 (from fastapi==0.99.1->-r requirements.txt (line 1))
  Using cached pydantic-1.10.23-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (154 kB)
Collecting starlette<0.28.0,>=0.27.0 (from fastapi==0.99.1->-r requirements.txt (line 1))
  Using cached starlette-0.27.0-py3-none-any.whl.metadata (5.8 kB)
Collecting typing-extensions>=4.5.0 (from fastapi==0.99.1->-r requirements.txt (line 1))
  Using cached typing_extensions-4.15.0-py3-none-any.whl.metadata (3.3 kB)
Collecting click>=7.0 (from uvicorn==0.23.2->uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Using cached click-8.2.1-py3-none-any.whl.metadata (2.5 kB)
Collecting h11>=0.8 (from uvicorn==0.23.2->uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Using cached h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
Collecting charset-normalizer<4,>=2 (from requests==2.31.0->-r requirements.txt (line 3))
  Using cached charset_normalizer-3.4.3-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (36 kB)
Collecting idna<4,>=2.5 (from requests==2.31.0->-r requirements.txt (line 3))
  Using cached idna-3.10-py3-none-any.whl.metadata (10 kB)
Collecting urllib3<3,>=1.21.1 (from requests==2.31.0->-r requirements.txt (line 3))
  Using cached urllib3-2.5.0-py3-none-any.whl.metadata (6.5 kB)
Collecting certifi>=2017.4.17 (from requests==2.31.0->-r requirements.txt (line 3))
  Using cached certifi-2025.8.3-py3-none-any.whl.metadata (2.4 kB)
Collecting MarkupSafe>=2.0 (from jinja2==3.1.2->-r requirements.txt (line 5))
  Using cached MarkupSafe-3.0.2-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (4.0 kB)
Collecting altair<6,>=4.0 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached altair-5.5.0-py3-none-any.whl.metadata (11 kB)
Collecting blinker<2,>=1.0.0 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached blinker-1.9.0-py3-none-any.whl.metadata (1.6 kB)
Collecting cachetools<6,>=4.0 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached cachetools-5.5.2-py3-none-any.whl.metadata (5.4 kB)
Collecting numpy<3,>=1.23 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached numpy-2.3.3-cp313-cp313-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl.metadata (62 kB)
Collecting packaging<25,>=20 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached packaging-24.2-py3-none-any.whl.metadata (3.2 kB)
Collecting pillow<12,>=7.1.0 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached pillow-11.3.0-cp313-cp313-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl.metadata (9.0 kB)
Collecting protobuf<6,>=3.20 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached protobuf-5.29.5-cp38-abi3-manylinux2014_x86_64.whl.metadata (592 bytes)
Collecting pyarrow>=7.0 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached pyarrow-21.0.0-cp313-cp313-manylinux_2_28_x86_64.whl.metadata (3.3 kB)
Collecting rich<14,>=10.14.0 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached rich-13.9.4-py3-none-any.whl.metadata (18 kB)
Collecting tenacity<10,>=8.1.0 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached tenacity-9.1.2-py3-none-any.whl.metadata (1.2 kB)
Collecting toml<2,>=0.10.1 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached toml-0.10.2-py2.py3-none-any.whl.metadata (7.1 kB)
Collecting watchdog<7,>=2.1.5 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached watchdog-6.0.0-py3-none-manylinux2014_x86_64.whl.metadata (44 kB)
Collecting gitpython!=3.1.19,<4,>=3.0.7 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached gitpython-3.1.45-py3-none-any.whl.metadata (13 kB)
Collecting pydeck<1,>=0.8.0b4 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached pydeck-0.9.1-py2.py3-none-any.whl.metadata (4.1 kB)
Collecting tornado<7,>=6.0.3 (from streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached tornado-6.5.2-cp39-abi3-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (2.8 kB)
Collecting python-dateutil>=2.8.2 (from pandas==2.2.3->-r requirements.txt (line 7))
  Using cached python_dateutil-2.9.0.post0-py2.py3-none-any.whl.metadata (8.4 kB)
Collecting pytz>=2020.1 (from pandas==2.2.3->-r requirements.txt (line 7))
  Using cached pytz-2025.2-py2.py3-none-any.whl.metadata (22 kB)
Collecting tzdata>=2022.7 (from pandas==2.2.3->-r requirements.txt (line 7))
  Using cached tzdata-2025.2-py2.py3-none-any.whl.metadata (1.4 kB)
Collecting contourpy>=1.0.1 (from matplotlib==3.9.0->-r requirements.txt (line 8))
  Using cached contourpy-1.3.3-cp313-cp313-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl.metadata (5.5 kB)
Collecting cycler>=0.10 (from matplotlib==3.9.0->-r requirements.txt (line 8))
  Using cached cycler-0.12.1-py3-none-any.whl.metadata (3.8 kB)
Collecting fonttools>=4.22.0 (from matplotlib==3.9.0->-r requirements.txt (line 8))
  Using cached fonttools-4.59.2-cp313-cp313-manylinux1_x86_64.manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_5_x86_64.whl.metadata (109 kB)
Collecting kiwisolver>=1.3.1 (from matplotlib==3.9.0->-r requirements.txt (line 8))
  Using cached kiwisolver-1.4.9-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (6.3 kB)
Collecting pyparsing>=2.3.1 (from matplotlib==3.9.0->-r requirements.txt (line 8))
  Using cached pyparsing-3.2.4-py3-none-any.whl.metadata (5.0 kB)
Collecting httptools>=0.5.0 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Using cached httptools-0.6.4-cp313-cp313-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (3.6 kB)
Collecting pyyaml>=5.1 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Using cached PyYAML-6.0.2-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (2.1 kB)
Collecting uvloop!=0.15.0,!=0.15.1,>=0.14.0 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Using cached uvloop-0.21.0-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (4.9 kB)
Collecting watchfiles>=0.13 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Using cached watchfiles-1.1.0-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (4.9 kB)
Collecting websockets>=10.4 (from uvicorn[standard]==0.23.2->-r requirements.txt (line 2))
  Using cached websockets-15.0.1-cp313-cp313-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (6.8 kB)
Collecting jsonschema>=3.0 (from altair<6,>=4.0->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached jsonschema-4.25.1-py3-none-any.whl.metadata (7.6 kB)
Collecting narwhals>=1.14.2 (from altair<6,>=4.0->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached narwhals-2.5.0-py3-none-any.whl.metadata (11 kB)
Collecting gitdb<5,>=4.0.1 (from gitpython!=3.1.19,<4,>=3.0.7->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached gitdb-4.0.12-py3-none-any.whl.metadata (1.2 kB)
Collecting smmap<6,>=3.0.1 (from gitdb<5,>=4.0.1->gitpython!=3.1.19,<4,>=3.0.7->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached smmap-5.0.2-py3-none-any.whl.metadata (4.3 kB)
Collecting markdown-it-py>=2.2.0 (from rich<14,>=10.14.0->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached markdown_it_py-4.0.0-py3-none-any.whl.metadata (7.3 kB)
Collecting pygments<3.0.0,>=2.13.0 (from rich<14,>=10.14.0->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached pygments-2.19.2-py3-none-any.whl.metadata (2.5 kB)
Collecting anyio<5,>=3.4.0 (from starlette<0.28.0,>=0.27.0->fastapi==0.99.1->-r requirements.txt (line 1))
  Using cached anyio-4.10.0-py3-none-any.whl.metadata (4.0 kB)
Collecting sniffio>=1.1 (from anyio<5,>=3.4.0->starlette<0.28.0,>=0.27.0->fastapi==0.99.1->-r requirements.txt (line 1))
  Using cached sniffio-1.3.1-py3-none-any.whl.metadata (3.9 kB)
Collecting attrs>=22.2.0 (from jsonschema>=3.0->altair<6,>=4.0->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached attrs-25.3.0-py3-none-any.whl.metadata (10 kB)
Collecting jsonschema-specifications>=2023.03.6 (from jsonschema>=3.0->altair<6,>=4.0->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached jsonschema_specifications-2025.9.1-py3-none-any.whl.metadata (2.9 kB)
Collecting referencing>=0.28.4 (from jsonschema>=3.0->altair<6,>=4.0->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached referencing-0.36.2-py3-none-any.whl.metadata (2.8 kB)
Collecting rpds-py>=0.7.1 (from jsonschema>=3.0->altair<6,>=4.0->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached rpds_py-0.27.1-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (4.2 kB)
Collecting mdurl~=0.1 (from markdown-it-py>=2.2.0->rich<14,>=10.14.0->streamlit==1.41.0->-r requirements.txt (line 6))
  Using cached mdurl-0.1.2-py3-none-any.whl.metadata (1.6 kB)
Collecting six>=1.5 (from python-dateutil>=2.8.2->pandas==2.2.3->-r requirements.txt (line 7))
  Using cached six-1.17.0-py2.py3-none-any.whl.metadata (1.7 kB)
Using cached fastapi-0.99.1-py3-none-any.whl (58 kB)
Using cached uvicorn-0.23.2-py3-none-any.whl (59 kB)
Using cached requests-2.31.0-py3-none-any.whl (62 kB)
Using cached python_dotenv-1.0.1-py3-none-any.whl (19 kB)
Using cached Jinja2-3.1.2-py3-none-any.whl (133 kB)
Using cached streamlit-1.41.0-py2.py3-none-any.whl (23.4 MB)
Using cached pandas-2.2.3-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (12.7 MB)
Using cached altair-5.5.0-py3-none-any.whl (731 kB)
Using cached blinker-1.9.0-py3-none-any.whl (8.5 kB)
Using cached cachetools-5.5.2-py3-none-any.whl (10 kB)
Using cached charset_normalizer-3.4.3-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (151 kB)
Using cached click-8.2.1-py3-none-any.whl (102 kB)
Using cached gitpython-3.1.45-py3-none-any.whl (208 kB)
Using cached gitdb-4.0.12-py3-none-any.whl (62 kB)
Using cached idna-3.10-py3-none-any.whl (70 kB)
Using cached numpy-2.3.3-cp313-cp313-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl (16.6 MB)
Using cached packaging-24.2-py3-none-any.whl (65 kB)
Using cached pillow-11.3.0-cp313-cp313-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl (6.6 MB)
Using cached protobuf-5.29.5-cp38-abi3-manylinux2014_x86_64.whl (319 kB)
Using cached pydantic-1.10.23-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (2.8 MB)
Using cached pydeck-0.9.1-py2.py3-none-any.whl (6.9 MB)
Using cached rich-13.9.4-py3-none-any.whl (242 kB)
Using cached pygments-2.19.2-py3-none-any.whl (1.2 MB)
Using cached smmap-5.0.2-py3-none-any.whl (24 kB)
Using cached starlette-0.27.0-py3-none-any.whl (66 kB)
Using cached anyio-4.10.0-py3-none-any.whl (107 kB)
Using cached tenacity-9.1.2-py3-none-any.whl (28 kB)
Using cached toml-0.10.2-py2.py3-none-any.whl (16 kB)
Using cached tornado-6.5.2-cp39-abi3-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (443 kB)
Using cached typing_extensions-4.15.0-py3-none-any.whl (44 kB)
Using cached urllib3-2.5.0-py3-none-any.whl (129 kB)
Using cached watchdog-6.0.0-py3-none-manylinux2014_x86_64.whl (79 kB)
Using cached certifi-2025.8.3-py3-none-any.whl (161 kB)
Using cached contourpy-1.3.3-cp313-cp313-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl (362 kB)
Using cached cycler-0.12.1-py3-none-any.whl (8.3 kB)
Using cached fonttools-4.59.2-cp313-cp313-manylinux1_x86_64.manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_5_x86_64.whl (4.9 MB)
Using cached h11-0.16.0-py3-none-any.whl (37 kB)
Using cached httptools-0.6.4-cp313-cp313-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (473 kB)
Using cached jsonschema-4.25.1-py3-none-any.whl (90 kB)
Using cached attrs-25.3.0-py3-none-any.whl (63 kB)
Using cached jsonschema_specifications-2025.9.1-py3-none-any.whl (18 kB)
Using cached kiwisolver-1.4.9-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (1.5 MB)
Using cached markdown_it_py-4.0.0-py3-none-any.whl (87 kB)
Using cached mdurl-0.1.2-py3-none-any.whl (10.0 kB)
Using cached MarkupSafe-3.0.2-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (23 kB)
Using cached narwhals-2.5.0-py3-none-any.whl (407 kB)
Using cached pyarrow-21.0.0-cp313-cp313-manylinux_2_28_x86_64.whl (42.8 MB)
Using cached pyparsing-3.2.4-py3-none-any.whl (113 kB)
Using cached python_dateutil-2.9.0.post0-py2.py3-none-any.whl (229 kB)
Using cached pytz-2025.2-py2.py3-none-any.whl (509 kB)
Using cached PyYAML-6.0.2-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (759 kB)
Using cached referencing-0.36.2-py3-none-any.whl (26 kB)
Using cached rpds_py-0.27.1-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (386 kB)
Using cached six-1.17.0-py2.py3-none-any.whl (11 kB)
Using cached sniffio-1.3.1-py3-none-any.whl (10 kB)
Using cached tzdata-2025.2-py2.py3-none-any.whl (347 kB)
Using cached uvloop-0.21.0-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (4.7 MB)
Using cached watchfiles-1.1.0-cp313-cp313-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (451 kB)
Using cached websockets-15.0.1-cp313-cp313-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (182 kB)
Installing collected packages: pytz, websockets, watchdog, uvloop, urllib3, tzdata, typing-extensions, tornado, toml, tenacity, sniffio, smmap, six, rpds-py, pyyaml, python-dotenv, pyparsing, pygments, pyarrow, protobuf, pillow, packaging, numpy, narwhals, mdurl, MarkupSafe, kiwisolver, idna, httptools, h11, fonttools, cycler, click, charset-normalizer, certifi, cachetools, blinker, attrs, uvicorn, requests, referencing, python-dateutil, pydantic, markdown-it-py, jinja2, gitdb, contourpy, anyio, watchfiles, starlette, rich, pydeck, pandas, matplotlib, jsonschema-specifications, gitpython, jsonschema, fastapi, altair, streamlit
Successfully installed MarkupSafe-3.0.2 altair-5.5.0 anyio-4.10.0 attrs-25.3.0 blinker-1.9.0 cachetools-5.5.2 certifi-2025.8.3 charset-normalizer-3.4.3 click-8.2.1 contourpy-1.3.3 cycler-0.12.1 fastapi-0.99.1 fonttools-4.59.2 gitdb-4.0.12 gitpython-3.1.45 h11-0.16.0 httptools-0.6.4 idna-3.10 jinja2-3.1.2 jsonschema-4.25.1 jsonschema-specifications-2025.9.1 kiwisolver-1.4.9 markdown-it-py-4.0.0 matplotlib-3.9.0 mdurl-0.1.2 narwhals-2.5.0 numpy-2.3.3 packaging-24.2 pandas-2.2.3 pillow-11.3.0 protobuf-5.29.5 pyarrow-21.0.0 pydantic-1.10.23 pydeck-0.9.1 pygments-2.19.2 pyparsing-3.2.4 python-dateutil-2.9.0.post0 python-dotenv-1.0.1 pytz-2025.2 pyyaml-6.0.2 referencing-0.36.2 requests-2.31.0 rich-13.9.4 rpds-py-0.27.1 six-1.17.0 smmap-5.0.2 sniffio-1.3.1 starlette-0.27.0 streamlit-1.41.0 tenacity-9.1.2 toml-0.10.2 tornado-6.5.2 typing-extensions-4.15.0 tzdata-2025.2 urllib3-2.5.0 uvicorn-0.23.2 uvloop-0.21.0 watchdog-6.0.0 watchfiles-1.1.0 websockets-15.0.1
[notice] A new release of pip is available: 25.1.1 -> 25.2
[notice] To update, run: pip install --upgrade pip
==> Uploading build...
==> Uploaded in 23.6s. Compression took 4.0s
==> Build successful 🎉
==> Deploying...
==> Running 'uvicorn app:app --host 0.0.0.0 --port $PORT'
INFO:     Started server process [61]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000 (Press CTRL+C to quit)
INFO:     127.0.0.1:48264 - "HEAD / HTTP/1.1" 405 Method Not Allowed
==> Your service is live 🎉
==> 
==> ///////////////////////////////////////////////////////////
==> 
==> Available at your primary URL https://real-estate-app-rwf1.onrender.com
==> 
==> ///////////////////////////////////////////////////////////
INFO:     14.8.22.224:0 - "GET / HTTP/1.1" 200 OK
Year 1: owner_type=個人, effective_tax_rate=5.0, capital_gain=4971.6万円
Year 2: owner_type=個人, effective_tax_rate=5.0, capital_gain=4793.8万円
Year 3: owner_type=個人, effective_tax_rate=5.0, capital_gain=4616.1万円
Year 4: owner_type=個人, effective_tax_rate=5.0, capital_gain=4438.3万円
Year 5: owner_type=個人, effective_tax_rate=5.0, capital_gain=4260.5万円
Year 6: owner_type=個人, effective_tax_rate=5.0, capital_gain=4082.7万円
Year 7: owner_type=個人, effective_tax_rate=5.0, capital_gain=3905.0万円
Year 8: owner_type=個人, effective_tax_rate=5.0, capital_gain=3727.2万円
Year 9: owner_type=個人, effective_tax_rate=5.0, capital_gain=3549.4万円
Year 10: owner_type=個人, effective_tax_rate=5.0, capital_gain=3260.5万円
Year 11: owner_type=個人, effective_tax_rate=5.0, capital_gain=3071.6万円
Year 12: owner_type=個人, effective_tax_rate=5.0, capital_gain=2882.7万円
Year 13: owner_type=個人, effective_tax_rate=5.0, capital_gain=2693.8万円
Year 14: owner_type=個人, effective_tax_rate=5.0, capital_gain=2505.0万円
Year 15: owner_type=個人, effective_tax_rate=5.0, capital_gain=2316.1万円
Year 16: owner_type=個人, effective_tax_rate=5.0, capital_gain=2127.2万円
Year 17: owner_type=個人, effective_tax_rate=5.0, capital_gain=1938.3万円
Year 18: owner_type=個人, effective_tax_rate=5.0, capital_gain=1749.4万円
Year 19: owner_type=個人, effective_tax_rate=5.0, capital_gain=4938.3万円
Year 20: owner_type=個人, effective_tax_rate=5.0, capital_gain=4705.0万円
Year 21: owner_type=個人, effective_tax_rate=5.0, capital_gain=4682.7万円
Year 22: owner_type=個人, effective_tax_rate=5.0, capital_gain=4660.5万円
Year 23: owner_type=個人, effective_tax_rate=5.0, capital_gain=4638.3万円
Year 24: owner_type=個人, effective_tax_rate=5.0, capital_gain=4616.1万円
Year 25: owner_type=個人, effective_tax_rate=5.0, capital_gain=4593.8万円
Year 26: owner_type=個人, effective_tax_rate=5.0, capital_gain=4571.6万円
Year 27: owner_type=個人, effective_tax_rate=5.0, capital_gain=4549.4万円
Year 28: owner_type=個人, effective_tax_rate=5.0, capital_gain=4838.3万円
Year 29: owner_type=個人, effective_tax_rate=5.0, capital_gain=4827.2万円
Year 30: owner_type=個人, effective_tax_rate=5.0, capital_gain=4482.7万円
Year 31: owner_type=個人, effective_tax_rate=5.0, capital_gain=4460.5万円
Year 32: owner_type=個人, effective_tax_rate=5.0, capital_gain=4438.3万円
Year 33: owner_type=個人, effective_tax_rate=5.0, capital_gain=4416.1万円
Year 34: owner_type=個人, effective_tax_rate=5.0, capital_gain=4393.8万円
Year 35: owner_type=個人, effective_tax_rate=5.0, capital_gain=4371.6万円
INFO:     14.8.22.224:0 - "POST /api/simulate HTTP/1.1" 200 OK