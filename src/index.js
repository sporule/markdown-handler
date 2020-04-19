
class MarkdownHandler {


    //default options
    excerptLength = 30;
    defaultThumbnail = "https://i.imgur.com/GzmpA4s.png";
    test = "123";
    mustHaveMetas = ["title", "categories", "tags", "date"]

    excerptParser = (md, length) => {
        return md.replace(/(\#{1,}\s.*)|(\!\[.*?\])|(\[)|(\])|(\([http\/].*?\))|(\(.*?\.(jpg|png|gif|bmp|jpeg).*?\))|(\*?)|(\<.*?\>.*?\<\/.*?\>)|(\-)|(\|)(\r)|(\n)|(\<img src=.*?\>)|(\`\`\`.*)/g, "").
            split(' ').
            map(str => str.trim()).
            filter(str => str != "").
            slice(0, length).join(" ").slice(0, length * 10);
    }

    thumbnailParser = (md) => {
        //match first image in the markdown file, otherwise will use default image
        let images = md.match(/\!\[.*\]\(.*?\.(jpg|png|gif|bmp|jpeg).*?\)/) || [""];
        let image = (images[0].match(/\]\(.*(?=\))/) || [""])[0].replace(/\]|\(/g, "");
        if (!image.includes("http")) {
            image = "/" + image;
        }
        return image.length > 5 ? image : this.defaultThumbnail;
    }

    markdownLocalImageFixer = (content) => {
        //add / in front of the local images
        return content.replace(/images(?=\/.*\))/g, "/images");
    }

    getSearchFunction = (mds) => {
        return (title) => {
            return mds.filter(o => o.title.includes(title))
        }
    }

    parseContent = (path, md) => {
        if (md.split("---").length >= 3) {
            //if the md has the meta data
            let metas = {};
            let metaStrs = md.split("---")[1];
            metaStrs.split("\n").forEach((metaStr) => {
                let metaArray = metaStr.split("\n")[0].split(":");
                if (metaArray.length >= 2) {
                    let metaName = metaArray[0].trim().toLowerCase();
                    let metaValue = metaArray.slice(1, 99999).join(":").trim().replace(/"/g, "");
                    if (metaName != "coverimage") {
                        metaValue = metaValue.toLowerCase();
                    }
                    if (metaName == "categories" || metaName == "tags") {
                        metaValue = metaValue.split(",").map(o => o.trim());
                    }
                    metas[metaName] = metaValue;
                }
            });
            if (!metas["coverimage"]) {
                //add default thumbnail
                metas["coverimage"] = this.thumbnailParser(md);
            }
            else if (metas["coverimage"].slice(0, 4) != "http") {
                metas["coverimage"] = "/" + metas["coverimage"];
            }
            let returnFlag = true;
            this.mustHaveMetas.forEach(meta => {
                //all must have metas are required
                if (metas[meta] == null) {
                    returnFlag = false;
                }
            })
            let content = md.split("---").slice(2, 99999).join("---");
            content = this.markdownLocalImageFixer(content);
            const excerpt = this.excerptParser(content, this.excerptLength);
            if (returnFlag) {
                return { "title": metas.title, "metas": metas, "content": content, "excerpt": excerpt + " ......", "path": path };
            }
        }
    }

    loadMds = (paths = []) => {
        let mds = [];
        paths.forEach((path) => {
            if (path.includes('md.js')) {
                // this is the index of all mds
                mds.push(
                    fetch(path).then(response => response.text()).then(mds_string => {
                        let posts = JSON.parse(mds_string);
                        return posts;
                    })
                );
            }
            else {
                mds.push(
                    fetch(path).then(response => response.text()).then(md => {
                        return this.parseContent(path, md);
                    })
                );
            }
        });
        return Promise.all(mds).then(mds => {
            mds = mds.flat().filter((md) => md); //remove undefined
            const search = this.getSearchFunction(mds);
            return {
                "items": mds,
                "search": search
            };
        });
    }
}

export default MarkdownHandler;

