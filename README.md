# Markdown Handler

[![Build Status](https://travis-ci.org/sporule/markdown-handler.svg?branch=master)](https://travis-ci.org/sporule/markdown-handler)
[![NPM version](https://img.shields.io/npm/v/markdown-handler.svg?style=flat)](https://www.npmjs.org/package/markdown-handler)
![Dependencies](https://img.shields.io/david/sporule/markdown-handler)
[![Coverage Status](https://coveralls.io/repos/github/sporule/markdown-handler/badge.svg?branch=master)](https://coveralls.io/github/sporule/markdown-handler?branch=master)

> Mini utility to help you load your markdown files by using the paths to .md files.

## Features

- Reads markdown contents by using the paths without pre-build.
- Provide  search functionality by using [Fuse.js](https://fusejs.io/).
- Provides some basic meta data such as tags, categories, date, coverimage but it is flexible to configure.

## Installation

Node.js

```bash
npm install markdown-handler
```

## Usage Example (ES6)

```javascript
import MarkdownHandler from 'markdown-handler';

let mdHandler = new MarkdownHandler();

var paths = [
        "https://sporule.com/1.md",
        "https://sporule.com/2.md",
        "https://sporule.com/3.md"
]

mdHandler.loadMds(paths).then(posts => {
          console.log(posts);
          //To Search from markdowns
          posts.searchIndex("title to search");
});


```

## One of the example markdown files

```javascript

---
title: "This is another Demo Post" 
author: "Sporule"
date: "2019-09-10"
categories: "Another Demo"
tags: "tagA,tagD"
coverImage: "https://i.imgur.com/GzmpA4s.png"
---

# Paragraph 1
Lorem ipsum dolor sit amet, nullam putent deserunt mel no, cum periculis intellegebat ne. Noluisse voluptatibus id sed, iudico essent ius et. In mutat mucius probatus eum. Has cu iusto audiam quaeque. Ad idque essent mei.

Mel solet aperiri similique id, ei mutat essent cotidieque eam, tempor ancillae pri te. Est at utroque explicari, eam comprehensam mediocritatem eu. Duis quodsi commune id cum, et eum noluisse consequuntur. Tation nullam conclusionemque mel in, nec volutpat splendide ad, nec ne persecuti intellegebat. Sed antiopam maiestatis rationibus no. Vocibus appetere mea an, no vix habeo dicant probatus.

```

## Output structure

```javascript
posts:
  {
    "items": [
      {
        "title": "",
        "content": "",
        "excerpt": "",
        "path": "",
        "metas": {
          "categories": [],
          "tags": [],
          "title": "",
          "date": "",
          "coverimage": ""
        }
      }
    ],
    searchIndex: {}
  }
```

## Configurations

| Variable         | Default                                                              | Type         | Note                                                                                   |
| ---------------- | -------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------- |
| excerptLength    | `30`                                                                 | integer      | The length of excerpt, excerpt will be generated from the markdown files               |
| defaultThumbnail | `https://i.imgur.com/GzmpA4s.png`                                    | string       | The default thumbnail if there is no image in markdown file                            |
| mustHaveMetas    | `["title", "categories", "tags", "date"]`                            | string array | This are the must have metas at the beginning of the markdown file                     |
| excerptParser    | take the set length from the markdown file                           | function     | Input is the markdown file and the length of the excerpt, output is the excerpt string |
| thumbnailParser  | take the first image from markdown file as thumbnail                 | function     | Input is the markdown file, output is the thumbnail string                             |
| getSearchIndex   | This is to build the search index by using Fuse, search key is title | function     | Input is the post processed markdown items, output is the fuse search object           |

## Meta Data

All meta data between at the beginning of the document will be loaded into the item object, for example if you want the color attribute in meta data, you shoud have the markdown files look like:

```javascript

---
title: "This is another Demo Post" 
author: "Sporule"
date: "2019-09-10"
categories: "Another Demo"
tags: "tagA,tagD"
coverImage: "https://i.imgur.com/GzmpA4s.png"
color:"pink"
---

# Paragraph 1
Lorem ipsum dolor sit amet, nullam putent deserunt mel no, cum periculis intellegebat ne. Noluisse voluptatibus id sed, iudico essent ius et. In mutat mucius probatus eum. Has cu iusto audiam quaeque. Ad idque essent mei.

Mel solet aperiri similique id, ei mutat essent cotidieque eam, tempor ancillae pri te. Est at utroque explicari, eam comprehensam mediocritatem eu. Duis quodsi commune id cum, et eum noluisse consequuntur. Tation nullam conclusionemque mel in, nec volutpat splendide ad, nec ne persecuti intellegebat. Sed antiopam maiestatis rationibus no. Vocibus appetere mea an, no vix habeo dicant probatus.

```

## Example Implementation of the Code

[Sporule](https://github.com/sporule/sporule) : A micro blog system that uses markdown-handler
