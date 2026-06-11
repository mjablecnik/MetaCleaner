/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Feature_Fastdesc1Inputs */

const en_auth_login_feature_fastdesc1 = /** @type {(inputs: Auth_Login_Feature_Fastdesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hundreds of files per second`)
};

const cs_auth_login_feature_fastdesc1 = /** @type {(inputs: Auth_Login_Feature_Fastdesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stovky souborů za sekundu`)
};

/**
* | output |
* | --- |
* | "Hundreds of files per second" |
*
* @param {Auth_Login_Feature_Fastdesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_fastdesc1 = /** @type {((inputs?: Auth_Login_Feature_Fastdesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Fastdesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_feature_fastdesc1(inputs)
	return cs_auth_login_feature_fastdesc1(inputs)
});
export { auth_login_feature_fastdesc1 as "auth.login.feature.fastDesc" }