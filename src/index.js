import Fuse from "fuse.js"

class MarkdownHandler {


    //default options
    isDateDesc = true;
    route = "/posts";
    excerptLength = 30;
    itemsPerPage = 8;
    filterCategories = [];
    filterTags = [];
    isPinnedOnly = false;

    //default parsing functions
    dateParser = (path) => {
        return new Date(path.match(/\d{4}-\d{2}-\d{2}/)[0].trim());
    }

    titleParser = (path) => {
        //path is in format of title_yyyy-mm-dd
        return path.split("/").slice(-1)[0].split("_")[0].replace(/-/g, " ").replace("@", "").trim();
    }

    pinnedParser = (path) => {
        //checked if it is pinned
        return path.split("/").slice(-1)[0].split("_")[0][0] == "@";
    }

    categoryParser = (path) => {
        return path.match(/(?<=@).*(?=\.md)/)[0].trim();
    }

    tagsParser = (path) => {
        return path.match(/(?<=\_)[^_]*(?=@)/)[0].split(",");
    }

    linkParser = (route, path) => {
        return route + path.match(/\/[^\/]*(?=\.md)/)[0].trim();
    }

    excerptParser = (md, length) => {
        return md.replace(/(\#{1,}\s.*)|(\!\[.*?\])|(\[)|(\])|(\([http\/].*?\))|(\*?)|(\<.*?\>.*?\<\/.*?\>)|(\-)|(\|)(\r)|(\n)|(\<img src=.*?\>)/g, "").
            split(' ').
            map(str => str.trim()).
            filter(str => str != "").
            slice(0, length).join(" ").trim();
    }

    thumbnailParser = (md) => {
        let images = md.match(/\!\[.*\]\(http.*\)\s/) || ["https://i.imgur.com/N9jdI0r.png"];
        return (images[0].match(/http.*(?=\))/) || ["https://i.imgur.com/N9jdI0r.png"])[0];
    }

    categoryFilter = (paths) => {
        if (this.filterCategories.length > 0) {
            return paths.filter((path) => {
                return this.filterCategories.indexOf(this.categoryParser(path)) >= 0;
            })
        }
        return paths;
    }

    tagFilter = (paths) => {
        if (this.filterTags.length > 0) {
            return paths.filter((path) => {
                let flag = false;
                this.tagsParser(path).forEach(tag => {
                    if (this.filterTags.indexOf(tag) >= 0) {
                        flag = true;
                    }
                })
                return flag;
            })
        }
        return paths;
    }


    getSearchIndex = (paths) => {
        let titleDoc = [];
        paths.forEach((path) => {
            titleDoc.push(
                {
                    "title": this.titleParser(path),
                    "link": this.linkParser(this.route, path)
                }
            )
        })
        var searchIndex = new Fuse(titleDoc, {
            keys: ["title"]
        })
        return searchIndex;
    }

    loadMds = (paths = [], page = 1) => {

        //item in future date will not be included, useful for draft functionality
        paths = paths.filter((path) => {
            let date = this.dateParser(path);
            if (this.isPinnedOnly) {
                return date <= new Date() && this.pinnedParser(path);
            }
            //return all including the pinned ones
            return date <= new Date();
        })

        //sort by date
        paths.sort((a, b) => {
            let dateA = this.dateParser(a);
            let dateB = this.dateParser(b);
            return this.isDateDesc ? dateB - dateA : dateA - dateB;
        })

        //fitler by category
        paths = this.categoryFilter(paths);
        //fitler by tag
        paths = this.tagFilter(paths);

        const categories = paths.map(path => this.categoryParser(path));
        const tags = [];
        paths.forEach(path => tags.push(...this.tagsParser(path)));


        let itemsPerPage = page > 0 ? this.itemsPerPage : 99999999;
        let pages = Math.ceil(paths.length / itemsPerPage);
        let mds = [];


        //load the md files for the current page
        paths.slice((page - 1) * itemsPerPage, (page) * itemsPerPage).forEach((path) => {
            mds.push(
                fetch(path).then(response => response.text()).then(md => {
                    let title = this.titleParser(path);
                    let link = this.linkParser(this.route, path);
                    let date = this.dateParser(path).toISOString().slice(0, 10);;
                    let excerpt = this.excerptParser(md, this.excerptLength);
                    let tags = this.tagsParser(path);
                    let category = this.categoryParser(path);
                    let thumbnail = this.thumbnailParser(md);
                    return { "title": title, "content": md, "date": date, "excerpt": excerpt + " ......", thumbnail: thumbnail, "link": link, "tags": tags, "category": category, "pinned":this.isPinnedOnly };
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



}



export default MarkdownHandler;

