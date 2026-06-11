/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Feature_Fastbadge1Inputs */

const en_auth_login_feature_fastbadge1 = /** @type {(inputs: Auth_Login_Feature_Fastbadge1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fast`)
};

const cs_auth_login_feature_fastbadge1 = /** @type {(inputs: Auth_Login_Feature_Fastbadge1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rychlé`)
};

/**
* | output |
* | --- |
* | "Fast" |
*
* @param {Auth_Login_Feature_Fastbadge1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_fastbadge1 = /** @type {((inputs?: Auth_Login_Feature_Fastbadge1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Fastbadge1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_feature_fastbadge1(inputs)
	return cs_auth_login_feature_fastbadge1(inputs)
});
export { auth_login_feature_fastbadge1 as "auth.login.feature.fastBadge" }