// Import CustomPage class
const Page = require('./helpers/page');


let page;

// Jest lifecycle methods
beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
})

afterEach(async () => {
    await page.close()
})


// A describe is a group tests of common  functionality
// Allow us to nest different tests to describe different nested branches of behavior inside our application
// I t is a global function  provided by jest
describe('When Logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating')
    })

    test('Can see Create  Blog form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title')

    })

    describe('And Using valid inputs', async () => {

        beforeEach(async () => {
            await page.type('.title input', 'My Title ');
            await page.type('.content input', 'My  Content');
            await page.click('form button');
        })

        test('Submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries')

        })

        test('submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p');
            // @Assertion
            expect(title).toEqual('My Title ')
            expect(content).toEqual('My  Content')

        })
    })
    describe('And Using invalid inputs ', async () => {
        beforeEach(async () => {
            await page.click('form button');

        })
        test('the form shows an error message ', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value')


        })
    })

})

describe('User is not logged in', async () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'T',
                content: 'C'
            }
        }
    ];
    test('Blog related action are prohibited ', async () => {
        const results = await page.execRequests(actions)

        for (let result of results) {
            expect(result).toEqual({ error: 'You must log in!' })

        }

    })

})