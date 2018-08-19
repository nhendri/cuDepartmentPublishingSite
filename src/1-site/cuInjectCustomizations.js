class InjectCustomization {
    // Absolute URL = should be passed as _spPageContextInfo.webAbsoluteUrl
    // libraryURL = should be passed as the relative url for the library, including the subdirectory, where the customizations reside
    // templateConfig = an array with the following structure: [['customClassName',['libraryName']],['',['libraryName']]]

    //TODO: add unit tests to this project :)

    constructor(absoluteURL, libraryURL, templateConfig) {
        this.absoluteURL = absoluteURL;
        this.libraryURL = libraryURL;
        this.templateConfig = templateConfig;
    };

    resourceURL(resource) { return `${this.absoluteURL}/${this.libraryURL}/${resource}` };

    inEditMode() { return document.getElementById('MSOLayout_InDesignMode').value || '0 - not in design mode' };

    styleElement(url) {
        const customStyle = document.createElement('link');
        customStyle.type = 'text/css';
        customStyle.rel = 'stylesheet';
        customStyle.href = url;
        return customStyle;
    };

    scriptElement(url) {
        const customScript = document.createElement('script');
        customScript.type = 'text/javascript';
        customScript.src = url;
        return customScript;
    };

    pageElements() {
        const pageElements = [];
        this.templateConfig.forEach(el => {
            if (document.getElementsByClassName(el[0]).length > 0) {
                console.log(`Yep, we are on a page with class ${el[0]}. Sweet!`);
                if (el[1].length > 0) {
                    el[1].forEach(fl => {
                        if (fl.substr(fl.lastIndexOf('.') + 1) === 'css') {
                            pageElements.push(this.styleElement(this.resourceURL(fl)));
                        };
                        /* if (fl.substr(fl.lastIndexOf('.') + 1) === 'js') {
                            pageElements.push(this.scriptElement(this.resourceURL(fl)));
                        }; */
                    });
                };
                pageElements.push(this.styleElement(this.resourceURL(`${el[0]}_Style.css`))); //NEED TO FIX THIS - NO HARD CODING ANY PART OF THE NAME PLX AND TNX
                //pageElements.push(this.scriptElement(this.resourceURL(`${el[0]}_Script.js`)));
            } else {
                console.log(`Nope, we do not appear to be on a page with class ${el[0]}. Bummer.`);
            };
        });
        return pageElements;
    };

    RegisterSPOnDemandArr() {
        const pageScripts = [];
        this.templateConfig.forEach(el => {
            if (document.getElementsByClassName(el[0]).length > 0) {
                const pageFL = el[1].filter(value => { return value.indexOf('.js') > -1 });
                pageFL.forEach(el => pageScripts.push([el, this.resourceURL(el), 1, 1]));
                pageScripts.push([`${el[0]}_script.js`, this.resourceURL(`${el[0]}_script.js`), 0, 1]);
            }
        });
        return pageScripts;
    };
};

const cuPagesCustomizations = function () {
    const customTemplates = [ // this is locally coded for now because i don't feel like bundling this code - yet. but i will soon, and then this obj will be imported from siteConfig.json
        { customClass: 'cuDeptPublishingSiteLandingPg', libraryURL: 'style%20library/cuSiteResources', libraryFolder: "Style Library/cuSiteResources", librariesFrameworks: ['fabric.min.css', 'polyfill.min.js'] },
        { customClass: 'cuDeptPublishingSiteHelpPg', libraryURL: 'style%20library/cuSiteResources', libraryFolder: "Style Library/cuSiteResources", librariesFrameworks: ['fabric.min.css'] }
    ];

    customTemplates.forEach(el => {
        const customizePage = new InjectCustomization(_spPageContextInfo.webAbsoluteUrl, el.libraryURL, [[el.customClass, el.librariesFrameworks]]);
        customizePage.inEditMode() === '1' ?
            null :
            customizePage.pageElements().forEach(el => {
                document.getElementsByTagName('head')[0].appendChild(el);
            });
        customizePage.RegisterSPOnDemandArr().forEach(el => SP.SOD.registerSod(el[0], el[1]));
        const dependencyJS = customizePage.RegisterSPOnDemandArr().filter(value => { return value[2] === 1 });
        const nonDependencyJS = customizePage.RegisterSPOnDemandArr().filter(value => { return value[2] === 0 });
        nonDependencyJS.forEach(el => {
            const arrDependencyMap = dependencyJS.map(fl => {
                if (el[3] === fl[3]) {
                    return [el[0], fl[0]]
                };
            });
            arrDependencyMap.forEach(el => {
                SP.SOD.registerSodDep(el[0], el[1]);
                SP.SOD.executeFunc(el[0], null, () => console.log(`finished loading ${el[0]} with dependency ${el[1]}!`));
            });
        });
    });
    return true;
};

_spBodyOnLoadFunctionNames.push('cuPagesCustomizations');

var checkNode = document.createElement('a');
checkNode.title = 'HR Page';
checkNode.href = '/sites/hr'

document.getElementById('DeltaPlaceHolderPageTitleInTitleArea').contains('<a title="HR Page" href="/sites/hr/leave">HR Page</a>');