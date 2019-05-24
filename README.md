# doculatrix

![Mr. Burns learns to code](doculatrix-simpsons.jpg)

## What & Why

This is a node.js app that slurps in a directory full of markdown files (and possibly other stuff),
and spits out a directory with those same files massaged a bit to play nice with [Hugo](https://gohugo.io),
a static site generator.

The main motivation right now is to produce a documentation website for [filecoin](https://filecoin.io),
by doing some light processing on the Markdown source of the 
[go-filecoin wiki](https://github.com/filecoin-project/go-filecoin/wiki).

The big idea is that edits to the wiki will trigger a build process that clones the git repository that
backs the wiki content, at which point we run this app against the wiki content.

Running this app produces Markdown files in a structure that Hugo likes, so you can drop the output into
the `/content` directory of a standard hugo site and all the links between articles will resolve.

## Usage

To run, you need a recent Node install. Clone this repo and enter it, then:

```bash
npm install
npm run build
node lib/index.js -i inputDir -o outputDir -c config-file.yaml
```

The `inputDir` should be a directory containing the source files you want to
process. The only format supported at the moment is Markdown; everything else
will just be copied over to the output directory unaltered.

The `outputDir` will contain the processed output. The directory structure
that's generated will depend on your [configuration](#configuration).

You'll probably want at least a minimal config file. See
[Configuration](#configuration).

### Running with Docker

There's also a `Dockerfile` in here, which you can build with: `docker build . -t doculatrix:latest`

The image is also on docker hub as [sefnap/doculatrix](https://hub.docker.com/r/sefnap/doculatrix),
so there's no need to build locally to run it; just use `sefnap/doculatrix:latest`.

Then, you can run with

```bash
input_dir=/path/to/input/dir
output_dir=/path/to/output/dir
config_file=/path/to/config/file
image="sefnap/doculatrix:latest"

CMD="docker run -it -v ${input_dir}:/input -v ${output_dir}:/output -v ${config_file}:/doculatrix.yaml ${image}"

${CMD} -i /input -o /output -c /doculatrix.yaml
```

Which mounts input and output dirs from your local machine to the `/input` and `/output` paths in
the container, and also mounts a config file at `/doculatrix.yaml`.


## How it Works

The basic process is to scan through the input directory and produce a "content
map", which is a list of input files and some metadata about them. By default,
it will just be an instruction to copy the input file to the output directory.

Markdown files are special, and they get pre-processed before being written to
the output directory. 

### Markdown Processing

The main goal of the Markdown processing is to make sure links resolve
correctly, and that the content fits into a directory structure that hugo likes.

Hugo really likes you to structure your content in sections, with a directory
per section, and an `_index.md` file containing the main content. When building
the Content Map, we can also rewrite the output path for a given input file.
This is done automatically for GitHub wikis.

Knowing all the input and output paths lets us rewrite links so they resolve to
the right place in the output.


### GitHub Wiki Content

GitHub Wikis are special. When your config has `wiki` key set, we treat the
input as a GitHub style wiki repo, which stores each wiki page as a markdown
file, with images in an `images` directory.

If you want, you can specify metadata for each wiki page in your config file,
for example to override the title or control the ordering of pages in your site
navigation. If you don't specify any metadata, the filename will be converted to
a page title automatically.

## Configuration

TK: write up config examples
