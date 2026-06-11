/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_Couldbestronger2Inputs */

const en_auth_common_strength_couldbestronger2 = /** @type {(inputs: Auth_Common_Strength_Couldbestronger2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could be stronger`)
};

const cs_auth_common_strength_couldbestronger2 = /** @type {(inputs: Auth_Common_Strength_Couldbestronger2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mohlo by být silnější`)
};

/**
* | output |
* | --- |
* | "Could be stronger" |
*
* @param {Auth_Common_Strength_Couldbestronger2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_couldbestronger2 = /** @type {((inputs?: Auth_Common_Strength_Couldbestronger2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Couldbestronger2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_couldbestronger2(inputs)
	return cs_auth_common_strength_couldbestronger2(inputs)
});
export { auth_common_strength_couldbestronger2 as "auth.common.strength.couldBeStronger" }