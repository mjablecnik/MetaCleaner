/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Nav_Backtocode2Inputs */

const en_auth_common_nav_backtocode2 = /** @type {(inputs: Auth_Common_Nav_Backtocode2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back to code verification`)
};

const cs_auth_common_nav_backtocode2 = /** @type {(inputs: Auth_Common_Nav_Backtocode2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zpět na ověření kódu`)
};

/**
* | output |
* | --- |
* | "Back to code verification" |
*
* @param {Auth_Common_Nav_Backtocode2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_backtocode2 = /** @type {((inputs?: Auth_Common_Nav_Backtocode2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_Backtocode2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_nav_backtocode2(inputs)
	return cs_auth_common_nav_backtocode2(inputs)
});
export { auth_common_nav_backtocode2 as "auth.common.nav.backToCode" }