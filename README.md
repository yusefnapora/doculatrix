# doculatrix

![Mr. Burns learns to code](doculatrix-simpsons.jpg)

## What & Why

This is a node.js app that slurps in a directory full of markdown files (and possibly other stuff),
and spits out a directory with those same files massaged a bit to play nice with [Hugo](https://gohugo.io),
a static site generator I'm using for a few things.

The main motivation right now is to produce a documentation website for [filecoin](https://filecoin.io),
by doing some light processing on the Markdown source of the 
[go-filecoin wiki](https://github.com/filecoin-project/go-filecoin/wiki).

The big idea is that edits to the wiki will trigger a build process that clones the git repository that
backs the wiki content, at which point we run this app against the wiki content.

Running this app produces Markdown files in a structure that Hugo likes, so you can drop the output into
the `/content` directory of a standard hugo site and all the links between articles will resolve.

## How

I haven't got around to making a binary command you can install, so for now, you should

```bash
npm install
npm run build
node lib/index.js -i inputDir -o outputDir -c config-file.yaml
```

There's also a `Dockerfile` in here, and I'll likely push an image to docker hub at some point.

Until then, you can run `docker build . -t doculatrix:latest` to build the image.

Then, you can run with

```bash
input_dir=/path/to/input/dir
output_dir=/path/to/output/dir
config_file=/path/to/config/file
image="doculatrix:latest"

CMD="docker run -it -v ${input_dir}:/input -v ${output_dir}:/output -v ${config_file}:/doculatrix.yaml ${image}"

${CMD} -i /input -o /output -c /doculatrix.yaml
```

Which mounts input and output dirs from your local machine to the `/input` and `/output` paths in
the container, and also mounts a config file at `/doculatrix.yaml`.

