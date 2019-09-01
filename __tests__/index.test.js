import MarkdownHandler from "../src/index";
global.fetch = require('jest-fetch-mock');


describe("MardownHandler Test: index.js", () => {
    let markdownHandler = new MarkdownHandler();
    test("markdownHandler.dateParser(): Date should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/this-is-test-link_2019-07-09.md";
        const expected = new Date("2019-07-09").toDateString();
        const actual = markdownHandler.dateParser(path).toDateString();
        expect(actual).toBe(expected);
    });

    test("markdownHandler.titleParser():title should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/this-is-test-link_2019-07-09.md"
        const expected = "this is test link";
        const actual = markdownHandler.titleParser(path);
        expect(actual).toBe(expected);
    });


    test("markdownHandler.linkParser(): Link should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/this-is-test-link_2019-07-09@fun.md";
        const route = "/posts/";
        const expected = route + "this-is-test-link";
        const actual = markdownHandler.linkParser(route, path);
        expect(actual).toBe(expected);
    });

    test("markdownHandler.categoryParser(): Category should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/@this-is-test-link_2019-07-09@fun.md";
        const expected = "fun";
        const actual = markdownHandler.categoryParser(path);
        expect(actual).toBe(expected);
    });


    test("markdownHandler.tagsParser(): Tags should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/this-is-test-link_2019-07-09_happy,fun@fun.md";
        const expected = ["happy", "fun"];
        const actual = markdownHandler.tagsParser(path);
        expect(actual).toEqual(expected);
    });

    test("markdownHandler.pinnedParser(): title starts with @ should be pinned", () => {
        const path = "https://www.sporule.com/posts/@this-is-pinned-test-link_2019-07-09_happy,fun@fun.md";
        const expected = true;
        const actual = markdownHandler.pinnedParser(path);
        expect(actual).toEqual(expected);
    });


    test("markdownHandler.excerptParser(): Excerpt should be extracted from md content with selected length", () => {
        const md = `## This is a test, this is the first title
        Some random words in the middle.
        ![sporule](https://test.com)
        ### This is a test, this is the second title
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
        ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
        `;
        const length = 10;
        const expected = "Some random words in the middle. Lorem ipsum dolor sit";
        const actual = markdownHandler.excerptParser(md, length);
        expect(actual).toBe(expected);
    });


    test("markdownHandler.thumbnailParser(): Thumbnail should be extracted from thumbnail keyword", () => {
        const md = `## This is a test, this is the first title
        Some random words in the middle.
        ![sporule](https://testa.com)
        ![sporule](https://testb.com)
        ### This is a test, this is the second title
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
        ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
        [https://image.ext|thumbnail]
        `;
        const expected = "https://image.ext";
        const actual = markdownHandler.thumbnailParser(md);
        expect(actual).toBe(expected);
    });

    test("markdownHandler.categoryFilter(): It should return with path if they are in selected category", () => {
        const paths = ["https://www.sporule.com/posts/this-is-test-link_2019-07-09_happy,fun@fun.md", "https://www.sporule.com/posts/this-is-test-link_2019-07-09_happy,fun@study.md"];
        const expected = "https://www.sporule.com/posts/this-is-test-link_2019-07-09_happy,fun@fun.md";
        markdownHandler.filterCategories = ["fun"];
        const actual = markdownHandler.categoryFilter(paths)[0];
        markdownHandler.filterCategories = [];
        expect(actual).toEqual(expected);

    });

    test("markdownHandler.tagFilter(): It should return with path if they have the selected tags", () => {
        const paths = ["https://www.sporule.com/posts/this-is-test-link_2019-07-09_happy,fun@fun.md", "https://www.sporule.com/posts/this-is-test-link_2019-07-09_Study,fun@study.md"];
        const expected = "https://www.sporule.com/posts/this-is-test-link_2019-07-09_happy,fun@fun.md";
        markdownHandler.filterTags = ["happy", "weird"];
        const actual = markdownHandler.tagFilter(paths)[0];
        markdownHandler.filterTags = [];
        expect(actual).toEqual(expected);

    });


    test("markdownHandler.getSearchIndex(): It should return the link to the article with selected title", () => {
        const paths = ["https://www.sporule.com/posts/this-is-test-link_2019-07-09_happy,fun@fun.md", "https://www.sporule.com/posts/happy-every-day_2019-07-09_Study,fun@study.md"];
        const expected = { "link": "/posts/this-is-test-link", "title": "this is test link" };
        const actual = markdownHandler.getSearchIndex(paths).search("test")[0];
        expect(actual).toEqual(expected);

    });

    describe("markdownHandler.loadMds()", () => {
        const mdContent = `## This is a test, this is the first title
            Some random words in the middle.
            ![sporule](https://testa.com)
            ![sporule](https://testb.com)
            ### This is a test, this is the second title
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
            fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
            `
        fetch.mockResponseOnce(mdContent);
        const paths = ["https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md"];

        test("Data should be extracted from path", () => {
            const actual = { "title": "hello", "pinned": false, "content": mdContent, "tags": ["happy", "fun"], "category": "abc", "date": "1987-12-05", "excerpt": "Some random words in the middle. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ......", thumbnail: "https://testa.com", "link": "/posts/hello" }
            return markdownHandler.loadMds(paths, 1).then(mds => {
                const expected = mds.items[0]
                expect(actual).toEqual(expected);
            });
        });

        test("Date should be sorted in desc as default", () => {
            const actual = "1987-12-05";
            return markdownHandler.loadMds(paths, 1).then(mds => {
                const expected = mds.items[0].date
                expect(actual).toBe(expected);
            });
        });

        test("Default per page is 8, so has previous page and has next page should be false", () => {
            return markdownHandler.loadMds(paths, 1).then(mds => {
                const expectedPrev = mds.hasPrevPage;
                const expectedNext = mds.hasNextPage;
                expect(false).toEqual(expectedPrev);
                expect(false).toEqual(expectedNext);
            });
        })

        test("We only have 3 posts, so invalid page should return true as we are loading page 3", () => {
            return markdownHandler.loadMds(paths, 3).then(mds => {
                const expected = mds.invalidPage;
                expect(true).toEqual(expected);
            });
        })

        test("Temp paths has more than 8 posts, we are in page 1 so hasNextPage should be true ", () => {
            const tempPaths = ["https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md"];
            return markdownHandler.loadMds(tempPaths, 1).then(mds => {
                const expected = mds.hasNextPage;
                expect(true).toEqual(expected);
            });
        })

        test("Temp paths has more than 8 posts, we are in page 2 so hasPrevPage should be true ", () => {
            const tempPaths = ["https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md"];
            return markdownHandler.loadMds(tempPaths, 2).then(mds => {
                const expected = mds.hasPrevPage;
                expect(true).toEqual(expected);
            });
        })

        test("Pinned only should return pinned paths only", () => {
            const tempPaths = ["https://www.sporule.com/@hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md"];
            markdownHandler.isPinnedOnly = true;
            return markdownHandler.loadMds(tempPaths, 1, true).then(mds => {
                const expected = mds.items.length;
                const actual = 1;
                expect(actual).toEqual(expected);
                markdownHandler.isPinnedOnly = false;
            });
        })

    })
})