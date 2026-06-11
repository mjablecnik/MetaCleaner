/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Nav_RememberedInputs */

const en_auth_common_nav_remembered = /** @type {(inputs: Auth_Common_Nav_RememberedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remembered?`)
};

const cs_auth_common_nav_remembered = /** @type {(inputs: Auth_Common_Nav_RememberedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vzpomněli jste si?`)
};

/**
* | output |
* | --- |
* | "Remembered?" |
*
* @param {Auth_Common_Nav_RememberedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_remembered = /** @type {((inputs?: Auth_Common_Nav_RememberedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_RememberedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_nav_remembered(inputs)
	return cs_auth_common_nav_remembered(inputs)
});
export { auth_common_nav_remembered as "auth.common.nav.remembered" }