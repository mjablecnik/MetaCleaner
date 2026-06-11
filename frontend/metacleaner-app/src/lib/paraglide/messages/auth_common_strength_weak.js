/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Strength_WeakInputs */

const en_auth_common_strength_weak = /** @type {(inputs: Auth_Common_Strength_WeakInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Weak`)
};

const cs_auth_common_strength_weak = /** @type {(inputs: Auth_Common_Strength_WeakInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Slabé`)
};

/**
* | output |
* | --- |
* | "Weak" |
*
* @param {Auth_Common_Strength_WeakInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_weak = /** @type {((inputs?: Auth_Common_Strength_WeakInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_WeakInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_strength_weak(inputs)
	return cs_auth_common_strength_weak(inputs)
});
export { auth_common_strength_weak as "auth.common.strength.weak" }