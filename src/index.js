'use strict';
// md file format should be title_yyyy-mm-dd

class loadMarkdowns{
    loadMarkdowns(paths, page, itemsPerPage, sortDesc) {

        //item in future date will not be included
        paths = paths.filter((path) => {
            var date = new Date(path.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0].split("_")[1]);
            return date <= new Date();
        })
    
        //sort by date
        paths.sort((a, b) => {
            var dateA = new Date(a.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0].split("_")[1]);
            var dateB = new Date(b.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0].split("_")[1]);
            return sortDesc ? dateB - dateA : dateA - dateB;
        })
    
        itemsPerPage = page > 0 ? itemsPerPage : 99999999;
        var pages = Math.ceil(paths.length / itemsPerPage);
        var mds = [];
        //load the files
        mds_path.slice((page - 1) * per_page, (page) * per_page).forEach((path) => {
            mds.push(
                fetch(path).then(response => response.text()).then(md => {
                    var titles = md.match(/^\#\#\s.*\s/) || ["No Title"];
                    var title = titles[0].replace("## ", "");
                    var pathInfo = path.match(/[\w\d\-\_\+\$]+\.md/)[0].split(".")[0];
                    var link = "/posts/" + pathInfo;
                    var date = pathInfo.split("_")[1];
                    //first 30 words
                    var excerpt = md.replace(/(\#{1,}\s.*)|(\!\[.*?\])|(\[)|(\])|(\([http\/].*?\))|(\*?)|(\<.*?\>.*?\<\/.*?\>)|(\-)|(\|)(\r)|(\n)|(\<img src=.*?\>)/g, "").split(' ').slice(0, 30).join(" ")
                    var images = md.match(/\!\[.*\]\(http.*\)\s/) || ["https://i.imgur.com/N9jdI0r.png"];
                    var thumbnail = images[0].match(/http.*(?=\))/) || ["https://i.imgur.com/N9jdI0r.png"];
                    return { "title": title, "content": md, "date": date, "excerpt": excerpt + " ......", thumbnail: thumbnail, "link": link };
                }));
        });
        return Promise.all(mds);
    }
}

export default loadMarkdowns;

