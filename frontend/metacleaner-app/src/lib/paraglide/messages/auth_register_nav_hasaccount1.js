/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Nav_Hasaccount1Inputs */

const en_auth_register_nav_hasaccount1 = /** @type {(inputs: Auth_Register_Nav_Hasaccount1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Already have an account?`)
};

const cs_auth_register_nav_hasaccount1 = /** @type {(inputs: Auth_Register_Nav_Hasaccount1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Již máte účet?`)
};

/**
* | output |
* | --- |
* | "Already have an account?" |
*
* @param {Auth_Register_Nav_Hasaccount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_nav_hasaccount1 = /** @type {((inputs?: Auth_Register_Nav_Hasaccount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Nav_Hasaccount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_nav_hasaccount1(inputs)
	return cs_auth_register_nav_hasaccount1(inputs)
});
export { auth_register_nav_hasaccount1 as "auth.register.nav.hasAccount" }