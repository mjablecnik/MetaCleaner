/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_GoodInputs */

const en_auth_common_strength_good = /** @type {(inputs: Auth_Common_Strength_GoodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Good`)
};

const cs_auth_common_strength_good = /** @type {(inputs: Auth_Common_Strength_GoodInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dobré`)
};

/**
* | output |
* | --- |
* | "Good" |
*
* @param {Auth_Common_Strength_GoodInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_good = /** @type {((inputs?: Auth_Common_Strength_GoodInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_GoodInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_good(inputs)
	return cs_auth_common_strength_good(inputs)
});
export { auth_common_strength_good as "auth.common.strength.good" }