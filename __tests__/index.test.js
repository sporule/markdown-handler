import MarkdownHandler from "../src/index";
global.fetch = require('jest-fetch-mock');


describe("MardownHandler Test: index.js",()=>{
    test("MarkdownHandler.dateParser(): Date should be extracted from path", () => {
        const path = "https://www.dealself.com/posts/this-is-test-link_2019-07-09.md";
        const expected = new Date("2019-07-09").toDateString();
        const actual = MarkdownHandler.dateParser(path).toDateString();
        expect(actual).toBe(expected);
    });
    
    test("MarkdownHandler.titleParser():first h2 should be extracted as title from markdown content", () => {
        const md = `## This is a test, this is the first title
        Some random words in the middle.
        [abc](https://test.com)
        ### This is a test, this is the second title
        `;
        const expected = "This is a test, this is the first title";
        const actual = MarkdownHandler.titleParser(md);
        expect(actual).toBe(expected);
    });
    
    
    test("MarkdownHandler.linkParser(): Link should be extracted from path", () => {
        const path = "https://www.dealself.com/posts/this-is-test-link_2019-07-09.md";
        const route = "/posts/";
        const expected = route + "this-is-test-link_2019-07-09";
        const actual = MarkdownHandler.linkParser(route, path);
        expect(actual).toBe(expected);
    });
    
    
    
    test("MarkdownHandler.excerptParser(): Excerpt should be extracted from md content with selected length", () => {
        const md = `## This is a test, this is the first title
        Some random words in the middle.
        ![abc](https://test.com)
        ### This is a test, this is the second title
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
        ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
        `;
        const length = 10;
        const expected = "Some random words in the middle. Lorem ipsum dolor sit";
        const actual = MarkdownHandler.excerptParser(md, length);
        expect(actual).toBe(expected);
    });
    
    
    test("MarkdownHandler.thumbnailParser(): Thumbnail should be the first image extracted from md content", () => {
        const md = `## This is a test, this is the first title
        Some random words in the middle.
        ![abc](https://testa.com)
        ![abc](https://testb.com)
        ### This is a test, this is the second title
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
        ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
        `;
        const expected = "https://testa.com";
        const actual = MarkdownHandler.thumbnailParser(md);
        expect(actual).toBe(expected);
    });
    
    describe("MarkdownHandler.loadMds()", ()=>{
        const mdContent = `## This is a test, this is the first title
            Some random words in the middle.
            ![abc](https://testa.com)
            ![abc](https://testb.com)
            ### This is a test, this is the second title
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et 
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
            fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
            `
            fetch.mockResponseOnce(mdContent);
            const paths = ["https://www.abc.com/hello_1987-12-05.md","https://www.abc.com/hello_1987-11-05.md","https://www.abc.com/hello_1987-10-05.md"];  
        test("Data should be extracted from path", () => { 
            const actual ={"title": "This is a test, this is the first title", "content": mdContent, "date": "1987-12-05", "excerpt": "Some random words in the middle. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ......", thumbnail: "https://testa.com", "link": "/posts/hello_1987-12-05" }
            return MarkdownHandler.loadMds(paths,1).then(mds=>{
                const expected = mds.items[0]
                expect(actual).toEqual(expected);
            });        
        });
        test("Date should be sorted in desc as default", () => { 
            const actual ="1987-12-05";
            return MarkdownHandler.loadMds(paths,1).then(mds=>{
                const expected = mds.items[0].date
                expect(actual).toBe(expected);
            });        
        });
    })    
})