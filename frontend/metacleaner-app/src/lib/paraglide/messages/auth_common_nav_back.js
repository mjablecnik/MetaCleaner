/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Nav_BackInputs */

const en_auth_common_nav_back = /** @type {(inputs: Auth_Common_Nav_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back`)
};

const cs_auth_common_nav_back = /** @type {(inputs: Auth_Common_Nav_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zpět`)
};

/**
* | output |
* | --- |
* | "Back" |
*
* @param {Auth_Common_Nav_BackInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_back = /** @type {((inputs?: Auth_Common_Nav_BackInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_BackInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_nav_back(inputs)
	return cs_auth_common_nav_back(inputs)
});
export { auth_common_nav_back as "auth.common.nav.back" }