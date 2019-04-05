// @flow

/**
 * A WikiConfig is plan for transforming a clone of a github
 * wiki repository into a directory full of Markdown files
 * and images that are structured in a way that Hugo likes.
 *
 * The idea is that all markdown files in the wiki repo are
 * treated as Hugo "sections", which makes them show up in
 * the side menu of most themes and generally makes navigation
 * work the way Hugo expects.
 *
 * The exception are the special files `Home.md` and `_Footer.md`.
 * `Home.md` get turned into Hugo's index page, so it's what renders
 * at the `/` route of the generated site.
 *
 * I haven't decided what to do with `_Footer.md` yet - I think making
 * the content available as a Hugo variable would be cool, so
 * you could put it into a part of the site layout that makes sense.
 * TODO: figure this out ^^
 *
 * The required arguments for a `WikiConfig` are the `inputPath`
 * of a local wiki repo clone and the `outputPath` where the
 * transformed files should go. Note that `outputPath` is *not*
 * the generated site - it is the massaged Markdown source that
 * gets fed into Hugo as *input* to generate the site.
 *
 * You can optionally give a `metadata` map argument that lets you
 * set Hugo specific metadata, which gets prepended to the source
 * file as Hugo "front matter" in yaml format.
 *
 * The `metadata` map should look like this:
 *
 * ```javascript
 * {
 *   "Getting-Started.md": {
 *     "title": "Getting Started with Filecoin",
 *     "weight": 1,
 *     "pre": "<i class='a-fancy-icon-font-thing'></i> "
 *   }
 * }
 * ```
 *
 * If you don't give any metadata for a given filename or don't
 * provide a `title` field, we'll generate a default `title` field
 * by "de-slugging" the filename. So e.g. `Getting-Started.md` would
 * become `Getting Started` and so on.
 *
 * Hugo sorts the entries in the navigation menu by the `weight`
 * metadata field. If it's missing, it will fall back to sorting
 * lexicographically (I think... I don't know if it tries to do any
 * fancy localization).
 *
 * You can put whatever you want in the metadata dictionary;
 */
export default class WikiConfig {

}