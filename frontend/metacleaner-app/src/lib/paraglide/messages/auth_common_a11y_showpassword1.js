/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_A11y_Showpassword1Inputs */

const en_auth_common_a11y_showpassword1 = /** @type {(inputs: Auth_Common_A11y_Showpassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Show password`)
};

const cs_auth_common_a11y_showpassword1 = /** @type {(inputs: Auth_Common_A11y_Showpassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zobrazit heslo`)
};

/**
* | output |
* | --- |
* | "Show password" |
*
* @param {Auth_Common_A11y_Showpassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_a11y_showpassword1 = /** @type {((inputs?: Auth_Common_A11y_Showpassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_A11y_Showpassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_a11y_showpassword1(inputs)
	return cs_auth_common_a11y_showpassword1(inputs)
});
export { auth_common_a11y_showpassword1 as "auth.common.a11y.showPassword" }