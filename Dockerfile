FROM tiangolo/meinheld-gunicorn-flask:python3.7
# see: https://github.com/tiangolo/meinheld-gunicorn-flask-docker
#
# upgrade pip
RUN pip install -U pip

# copy over our requirements.txt file
COPY requirements.txt /tmp/
# install required python packages

RUN pip install -r /tmp/requirements.txt

# copy over our app code
COPY . /app
