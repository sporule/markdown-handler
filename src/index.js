'use strict';

const loadMds = (paths, page, itemsPerPage, excerptLength, isDateDesc, route) => {
    // md file format should be title_yyyy-mm-dd

    //item in future date will not be included, useful for draft functionality
    paths = paths.filter((path) => {
        var date = new Date(path.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0].split("_")[1]);
        return date <= new Date();
    })

    //sort by date
    paths.sort((a, b) => {
        var dateA = new Date(a.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0].split("_")[1]);
        var dateB = new Date(b.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0].split("_")[1]);
        return isDateDesc ? dateB - dateA : dateA - dateB;
    })

    itemsPerPage = page > 0 ? itemsPerPage : 99999999;
    var pages = Math.ceil(paths.length / itemsPerPage);
    var mds = [];
    //load the files
    paths.slice((page - 1) * itemsPerPage, (page) * itemsPerPage).forEach((path) => {
        mds.push(
            fetch(path).then(response => response.text()).then(md => {
                var titles = md.match(/^\#\#\s.*\s/) || ["No Title"];
                var title = titles[0].replace("## ", "");
                var pathInfo = path.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0];
                var link = route + pathInfo;
                var date = pathInfo.split("_")[1];
                //first 30 words as excerpt
                var excerpt = md.replace(/(\#{1,}\s.*)|(\!\[.*?\])|(\[)|(\])|(\([http\/].*?\))|(\*?)|(\<.*?\>.*?\<\/.*?\>)|(\-)|(\|)(\r)|(\n)|(\<img src=.*?\>)/g, "").split(' ').slice(0, excerptLength).join(" ")
                var images = md.match(/\!\[.*\]\(http.*\)\s/) || ["https://i.imgur.com/N9jdI0r.png"];
                var thumbnail = images[0].match(/http.*(?=\))/) || ["https://i.imgur.com/N9jdI0r.png"];
                return { "title": title, "content": md, "date": date, "excerpt": excerpt + " ......", thumbnail: thumbnail, "link": link };
            }));
    });
    return Promise.all(mds).then(mds => {
        return {
            "items": mds,
            "pages": pages,
            "page": page,
            "per_page": itemsPerPage,
            "has_prev_page": page > 1,
            "has_next_page": page < pages
        };
    });
}

const MarkdownHandler = {
    loadMds
}

export default MarkdownHandler;

