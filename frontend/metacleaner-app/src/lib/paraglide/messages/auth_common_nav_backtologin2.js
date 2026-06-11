/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Nav_Backtologin2Inputs */

const en_auth_common_nav_backtologin2 = /** @type {(inputs: Auth_Common_Nav_Backtologin2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back to sign in`)
};

const cs_auth_common_nav_backtologin2 = /** @type {(inputs: Auth_Common_Nav_Backtologin2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zpět na přihlášení`)
};

/**
* | output |
* | --- |
* | "Back to sign in" |
*
* @param {Auth_Common_Nav_Backtologin2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_backtologin2 = /** @type {((inputs?: Auth_Common_Nav_Backtologin2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_Backtologin2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_nav_backtologin2(inputs)
	return cs_auth_common_nav_backtologin2(inputs)
});
export { auth_common_nav_backtologin2 as "auth.common.nav.backToLogin" }