'use strict';


const loadMds = (paths, page) => {
    //item in future date will not be included, useful for draft functionality
    paths = paths.filter((path) => {
        let date = MarkdownHandler.dateParser(path);
        return date <= new Date();
    })

    //sort by date
    paths.sort((a, b) => {
        let dateA = MarkdownHandler.dateParser(a);
        let dateB = MarkdownHandler.dateParser(b);
        return MarkdownHandler.isDateDesc ? dateB - dateA : dateA - dateB;
    })

    itemsPerPage = page > 0 ? MarkdownHandler.itemsPerPage : 99999999;
    let pages = Math.ceil(paths.length / itemsPerPage);
    let mds = [];
    //load the md files
    paths.slice((page - 1) * itemsPerPage, (page) * itemsPerPage).forEach((path) => {
        mds.push(
            fetch(path).then(response => response.text()).then(md => {
                let title = MarkdownHandler.titleParser(md);
                let link = MarkdownHandler.linkParser(MarkdownHandler.route, path);
                let date = MarkdownHandler.dateParser(path).toISOString().slice(0, 10);;
                let excerpt = MarkdownHandler.excerptParser(md, MarkdownHandler.excerptLength);
                let thumbnail = MarkdownHandler.thumbnailParser(md);
                return { "title": title, "content": md, "date": date, "excerpt": excerpt + " ......", thumbnail: thumbnail, "link": link };
            }));
    });
    return Promise.all(mds).then(mds => {
        return {
            "items": mds,
            "pages": pages,
            "page": page,
            "itemsPerPage": itemsPerPage,
            "hasPrevPage": page > 1,
            "hasNextPage": page < pages
        };
    });
}


//default configs

let dateParser = (path) => {
    return new Date(path.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0].split("_")[1]);
}

let titleParser = (md) => {
    let titles = md.match(/^\#\#\s.*\s/) || ["No Title"];
    return titles[0].replace("## ", "").trim();
}

let linkParser = (route, path) => {
    return route + path.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0];
}

let excerptParser = (md, length) => {
    return md.replace(/(\#{1,}\s.*)|(\!\[.*?\])|(\[)|(\])|(\([http\/].*?\))|(\*?)|(\<.*?\>.*?\<\/.*?\>)|(\-)|(\|)(\r)|(\n)|(\<img src=.*?\>)/g, "").
        split(' ').
        map(str => str.trim()).
        filter(str => str != "").
        slice(0, length).join(" ").trim();
}

let thumbnailParser = (md) => {
    let images = md.match(/\!\[.*\]\(http.*\)\s/) || ["https://i.imgur.com/N9jdI0r.png"];
    return (images[0].match(/http.*(?=\))/) || ["https://i.imgur.com/N9jdI0r.png"])[0];
}


let isDateDesc = true;
let route="/posts/";
let excerptLength =30;
let itemsPerPage = 8;

let MarkdownHandler = {
    loadMds,
    dateParser,
    titleParser,
    linkParser,
    excerptParser,
    excerptLength,
    thumbnailParser,
    isDateDesc,
    route,
    itemsPerPage,
}

export default MarkdownHandler;

