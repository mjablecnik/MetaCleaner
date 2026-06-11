/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_StrongInputs */

const en_auth_common_strength_strong = /** @type {(inputs: Auth_Common_Strength_StrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Strong`)
};

const cs_auth_common_strength_strong = /** @type {(inputs: Auth_Common_Strength_StrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Silné`)
};

/**
* | output |
* | --- |
* | "Strong" |
*
* @param {Auth_Common_Strength_StrongInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_strong = /** @type {((inputs?: Auth_Common_Strength_StrongInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_StrongInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_strong(inputs)
	return cs_auth_common_strength_strong(inputs)
});
export { auth_common_strength_strong as "auth.common.strength.strong" }