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

    const categories = paths.map(path => MarkdownHandler.categoryParser(path));
    const tags = Array.from(
        new Set(
            paths.map(path => MarkdownHandler.tagsParser(path)).flat()
        )
    );

    itemsPerPage = page > 0 ? MarkdownHandler.itemsPerPage : 99999999;
    let pages = Math.ceil(paths.length / itemsPerPage);
    let mds = [];
    //load the md files
    paths.slice((page - 1) * itemsPerPage, (page) * itemsPerPage).forEach((path) => {
        mds.push(
            fetch(path).then(response => response.text()).then(md => {
                let title = MarkdownHandler.titleParser(path);
                let link = MarkdownHandler.linkParser(MarkdownHandler.route, path);
                let date = MarkdownHandler.dateParser(path).toISOString().slice(0, 10);;
                let excerpt = MarkdownHandler.excerptParser(md, MarkdownHandler.excerptLength);
                let tags = MarkdownHandler.tagsParser(path);
                let category = MarkdownHandler.categoryParser(path);
                let thumbnail = MarkdownHandler.thumbnailParser(md);
                return { "title": title, "content": md, "date": date, "excerpt": excerpt + " ......", thumbnail: thumbnail, "link": link, "tags": tags, "category": category };
            }));
    });
    return Promise.all(mds).then(mds => {
        return {
            "items": mds,
            "pages": pages,
            "page": page,
            "tags": tags,
            "categories": categories,
            "itemsPerPage": itemsPerPage,
            "hasPrevPage": page > 1,
            "hasNextPage": page < pages,
            "invalidPage": page > pages
        };
    });
}


//default configs

let dateParser = (path) => {
    return new Date(path.match(/\d{4}-\d{2}-\d{2}/)[0].trim());
}

let titleParser = (path) => {
    //path is in format of title_yyyy-mm-dd
    return path.split("/").slice(-1)[0].split("_")[0].replace(/-/g, " ").trim();
}

let categoryParser = (path) => {
    return path.match(/(?<=@).*(?=\.md)/)[0].trim();
}

let tagsParser = (path) => {
    return path.match(/(?<=\_)[^_]*(?=@)/)[0].split(",");
}

let linkParser = (route, path) => {
    return route + path.match(/\/[^\/]*(?=\.md)/)[0].trim();
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
let route = "/posts";
let excerptLength = 30;
let itemsPerPage = 8;

let MarkdownHandler = {
    loadMds,
    dateParser,
    titleParser,
    linkParser,
    categoryParser,
    tagsParser,
    excerptParser,
    thumbnailParser,
    excerptLength,
    isDateDesc,
    route,
    itemsPerPage,
}

export default MarkdownHandler;

