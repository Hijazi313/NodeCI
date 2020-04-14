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


test('Launch A Browser', async () => {

    const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    // const text = await getContentsOf('a.brand-logo')
    expect(text).toEqual('Blogster');

})


test('click login  starts  oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);

})


test('When Signed in, shows logout button', async () => {
    await page.login();
    // const text = await getContentsOf('a[href="/auth/logout"]')
    const text = await page.$eval('a[href="/auth/logout"]', el =>
        el.innerHTML
    )
    expect(text).toEqual('Logout')

})