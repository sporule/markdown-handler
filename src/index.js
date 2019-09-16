import Fuse from "fuse.js"

class MarkdownHandler {


    //default options
    excerptLength = 30;
    defaultThumbnail = "https://i.imgur.com/GzmpA4s.png";
    test = "123";
    mustHaveMetas = ["title", "categories", "tags", "date"]

    excerptParser = (md, length) => {
        return md.replace(/(\#{1,}\s.*)|(\!\[.*?\])|(\[)|(\])|(\(.*?\.(jpg|png|gif|bmp|jpeg).*?\))|(\*?)|(\<.*?\>.*?\<\/.*?\>)|(\-)|(\|)(\r)|(\n)|(\<img src=.*?\>)/g, "").
            split(' ').
            map(str => str.trim()).
            filter(str => str != "").
            slice(0, length).join(" ").slice(0, length * 10);
    }

    thumbnailParser = (md) => {
        //match first image in the markdown file, otherwise will use default image
        let images = md.match(/\!\[.*\]\(.*?\.(jpg|png|gif|bmp|jpeg).*?\)/) || [""];
        let image = (images[0].match(/(?<=\().*(?=\))/) || [""])[0];
        if (!image.includes("http")) {
            image = "/" + image;
        }
        return image.length > 5 ? image : this.defaultThumbnail;
    }

    markdownLocalImageFixer = (content) => {
        //add / in front of the local images
        return content.replace(/images(?=\/.*\))/g, "/images");
    }

    getSearchIndex = (mds) => {
        let titleDoc = [];
        mds.forEach((md) => {
            titleDoc.push(
                md
            )
        })
        var searchIndex = new Fuse(titleDoc, {
            keys: ["title"]
        })
        return searchIndex;
    }


    loadMds = (paths = []) => {
        let mds = [];
        paths.forEach((path) => {
            mds.push(
                fetch(path).then(response => response.text()).then(md => {
                    if (md.split("---").length >= 3) {
                        //if the md has the meta data
                        let metas = {};
                        let metaStrs = md.split("---")[1];
                        metaStrs.split("\n").forEach((metaStr) => {
                            let metaArray = metaStr.split("\n")[0].split(":");
                            if (metaArray.length == 2) {
                                let metaName = metaArray[0].trim().toLowerCase();
                                let metaValue = metaArray[1].toLowerCase().trim().replace(/"/g, "");
                                if (metaName == "categories" || metaName == "tags") {
                                    metaValue = metaValue.split(",").map(o => o.trim());
                                }
                                metas[metaName] = metaValue;
                            }
                        });
                        if (!metas["coverImage"]) {
                            //add default thumbnail
                            metas["coverImage"] = this.thumbnailParser(md);
                        }
                        else {
                            metas["coverImage"] = "/" + metas["coverImage"];
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
                })
            );
        });
        return Promise.all(mds).then(mds => {
            mds = mds.filter((md) => md); //remove undefined
            const searchIndex = this.getSearchIndex(mds);
            return {
                "items": mds,
                "searchIndex": searchIndex
            };
        });
    }
}

export default MarkdownHandler;

