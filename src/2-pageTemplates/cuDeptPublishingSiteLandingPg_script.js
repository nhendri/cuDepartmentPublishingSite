class cuPageBase {
    constructor(xHrProps, returnxHr) {
        this.xHrProps = xHrProps;
        this.returnxHr = returnxHr;
    }
    xHr() {
        const xHrReq = new XMLHttpRequest();
        xHrReq.addEventListener('load', this.returnxHr);
        xHrReq.open(this.xHrProps.method, this.xHrProps.url);
        xHrReq.send();
    }
    xHrPromise() {
        return new Promise((resolve, reject) => {
            const xHrReq = new XMLHttpRequest();
            xHrReq.open(this.xHrProps.method, this.xHrProps.url);
            if (this.xHrProps.headers) {
                this.xHrProps.headers.forEach(el => {
                    xHrReq.setRequestHeader(el.header, el.value);
                });
            };
            xHrReq.onload = function () {
                if (xHrReq.status >= 200 && xHrReq.status <= 300) { //need to tighten this up
                    resolve(xHrReq.response)
                } else {
                    reject({
                        status: xHrReq.status,
                        errMsg: xHrReq.statusText
                    });
                }
            };
            xHrReq.onerror = function () {
                reject({
                    status: xHrReq.status,
                    errMsg: xHrReq.statusText
                });
            }
            xHrReq.send();
        });
    }
}

class cuDeptSearchSiteLandingPg extends cuPageBase {

    constructor(xHrProps, returnxHr) {
        super(xHrProps, returnxHr);
    };

    CreateQuickLinks() {
        return new Promise((resolve, reject) => {
            this.xHrPromise().then(
                result => {
                    return JSON.parse(result);
                }
            ).then(
                result => {
                    //console.log(result.value);
                    const arrIcons = result.value.map(el => {
                        return `
                        <div class="ms-Grid-col ms-sm12 ms-xl4">
                            <a href="${el.LinkURL.Url}" title="${el.Title}" target="blank">
                                <div class="cuListText">${el.Title}</div>
                                <i class="ms-Icon ms-Icon--${el.hr_IconChoiceColumn} ms-font-su"></i>
                            </a>
                        </div>
                        `
                    });
                    return arrIcons;
                }
            ).then(
                result => {
                    const finalHtml = `
                            <div class="ms-Grid cuIconContainer" dir="ltr">
                                <div class="ms-Grid-row">
                                    <div class="ms-Grid-col ms-sm12">
                                        <h2 class="ms-webpart-titleText cuQuickLinksHeader">
                                            <nobr>
                                                <span>Quick Links</span>
                                            </nobr>
                                        </h2>
                                    </div>
                                </div>
                                <div class="ms-Grid-row">
                                    ${result[0]}
                                    ${result[1]}
                                    ${result[2]}
                                </div>
                                <div class="ms-Grid-row">
                                    ${result[3]}
                                    ${result[4]}
                                    ${result[5]}
                                </div>
                            </div>
                        `;
                    resolve(finalHtml)
                }
            ).catch(
                error => reject(error)
            );
        });
    };
}

const restEndPoint = function () {
    if (typeof _spPageContextInfo === 'undefined' || _spPageContextInfo === null) {
        return {
            method: 'GET',
            url: 'http://localhost:15120/data'
        };
    };
    return {
        method: 'GET',
        url: 'https://tsps.ncsecu.local/demo/S22307N/DemoHRSite/_api/web/lists/GetByTitle(\'QuickLinksList\')/items',
        headers: [
            { 'header': 'Accept', 'value': 'application/json' },
            { 'header': 'odata', 'value': 'verbose' }
        ]
    };
};

const xHrProperties = {
    method: 'GET',
    url: 'http://localhost:15120/value'
};

const HRLandingPage = new cuDeptSearchSiteLandingPg(restEndPoint());

HRLandingPage.CreateQuickLinks().then(
    result => {
        document.getElementById('cuQuickLinksContentElement').innerHTML = result;
    }
);
