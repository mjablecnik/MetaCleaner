/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Feature_Securebadge1Inputs */

const en_auth_login_feature_securebadge1 = /** @type {(inputs: Auth_Login_Feature_Securebadge1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`E2E`)
};

const cs_auth_login_feature_securebadge1 = /** @type {(inputs: Auth_Login_Feature_Securebadge1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`E2E`)
};

/**
* | output |
* | --- |
* | "E2E" |
*
* @param {Auth_Login_Feature_Securebadge1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_securebadge1 = /** @type {((inputs?: Auth_Login_Feature_Securebadge1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Securebadge1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_feature_securebadge1(inputs)
	return cs_auth_login_feature_securebadge1(inputs)
});
export { auth_login_feature_securebadge1 as "auth.login.feature.secureBadge" }