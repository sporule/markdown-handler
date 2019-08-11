import MarkdownHandler from "../src/index";


test("mds content can be properly returned",()=>{
    const paths = ["https://www.dealself.com/posts/budget-airpods-redmi-airdots-review_2019-07-09.md"];
    var fetch = jest.fn(() => Promise.resolve({
        ok: true,
        status,
        text:()=>{
            return '# hello';
       },
    }));
    //to be completed
})