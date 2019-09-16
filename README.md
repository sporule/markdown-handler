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



MarkdownHandler.loadMds(paths).then((mds) => {
        console.log(mds);
});


// please print the return object to see what is inside, it will contain thumbnail, title, content, date and link
```

