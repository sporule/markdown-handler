import Fuse from "fuse.js"

class MarkdownHandler {


    //default options
    excerptLength = 30;
    defaultThumbnail = "https://i.ibb.co/MPcgSHQ/logo.png";
    test = "123";
    mustHaveMetas = ["title", "categories", "tags", "date"]
    excerptParser = (md, length) => {
        return md.replace(/(\#{1,}\s.*)|(\!\[.*?\])|(\[)|(\])|(\([http\/].*?\))|(\*?)|(\<.*?\>.*?\<\/.*?\>)|(\-)|(\|)(\r)|(\n)|(\<img src=.*?\>)/g, "").
            split(' ').
            map(str => str.trim()).
            filter(str => str != "").
            slice(0, length).join(" ").trim();
    }

    thumbnailParser = (md) => {
        //match first image in the markdown file, otherwise will use default image
        let images = md.match(/\!\[.*\]\(http.*\)\s/) || [""];
        let image = (images[0].match(/http.*(?=\))/) || [""])[0];
        return image.length > 5 ? image : this.defaultThumbnail;
    }

    getSearchIndex = (mds) => {
        let titleDoc = [];
        mds.forEach((md) => {
            titleDoc.push(
                {
                    "title": md.metas.title,
                    "categories": md.metas.categories,
                    "tags": md.metas.tags,
                    "date": md.metas.date,
                    "excerpt": md.excerpt
                }
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
                        //check if the md has the meta data
                        const excerpt = this.excerptParser(md, this.excerptLength);
                        let metas = {};
                        let metaStrs = md.split("---")[1];
                        metaStrs.split("\n").forEach((metaStr) => {
                            let metaArray = metaStr.split("\n")[0].split(":");
                            if (metaArray.length == 2) {
                                let metaName = metaArray[0].trim().toLowerCase();
                                let metaValue = metaArray[1].toLowerCase().trim();
                                if (metaName == "categories" || metaName == "tags") {
                                    metaValue = metaValue.split(",").map(o => o.trim());
                                }
                                metas[metaName] = metaValue;
                            }
                        });
                        if (!metas["thumbnail"]) {
                            //add default thumbnail
                            metas["thumbnail"] = this.thumbnailParser(md);
                        }
                        let returnFlag = true;
                        this.mustHaveMetas.forEach(meta => {
                            //all must have metas are required
                            if (metas[meta] == null) {
                                returnFlag = false;
                            }
                        })
                        if (returnFlag) {
                            return { "metas": metas, "content": md.split("---").slice(2, 99999).join("---"), "excerpt": excerpt + " ......", "path": path };
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

