FROM node:11

# Mount a volume to pull the input from
VOLUME /input

# Mount a volume to receive the output
VOLUME /output

# Put a doculatrix.yaml file here to control site generation
# You'll also need to use custom command line args
VOLUME /config

WORKDIR /usr/share/doculatrix/

COPY docker-entrypoint.sh .

# copy node deps & run npm install before copying code,
# so we cache node_modules & speed up docker build
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY .babelrc .babelrc
COPY .flowconfig .flowconfig
COPY src src
RUN npm run build

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["-i", "/input/", "-o", "/output/"]
