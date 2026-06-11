/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_Submit_IdleInputs */

const en_auth_login_submit_idle = /** @type {(inputs: Auth_Login_Submit_IdleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in`)
};

const cs_auth_login_submit_idle = /** @type {(inputs: Auth_Login_Submit_IdleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přihlásit se`)
};

/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Login_Submit_IdleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_submit_idle = /** @type {((inputs?: Auth_Login_Submit_IdleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Submit_IdleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_submit_idle(inputs)
	return cs_auth_login_submit_idle(inputs)
});
export { auth_login_submit_idle as "auth.login.submit.idle" }