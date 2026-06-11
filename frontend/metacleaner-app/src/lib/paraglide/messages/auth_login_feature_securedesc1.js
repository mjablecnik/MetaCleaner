/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Feature_Securedesc1Inputs */

const en_auth_login_feature_securedesc1 = /** @type {(inputs: Auth_Login_Feature_Securedesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files stay private and ready to share.`)
};

const cs_auth_login_feature_securedesc1 = /** @type {(inputs: Auth_Login_Feature_Securedesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soubory zůstávají soukromé a připravené ke sdílení.`)
};

/**
* | output |
* | --- |
* | "Files stay private and ready to share." |
*
* @param {Auth_Login_Feature_Securedesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_securedesc1 = /** @type {((inputs?: Auth_Login_Feature_Securedesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Securedesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_feature_securedesc1(inputs)
	return cs_auth_login_feature_securedesc1(inputs)
});
export { auth_login_feature_securedesc1 as "auth.login.feature.secureDesc" }