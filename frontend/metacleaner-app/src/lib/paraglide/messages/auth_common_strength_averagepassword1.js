/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_Averagepassword1Inputs */

const en_auth_common_strength_averagepassword1 = /** @type {(inputs: Auth_Common_Strength_Averagepassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Average password`)
};

const cs_auth_common_strength_averagepassword1 = /** @type {(inputs: Auth_Common_Strength_Averagepassword1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Průměrné heslo`)
};

/**
* | output |
* | --- |
* | "Average password" |
*
* @param {Auth_Common_Strength_Averagepassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_averagepassword1 = /** @type {((inputs?: Auth_Common_Strength_Averagepassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Averagepassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_averagepassword1(inputs)
	return cs_auth_common_strength_averagepassword1(inputs)
});
export { auth_common_strength_averagepassword1 as "auth.common.strength.averagePassword" }