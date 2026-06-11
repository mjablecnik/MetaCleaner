/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Success_Description1Inputs */

const en_auth_forgotpassword_success_description1 = /** @type {(inputs: Auth_Forgotpassword_Success_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your password has been successfully changed. You can now sign in.`)
};

const cs_auth_forgotpassword_success_description1 = /** @type {(inputs: Auth_Forgotpassword_Success_Description1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vaše heslo bylo úspěšně změněno. Nyní se můžete přihlásit.`)
};

/**
* | output |
* | --- |
* | "Your password has been successfully changed. You can now sign in." |
*
* @param {Auth_Forgotpassword_Success_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_success_description1 = /** @type {((inputs?: Auth_Forgotpassword_Success_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Success_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_success_description1(inputs)
	return cs_auth_forgotpassword_success_description1(inputs)
});
export { auth_forgotpassword_success_description1 as "auth.forgotPassword.success.description" }