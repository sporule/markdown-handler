import MarkdownHandler from "../src/index";
global.fetch = require('jest-fetch-mock');


describe("MardownHandler Test: index.js", () => {

    test("markdownHandler.excerptParser(): Excerpt should be extracted from md content with selected length", () => {
        let markdownHandler = new MarkdownHandler();
        const md = `
        Some random words in the middle.
        ![sporule](https://testa.com/abc.jpg)
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


    test("markdownHandler.thumbnailParser(): coverimage should be the first image in the post", () => {
        let markdownHandler = new MarkdownHandler();
        const md = `
        ---
        title:This is a test, this is the first title
        coverimage:abc.jpg
        tags:a,b,c,d
        categories:fun,food 
        date:2019-08-08
        --- 
        Some random words in the middle.
        ![sporule](https://testa.com/abc.jpg)
        ![sporule](https://test.com)
        ### This is a test, this is the second title
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
        ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
        `;
        const expected = "https://testa.com/abc.jpg";
        const actual = markdownHandler.thumbnailParser(md);
        expect(actual).toBe(expected);
    });

    describe("markdownHandler.loadMds()", () => {


        const paths = ["https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md", "https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md"];
        describe("All 'MUST HAVE' metas must be presented, otherwise it will not get return in items", () => {
            const md = `
            ---
            title:This is a test, this is the first title
            coverimage:abc.jpg
            tags:a,b,c,d
            categories:fun,food
            date:
            --- 
            Some random words in the middle.
            ![sporule](https://testa.com/abc.jpg)
            ![sporule](https://test.com)
            ### This is a test, this is the second title
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
            fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
            `;
            fetch.mockResponse(md);
            test("The items length should be 2 as it has all the necessary metas", () => {
                let markdownHandler = new MarkdownHandler();
                return markdownHandler.loadMds(paths).then(result => {
                    const actual = result.items.length;
                    const expected = 2;
                    expect(actual).toEqual(expected);
                });
            });
            test("The items length should return 0 as it does not have all necessary metas", () => {
                let markdownHandler = new MarkdownHandler();
                markdownHandler.mustHaveMetas = ["fun"];
                return markdownHandler.loadMds(paths).then(result => {
                    const actual = result.items.length;
                    const expected = 0;
                    expect(actual).toEqual(expected);
                });
            });
        });

        test("It should parse the meta data correctly such as title", () => {
            const md = `
            ---
            title:This is a test, this is the first title
            coverimage:abc.jpg
            tags:a,b,c,d
            categories:fun,food
            date:
            --- 
            Some random words in the middle.
            ![sporule](https://testa.com/abc.jpg)
            ![sporule](https://test.com)
            ### This is a test, this is the second title
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
            fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
            `;
            fetch.mockResponse(md);
            let markdownHandler = new MarkdownHandler();
            return markdownHandler.loadMds(paths).then(result => {
                const actual = result.items[0].metas["title"];
                const expected = "this is a test, this is the first title";
                expect(actual).toEqual(expected);
            });
        });

        describe("coverimage should be extracted from the markdown or used default coverimage", () => {
            test("coverimage should be extracted from the markdown file as it is in the markdown file ", () => {
                const md = `
                ---
                title:This is a test, this is the first title
                tags:a,b,c,d
                categories:fun,food
                date:
                --- 
                Some random words in the middle.
                ![sporule](https://testa.com/abc.jpg)
                ![sporule](https://test.com)
                ### This is a test, this is the second title
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
                ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
                `;
                fetch.mockResponse(md);
                let markdownHandler = new MarkdownHandler();
                return markdownHandler.loadMds(paths).then(result => {
                    const actual = result.items[0].metas["coverimage"];
                    const expected = "https://testa.com/abc.jpg";
                    expect(actual).toEqual(expected);
                });
            });

            test("coverimage should be the default coverimage as markdown file does not contain any image ", () => {
                const md = `
                ---
                title:This is a test, this is the first title
                tags:a,b,c,d
                categories:fun,food
                date:
                --- 
                Some random words in the middle.
                ### This is a test, this is the second title
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
                ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
                `;
                fetch.mockResponse(md);
                let markdownHandler = new MarkdownHandler();
                return markdownHandler.loadMds(paths).then(result => {
                    const actual = result.items[0].metas["coverimage"];
                    const expected = markdownHandler.defaultThumbnail;
                    expect(actual).toEqual(expected);
                });
            });

        })
    });
});