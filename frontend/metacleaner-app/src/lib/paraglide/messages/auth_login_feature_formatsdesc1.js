/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Feature_Formatsdesc1Inputs */

const en_auth_login_feature_formatsdesc1 = /** @type {(inputs: Auth_Login_Feature_Formatsdesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`JPG, PNG, HEIC, MP4, MOV and more`)
};

const cs_auth_login_feature_formatsdesc1 = /** @type {(inputs: Auth_Login_Feature_Formatsdesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`JPG, PNG, HEIC, MP4, MOV a další`)
};

/**
* | output |
* | --- |
* | "JPG, PNG, HEIC, MP4, MOV and more" |
*
* @param {Auth_Login_Feature_Formatsdesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_formatsdesc1 = /** @type {((inputs?: Auth_Login_Feature_Formatsdesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Formatsdesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_feature_formatsdesc1(inputs)
	return cs_auth_login_feature_formatsdesc1(inputs)
});
export { auth_login_feature_formatsdesc1 as "auth.login.feature.formatsDesc" }