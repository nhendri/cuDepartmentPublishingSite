module.exports = (page, root) => {
    const rootSrcDir = 'src\\';
    const rootDistDir = 'dist\\';
    if (root === 'src') {
        return {
            pageLayouts: `${rootSrcDir}1-pageLayouts\\`,
            pages: `${rootSrcDir}2-pages\\${page}\\`,
            cewp: `${rootSrcDir}3-cewpApps\\${page}\\`,
            utilsPartials: `${rootSrcDir}4-utilsPartials\\`
        }
    };
    if (root === 'dist') {
        return {
            pageLayouts: `${rootDistDir}1-pageLayouts\\`,
            pages: `${rootDistDir}2-pages\\${page}\\`,
            cewp: `${rootDistDir}3-cewpApps\\${page}\\`,
            utilsPartials: `${rootDistDir}4-utilsPartials\\`
        }
    };
    return {};
};