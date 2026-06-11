/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Nav_LogoutInputs */

const en_common_nav_logout = /** @type {(inputs: Common_Nav_LogoutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Log out`)
};

const cs_common_nav_logout = /** @type {(inputs: Common_Nav_LogoutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Odhlásit se`)
};

/**
* | output |
* | --- |
* | "Log out" |
*
* @param {Common_Nav_LogoutInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_logout = /** @type {((inputs?: Common_Nav_LogoutInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_LogoutInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_nav_logout(inputs)
	return cs_common_nav_logout(inputs)
});
export { common_nav_logout as "common.nav.logout" }