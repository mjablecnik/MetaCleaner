/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_AverageInputs */

const en_auth_common_strength_average = /** @type {(inputs: Auth_Common_Strength_AverageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Average`)
};

const cs_auth_common_strength_average = /** @type {(inputs: Auth_Common_Strength_AverageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Průměrné`)
};

/**
* | output |
* | --- |
* | "Average" |
*
* @param {Auth_Common_Strength_AverageInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_average = /** @type {((inputs?: Auth_Common_Strength_AverageInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_AverageInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_average(inputs)
	return cs_auth_common_strength_average(inputs)
});
export { auth_common_strength_average as "auth.common.strength.average" }