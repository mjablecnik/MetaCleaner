/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Feature_Fasttitle1Inputs */

const en_auth_login_feature_fasttitle1 = /** @type {(inputs: Auth_Login_Feature_Fasttitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fast cleaning`)
};

const cs_auth_login_feature_fasttitle1 = /** @type {(inputs: Auth_Login_Feature_Fasttitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rychlé čištění`)
};

/**
* | output |
* | --- |
* | "Fast cleaning" |
*
* @param {Auth_Login_Feature_Fasttitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_fasttitle1 = /** @type {((inputs?: Auth_Login_Feature_Fasttitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Fasttitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_feature_fasttitle1(inputs)
	return cs_auth_login_feature_fasttitle1(inputs)
});
export { auth_login_feature_fasttitle1 as "auth.login.feature.fastTitle" }