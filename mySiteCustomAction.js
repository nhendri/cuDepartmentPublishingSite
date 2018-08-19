class JSLinkSiteCustomization {
	constructor(targetClass = 'universal', resourceArray) {
		this.targetClass = targetClass;
		this.resourceArray = resourceArray;
	};

	SiteBaseUrl() { return _spPageContextInfo.webAbsoluteUrl || 'COULD NOT FIND _spPageContextInfo.webAbsoluteUrl' };

	StyleElement(url) {
		const customStyle = document.createElement('link');
		customStyle.type = 'text/css';
		customStyle.rel = 'stylesheet';
		customStyle.href = url;
		return customStyle;
	};

	ScriptElement(url) {
		const customScript = document.createElement('script');
		customScript.type = 'text/javascript';
		customScript.src = url;
		return customScript;
	};

	ResourceUrls() { //create flat array of all resources from dependency objects
		const finalArr = [];
		this.resourceArray.forEach(el => {
			Object.keys(el).forEach(fl => {
				finalArr.push(el[fl]);
			});
		});
		return finalArr;
	};

	CustomizationElements() {
		const pageElements = [];
		this.ResourceUrls().forEach(el => {
			if (el.substr(el.lastIndexOf('.') + 1) === 'css') {
				pageElements.push(this.StyleElement(`${this.SiteBaseUrl()}${el}`))
			};
			if (el.substr(el.lastIndexOf('.') + 1) === 'js') {
				pageElements.push(this.ScriptElement(`${this.SiteBaseUrl()}${el}`))
			};
		});
		return pageElements;
	}

}

const siteCustomizations = [ //configuration array. someday all of these will come from config files, when we finally get around to seriously bundling these scripts.
	{ targetClass: 'universal', resourceArray: [{ dependency: '/SiteAssets/fabric.min.css' }, { dependency: '/SiteAssets/prism.css' }, { dependency: '/SiteAssets/prism.js' }] },
	//{ targetClass: 'cuCustomClass', resourceArray: [{ dependency: '/SiteAssets/vendor.min.js', dependent: '/SiteAssets/myScript.js' }, { dependency: '/SiteAssets/myStyle.css' }] } //little test entry into config file :)
];

const bla = [
	{
		targetClass: 'universal',
	}
]

const addAllCustomizations = function () {
	siteCustomizations.forEach(el => {
		const injectResource = new JSLinkSiteCustomization(el.targetClass, el.resourceArray);
		injectResource.CustomizationElements().forEach(el => {
			document.getElementsByTagName('head')[0].appendChild(el);
		});
	});
	return true;
};

_spBodyOnLoadFunctionNames.push('addAllCustomizations');