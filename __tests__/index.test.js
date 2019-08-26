import MarkdownHandler from "../src/index";
global.fetch = require('jest-fetch-mock');


describe("MardownHandler Test: index.js",()=>{
    test("MarkdownHandler.dateParser(): Date should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/this-is-test-link_2019-07-09.md";
        const expected = new Date("2019-07-09").toDateString();
        const actual = MarkdownHandler.dateParser(path).toDateString();
        expect(actual).toBe(expected);
    });
    
    test("MarkdownHandler.titleParser():title should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/this-is-test-link_2019-07-09.md"
        const expected = "this is test link";
        const actual = MarkdownHandler.titleParser(path);
        expect(actual).toBe(expected);
    });
    
    
    test("MarkdownHandler.linkParser(): Link should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/this-is-test-link_2019-07-09@fun.md";
        const route = "/posts/";
        const expected = route + "/this-is-test-link_2019-07-09@fun";
        const actual = MarkdownHandler.linkParser(route, path);
        expect(actual).toBe(expected);
    });

    test("MarkdownHandler.categoryParser(): Category should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/this-is-test-link_2019-07-09@fun.md";
        const expected = "fun";
        const actual = MarkdownHandler.categoryParser(path);
        expect(actual).toBe(expected);
    });
    
    
    test("MarkdownHandler.tagsParser(): Tags should be extracted from path", () => {
        const path = "https://www.sporule.com/posts/this-is-test-link_2019-07-09_happy,fun@fun.md";
        const expected = ["happy","fun"];
        const actual = MarkdownHandler.tagsParser(path);
        expect(actual).toEqual(expected);
    });
    
    
    test("MarkdownHandler.excerptParser(): Excerpt should be extracted from md content with selected length", () => {
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
        const actual = MarkdownHandler.excerptParser(md, length);
        expect(actual).toBe(expected);
    });
    
    
    test("MarkdownHandler.thumbnailParser(): Thumbnail should be the first image extracted from md content", () => {
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
        `;
        const expected = "https://testa.com";
        const actual = MarkdownHandler.thumbnailParser(md);
        expect(actual).toBe(expected);
    });
    
    describe("MarkdownHandler.loadMds()", ()=>{
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
            const paths = ["https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md"];  

        test("Data should be extracted from path", () => { 
            const actual ={"title": "hello", "content": mdContent,"tags":["happy","fun"],"category":"abc", "date": "1987-12-05", "excerpt": "Some random words in the middle. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ......", thumbnail: "https://testa.com", "link": "/posts/hello_1987-12-05_happy,fun@abc" }
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

        test("Default per page is 8, so has previous page and has next page should be false",()=>{
            return MarkdownHandler.loadMds(paths,1).then(mds=>{
                const expectedPrev = mds.hasPrevPage;
                const expectedNext = mds.hasNextPage;
                expect(false).toEqual(expectedPrev);
                expect(false).toEqual(expectedNext);
            });        
        })

        test("We only have 3 posts, so invalid page should return true as we are loading page 3",()=>{
            return MarkdownHandler.loadMds(paths,3).then(mds=>{
                const expected = mds.invalidPage;
                expect(true).toEqual(expected);
            });        
        })

        test("Temp paths has more than 8 posts, we are in page 1 so hasNextPage should be true ",()=>{
            const tempPaths = ["https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md"];  
            return MarkdownHandler.loadMds(tempPaths,1).then(mds=>{
                const expected = mds.hasNextPage;
                expect(true).toEqual(expected);
            });        
        })

        test("Temp paths has more than 8 posts, we are in page 2 so hasPrevPage should be true ",()=>{
            const tempPaths = ["https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md","https://www.sporule.com/hello_1987-12-05_happy,fun@abc.md"];  
            return MarkdownHandler.loadMds(tempPaths,2).then(mds=>{
                const expected = mds.hasPrevPage;
                expect(true).toEqual(expected);
            });        
        })

    })    
})