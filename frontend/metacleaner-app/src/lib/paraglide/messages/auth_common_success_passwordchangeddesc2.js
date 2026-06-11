/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Success_Passwordchangeddesc2Inputs */

const en_auth_common_success_passwordchangeddesc2 = /** @type {(inputs: Auth_Common_Success_Passwordchangeddesc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your password has been successfully set. You can now sign in.`)
};

const cs_auth_common_success_passwordchangeddesc2 = /** @type {(inputs: Auth_Common_Success_Passwordchangeddesc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vaše heslo bylo úspěšně nastaveno. Nyní se můžete přihlásit.`)
};

/**
* | output |
* | --- |
* | "Your password has been successfully set. You can now sign in." |
*
* @param {Auth_Common_Success_Passwordchangeddesc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_success_passwordchangeddesc2 = /** @type {((inputs?: Auth_Common_Success_Passwordchangeddesc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Success_Passwordchangeddesc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_success_passwordchangeddesc2(inputs)
	return cs_auth_common_success_passwordchangeddesc2(inputs)
});
export { auth_common_success_passwordchangeddesc2 as "auth.common.success.passwordChangedDesc" }