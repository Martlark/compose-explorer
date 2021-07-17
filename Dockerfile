FROM python:3.9
# upgrade pip
WORKDIR /app
# install node
# https://github.com/nodesource/distributions
RUN apt-get update; \
    apt-get install -y curl gnupg; \
    curl -sL https://deb.nodesource.com/setup_12.x | bash -; \
    apt-get install -y nodejs; \
    rm -rf /var/lib/apt/lists/*
# upgrade pip
RUN pip install -U pip

# npm install
COPY package.json /app
COPY package-lock.json /app
RUN npm install

# copy over our requirements.txt file
COPY requirements.txt /tmp/
# install required python packages

RUN pip install -r /tmp/requirements.txt

# copy over our app code
COPY . /app

# transpile jsx code

RUN npm run build

ENTRYPOINT [ "bash", "entrypoint.sh" ]

