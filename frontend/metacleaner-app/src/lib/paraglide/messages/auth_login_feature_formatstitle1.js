/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Feature_Formatstitle1Inputs */

const en_auth_login_feature_formatstitle1 = /** @type {(inputs: Auth_Login_Feature_Formatstitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Multiple formats`)
};

const cs_auth_login_feature_formatstitle1 = /** @type {(inputs: Auth_Login_Feature_Formatstitle1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Více formátů`)
};

/**
* | output |
* | --- |
* | "Multiple formats" |
*
* @param {Auth_Login_Feature_Formatstitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_formatstitle1 = /** @type {((inputs?: Auth_Login_Feature_Formatstitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Formatstitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_feature_formatstitle1(inputs)
	return cs_auth_login_feature_formatstitle1(inputs)
});
export { auth_login_feature_formatstitle1 as "auth.login.feature.formatsTitle" }