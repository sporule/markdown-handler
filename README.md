# Markdown Handler

[![Build Status](https://travis-ci.org/sporule/markdown-handler.svg?branch=master)](https://travis-ci.org/sporule/markdown-handler)
[![NPM version](https://img.shields.io/npm/v/markdown-handler.svg?style=flat)](https://www.npmjs.org/package/markdown-handler)
![Dependencies](https://img.shields.io/david/sporule/markdown-handler)
[![Coverage Status](https://coveralls.io/repos/github/sporule/markdown-handler/badge.svg?branch=master)](https://coveralls.io/github/sporule/markdown-handler?branch=master)

> Mini utility to help you load your markdown files as posts.

## Installation

```bash
npm install markdown-handler
```

## Simple Example (ES6)

```js
import MarkdownHandler from 'markdown-handler';

//You will need to have your markdown file name in the format of title_yyyy-mm-dd, such as today-is-a-good-day_2019-03-21
//The package use the filename to get the post date

MarkdownHandler.loadMds(mds_path, page, per_page, excerptLength, isDateDesc, route).then((mds) => {
        console.log(mds);
});

// mds_path is the paths for all your markdown files, it should be an array
// page is the current page you want to load,
// per_page is how many markdown files you want to get per_page
// excerpt length is the length of the excerpt
// isDateDesc is the order of the mds
// route is the link for the post, I will explain it when I have more time.
// please print the return object to see what is inside, it will contain thumbnail, title, content, date and link
```

