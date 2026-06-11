/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_A11y_Hidepassword1Inputs */

const en_auth_common_a11y_hidepassword1 = /** @type {(inputs: Auth_Common_A11y_Hidepassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hide password`)
};

const cs_auth_common_a11y_hidepassword1 = /** @type {(inputs: Auth_Common_A11y_Hidepassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skrýt heslo`)
};

/**
* | output |
* | --- |
* | "Hide password" |
*
* @param {Auth_Common_A11y_Hidepassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_a11y_hidepassword1 = /** @type {((inputs?: Auth_Common_A11y_Hidepassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_A11y_Hidepassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_a11y_hidepassword1(inputs)
	return cs_auth_common_a11y_hidepassword1(inputs)
});
export { auth_common_a11y_hidepassword1 as "auth.common.a11y.hidePassword" }